// Layer 1: technical analysis of one clip -> per-second windows -> candidate
// segments (usable ranges) and rejected ranges with reasons.
import { decode, frameSizes } from './decode.mjs'
import { focusMetrics, globalShift, histDistance, lumaStats, meanAbsDiff, projections } from './metrics.mjs'

/** Thresholds. `strictness` scales them: 'loose' | 'standard' | 'strict'. */
export const DEFAULT_THRESHOLDS = {
  // Focus (edge-width metric, see metrics.focusMetrics). Absolute values are
  // only a fallback: normally thresholds are relative to the batch reference
  // of the same camera format (75th percentile), because codec, sensor and
  // scene detail shift the absolute value. Synthetic calibration (1280-wide):
  // sharp 2.3-3.0, sigma 0.8 ~1.9 (rel 0.72), sigma 1.2 ~1.4 (0.55),
  // sigma 2.2 ~0.9 (0.34), sigma 5 ~0.4; sharp+grain 2.2, defocus+grain 0.14.
  focusGood: 2.0,
  focusWarn: 1.5,
  focusBad: 1.1,
  focusRelGood: 0.75,
  focusRelWarn: 0.6,
  focusRelBad: 0.45,
  focusRefMin: 1.3,
  // High-frequency camera jitter, % of frame width (RMS residual after 0.8 s smoothing).
  // Calibrated: static ~0.02, smooth pan ~0.04, 7px@1080p jitter ~0.30, handheld shake ~2.0.
  shakeGood: 0.12,
  shakeWarn: 0.25,
  shakeBad: 0.9,
  // Exposure
  clipHiWarn: 0.06,
  clipHiBad: 0.22,
  darkMean: 28,
  clipLoBad: 0.45,
  // Black / blank frames
  blackMean: 18,
  blackStd: 8,
  blankStd: 4,
  // Cuts
  cutHist: 0.55,
  // Segments
  minSegment: 2,
}

const STRICTNESS = {
  loose: { focus: 0.85, shake: 1.35, exposure: 1.3 },
  standard: { focus: 1, shake: 1, exposure: 1 },
  strict: { focus: 1.15, shake: 0.75, exposure: 0.8 },
}

export function resolveThresholds(options = {}) {
  const base = { ...DEFAULT_THRESHOLDS, ...(options.thresholds || {}) }
  const s = STRICTNESS[options.strictness] || STRICTNESS.standard
  return {
    ...base,
    focusGood: base.focusGood * s.focus, focusWarn: base.focusWarn * s.focus, focusBad: base.focusBad * s.focus,
    focusRelGood: base.focusRelGood * s.focus, focusRelWarn: base.focusRelWarn * s.focus, focusRelBad: base.focusRelBad * s.focus,
    shakeGood: base.shakeGood * s.shake, shakeWarn: base.shakeWarn * s.shake, shakeBad: base.shakeBad * s.shake,
    clipHiWarn: base.clipHiWarn * s.exposure, clipHiBad: base.clipHiBad * s.exposure,
    minSegment: Number(options.minSegment) > 0 ? Number(options.minSegment) : base.minSegment,
  }
}

function median(values) {
  if (!values.length) return null
  const s = [...values].sort((a, b) => a - b)
  return s[Math.floor(s.length / 2)]
}

const clamp01 = (v) => Math.max(0, Math.min(1, v))
const lerpScore = (v, bad, good) => clamp01((v - bad) / (good - bad))

/** Collect raw samples from ffmpeg frames. */
export async function sampleClip({ ffmpeg, file, meta, options = {}, signal, onProgress }) {
  const motionFps = options.motionFps || 10
  const focusFps = options.focusFps || 2
  const sizes = frameSizes(meta, { motionWidth: options.motionWidth || 480, focusWidth: options.focusWidth || 1280 })
  const motion = []
  const focus = []
  let prevGray = null, prevProj = null, prevHist = null
  let lastReport = 0
  const radius = Math.round(sizes.motion.w * 0.05)
  await decode({
    ffmpeg, file, meta, motionFps, focusFps, sizes, lutPath: options.lutPath, hwaccel: options.hwaccel, signal,
    onMotion(i, gray) {
      const t = i / motionFps
      const stats = lumaStats(gray)
      const proj = projections(gray, sizes.motion.w, sizes.motion.h)
      let dx = 0, dy = 0, diff = 0, hd = 0
      if (prevGray) {
        diff = meanAbsDiff(prevGray, gray)
        hd = histDistance(prevHist, stats.hist)
        // Nearly identical consecutive frames cannot contain camera shake.
        if (diff >= 1.2) {
          const shift = globalShift(prevProj, proj, radius)
          dx = shift.dx; dy = shift.dy
        }
      }
      motion.push({ t, dx, dy, diff, hd, mean: stats.mean, std: stats.std, clipHi: stats.clipHi, clipLo: stats.clipLo })
      prevGray = gray; prevProj = proj; prevHist = stats.hist
      if (onProgress && meta.duration && t - lastReport >= 2) { lastReport = t; onProgress(Math.min(0.99, t / meta.duration)) }
    },
    onFocus(i, gray) {
      const m = focusMetrics(gray, sizes.focus.w, sizes.focus.h)
      focus.push({ t: i / focusFps, ...m })
    },
  })
  return { motion, focus, motionFps, focusFps, sizes }
}

/** Find hard cuts (a single clip may contain several shots, e.g. screen recordings or rushes reels). */
export function detectCuts(motion, th) {
  const cuts = []
  for (let i = 1; i < motion.length; i++) {
    const s = motion[i]
    if (s.hd < th.cutHist) continue
    const around = []
    for (let k = Math.max(1, i - 5); k < Math.min(motion.length, i + 6); k++) if (k !== i) around.push(motion[k].hd)
    const ref = median(around) || 0
    if (s.hd > Math.max(th.cutHist, ref * 3)) {
      if (!cuts.length || s.t - cuts[cuts.length - 1] > 0.5) cuts.push(s.t)
    }
  }
  return cuts
}

/** Camera jitter per motion sample: residual of the trajectory after smoothing, reset at cuts. */
function shakeSeries(motion, fps, width, cuts) {
  const out = new Float64Array(motion.length)
  const half = Math.max(2, Math.round(0.4 * fps))
  const bounds = [0]
  for (const c of cuts) bounds.push(motion.findIndex((m) => m.t >= c))
  bounds.push(motion.length)
  for (let b = 0; b < bounds.length - 1; b++) {
    const from = bounds[b], to = bounds[b + 1]
    if (to - from < 3) continue
    const xs = [], ys = []
    let x = 0, y = 0
    for (let i = from; i < to; i++) {
      if (i > from) { x += motion[i].dx; y += motion[i].dy }
      xs.push(x); ys.push(y)
    }
    for (let i = 0; i < xs.length; i++) {
      let sx = 0, sy = 0, n = 0
      for (let k = Math.max(0, i - half); k <= Math.min(xs.length - 1, i + half); k++) { sx += xs[k]; sy += ys[k]; n++ }
      const rx = xs[i] - sx / n, ry = ys[i] - sy / n
      out[from + i] = Math.sqrt(rx * rx + ry * ry) / width * 100
    }
  }
  return out
}

/** Turn samples into 1-second windows of raw measurements (no judgement yet). */
export function measureWindows(samples, meta, th) {
  const { motion, focus, motionFps, sizes } = samples
  const cuts = detectCuts(motion, th)
  const shake = shakeSeries(motion, motionFps, sizes.motion.w, cuts)
  const duration = meta.duration || (motion.length ? motion[motion.length - 1].t + 1 / motionFps : 0)
  const windows = []
  // A hard cut may fall between whole seconds. Make it a window boundary so
  // exported ranges never silently include frames from the next shot.
  const boundaries = [0]
  for (let t = 1; t < duration; t++) boundaries.push(t)
  for (const cut of cuts) if (cut > 0 && cut < duration) boundaries.push(cut)
  boundaries.push(duration)
  boundaries.sort((a, b) => a - b)
  const unique = boundaries.filter((t, i) => i === 0 || t - boundaries[i - 1] > 1e-6)
  for (let b = 0; b < unique.length - 1; b++) {
    const t0 = unique[b], t1 = unique[b + 1]
    const ms = [], sh = []
    for (let i = 0; i < motion.length; i++) {
      if (motion[i].t >= t0 && motion[i].t < t1) { ms.push(motion[i]); sh.push(shake[i]) }
    }
    let fs = focus.filter((f) => f.t >= t0 && f.t < t1)
    if (!fs.length && focus.length) fs = [focus.reduce((a, b) => Math.abs(b.t - t0) < Math.abs(a.t - t0) ? b : a)]
    if (!ms.length) continue
    const mean = ms.reduce((s, m) => s + m.mean, 0) / ms.length
    const std = ms.reduce((s, m) => s + m.std, 0) / ms.length
    const clipHi = ms.reduce((s, m) => s + m.clipHi, 0) / ms.length
    const clipLo = ms.reduce((s, m) => s + m.clipLo, 0) / ms.length
    const shakePct = sh.length ? Math.sqrt(sh.reduce((s, v) => s + v * v, 0) / sh.length) : 0
    const focusVal = median(fs.map((f) => f.focus)) ?? 0
    const textured = median(fs.map((f) => f.texturedFraction)) ?? 0
    const motionAmount = ms.reduce((s, m) => s + Math.hypot(m.dx, m.dy), 0) / ms.length / sizes.motion.w * 100 * motionFps
    windows.push({
      t0, t1,
      focus: +focusVal.toFixed(4), shake: +shakePct.toFixed(4), mean: +mean.toFixed(1), std: +std.toFixed(1),
      clipHi: +clipHi.toFixed(4), clipLo: +clipLo.toFixed(4), motion: +motionAmount.toFixed(2), textured: +textured.toFixed(2),
    })
  }
  return { windows, cuts, duration }
}

const isBlackish = (w, th) => (w.mean < th.blackMean && w.std < th.blackStd) || w.std < th.blankStd

/**
 * Batch reference sharpness for one camera format: the 75th percentile of
 * textured, non-black windows. Most takes are in focus, so this approximates
 * "what sharp looks like" for that camera/codec/scene.
 */
export function focusReference(windowLists, th) {
  const values = []
  for (const list of windowLists) for (const w of list) if (!isBlackish(w, th) && w.textured >= 0.05) values.push(w.focus)
  if (values.length < 8) return { ref: null, samples: values.length }
  values.sort((a, b) => a - b)
  const ref = values[Math.floor(values.length * 0.75)]
  return { ref: ref >= th.focusRefMin ? ref : null, samples: values.length, low: ref < th.focusRefMin, raw: ref }
}

/** Add flags and a 0-100 technical score to measured windows. */
export function classifyWindows(windows, th, options = {}, focusRef = null) {
  const isLog = options.log === true
  const fGood = focusRef ? focusRef * th.focusRelGood : th.focusGood
  const fWarn = focusRef ? focusRef * th.focusRelWarn : th.focusWarn
  const fBad = focusRef ? focusRef * th.focusRelBad : th.focusBad
  return windows.map((w) => {
    const flags = []
    let bad = false
    const add = (code, level) => { flags.push({ code, level }); if (level === 'bad') bad = true }
    if (w.mean < th.blackMean && w.std < th.blackStd) add('black', 'bad')
    else if (w.std < th.blankStd) add('blank', 'bad')
    else {
      if (w.textured < 0.05) add('no_detail', 'warn')
      else if (w.focus < fBad) add('blur', 'bad')
      else if (w.focus < fWarn) add('soft', 'warn')
      if (w.shake > th.shakeBad) add('shake', 'bad')
      else if (w.shake > th.shakeWarn) add('jitter', 'warn')
      if (w.clipHi > th.clipHiBad) add('overexposed', 'bad')
      else if (w.clipHi > th.clipHiWarn) add('highlights_clipped', 'warn')
      if (!isLog) {
        if (w.mean < th.darkMean && w.clipLo > th.clipLoBad) add('underexposed', 'bad')
        else if (w.mean < th.darkMean * 1.6 && w.clipLo > th.clipLoBad * 0.5) add('dark', 'warn')
      }
    }
    const focusScore = w.textured < 0.05 ? 0.6 : lerpScore(w.focus, fBad, fGood)
    const shakeScore = 1 - lerpScore(w.shake, th.shakeGood, th.shakeBad)
    const exposureScore = 1 - lerpScore(w.clipHi, th.clipHiWarn * 0.5, th.clipHiBad) * 0.8
      - (!isLog && w.mean < th.darkMean * 1.6 ? 0.3 : 0)
    const score = bad ? 0 : Math.round(100 * (0.45 * focusScore + 0.35 * shakeScore + 0.2 * clamp01(exposureScore)))
    return { ...w, score, bad, flags, focusRel: focusRef ? +(w.focus / focusRef).toFixed(3) : null }
  })
}

const FLAG_LABEL = {
  black: '黑场', blank: '纯色/遮挡', no_detail: '画面缺少细节', blur: '虚焦', soft: '略软',
  shake: '画面抖动', jitter: '轻微晃动', overexposed: '过曝', highlights_clipped: '高光溢出',
  underexposed: '欠曝', dark: '偏暗',
}
export const flagLabel = (code) => FLAG_LABEL[code] || code

/** Group windows into usable candidate segments and rejected ranges. */
export function buildSegments(windows, cuts, th) {
  const shotOf = (t) => cuts.filter((c) => c <= t + 1e-6).length
  const segments = []
  const rejected = []
  let run = null
  const flush = () => {
    if (!run) return
    const len = run.t1 - run.t0
    const target = run.bad ? rejected : segments
    target.push({ ...run, short: !run.bad && len < th.minSegment })
    run = null
  }
  for (const w of windows) {
    const shot = shotOf(w.t0)
    if (run && (run.bad !== w.bad || run.shot !== shot)) flush()
    if (!run) run = { t0: w.t0, t1: w.t1, bad: w.bad, shot, windows: [] }
    run.t1 = w.t1
    run.windows.push(w)
  }
  flush()
  const summarize = (r) => {
    const ws = r.windows
    const avg = (k) => ws.reduce((s, w) => s + w[k], 0) / ws.length
    const counts = {}
    for (const w of ws) for (const f of w.flags) counts[f.code] = (counts[f.code] || 0) + 1
    const flags = Object.entries(counts)
      .filter(([, n]) => n / ws.length >= 0.3 || r.bad)
      .sort((a, b) => b[1] - a[1])
      .map(([code]) => code)
    return {
      start: r.t0, end: r.t1, duration: +(r.t1 - r.t0).toFixed(2), shot: r.shot,
      tech: {
        score: Math.round(avg('score')),
        focus: +avg('focus').toFixed(2), focusRel: ws[0].focusRel == null ? null : +avg('focusRel').toFixed(2),
        shake: +avg('shake').toFixed(3), mean: +avg('mean').toFixed(1), motion: +avg('motion').toFixed(2),
      },
      flags,
      short: r.short === true,
    }
  }
  return { segments: segments.map(summarize), rejected: rejected.map(summarize) }
}

/** Measure one clip (decode + raw windows). Judgement happens later per batch. */
export async function measureClip({ ffmpeg, file, meta, options = {}, signal, onProgress }) {
  const th = resolveThresholds(options)
  const samples = await sampleClip({ ffmpeg, file, meta, options, signal, onProgress })
  return measureWindows(samples, meta, th)
}

/** Judge measured windows and build segments. */
export function judgeClip(measured, th, options, focusRef) {
  const windows = classifyWindows(measured.windows, th, options, focusRef)
  const { segments, rejected } = buildSegments(windows, measured.cuts, th)
  return { windows, segments, rejected }
}

/** Convenience: full layer-1 analysis of a single clip, or of clips sharing `focusRef`. */
export async function analyzeClip({ ffmpeg, file, meta, options = {}, signal, onProgress, focusRef }) {
  const th = resolveThresholds(options)
  const measured = await measureClip({ ffmpeg, file, meta, options, signal, onProgress })
  const ref = focusRef !== undefined ? focusRef : focusReference([measured.windows], th).ref
  return { duration: measured.duration, cuts: measured.cuts, focusRef: ref, thresholds: th, ...judgeClip(measured, th, options, ref) }
}
