// One scan job: discover clips -> layer 1 measure -> batch focus reference ->
// segments -> thumbnails -> layer 3 model review -> grades -> results.json.
// Source media is read-only; all outputs live in the job directory.
import { mkdir, readdir, readFile, rename, stat, writeFile } from 'node:fs/promises'
import { basename, extname, join } from 'node:path'
import { resolveTools } from './tools.mjs'
import { probe } from './probe.mjs'
import { stillJpeg } from './decode.mjs'
import { focusReference, judgeClip, measureClip, resolveThresholds } from './analyze.mjs'
import { reviewSegment, stillTimes } from './vlm.mjs'
import { gradeCandidate, gradeRejected, summarize } from './grade.mjs'

export const VIDEO_EXT = new Set(['.mp4', '.mov', '.mxf', '.mkv', '.m4v', '.avi', '.mts', '.m2ts', '.mpg', '.mpeg', '.webm', '.3gp'])
const MAX_FILES = 5000

export const cameraGroup = (meta) => `${meta.width}x${meta.height} ${meta.codec} ${meta.pixFmt || '-'} ${meta.colorTransfer || '-'}`

// Readers poll results.json while the engine writes it, so writes are atomic
// (temp file + rename). Some sandboxes treat rename-over-existing as a delete
// and block it; FOOTAGE_CULLER_DIRECT_WRITE=1 switches to in-place writes there.
const DIRECT_WRITE = process.env.FOOTAGE_CULLER_DIRECT_WRITE === '1'
let tmpSeq = 0
export async function writeJsonAtomic(path, value) {
  const text = JSON.stringify(value, null, 1)
  if (DIRECT_WRITE) { await writeFile(path, text); return }
  const tmp = `${path}.${process.pid}.${++tmpSeq}.tmp`
  await writeFile(tmp, text)
  await rename(tmp, path)
}

export async function readJson(path, fallback) {
  try { return JSON.parse(await readFile(path, 'utf8')) } catch { return fallback }
}

/** List video files. Skips hidden files, macOS AppleDouble files and package folders. */
export async function discover(inputs, { recursive = true } = {}) {
  const out = []
  async function walk(dir, depth) {
    let entries
    try { entries = await readdir(dir, { withFileTypes: true }) } catch { return }
    entries.sort((a, b) => a.name.localeCompare(b.name, 'zh-Hans-CN', { numeric: true }))
    for (const e of entries) {
      if (out.length >= MAX_FILES) return
      if (e.name.startsWith('.') || e.name.startsWith('._')) continue
      const p = join(dir, e.name)
      if (e.isDirectory()) { if (recursive && depth < 8 && !/\.(fcpbundle|app|photoslibrary)$/i.test(e.name)) await walk(p, depth + 1) }
      else if (e.isFile() && VIDEO_EXT.has(extname(e.name).toLowerCase())) out.push(p)
    }
  }
  for (const input of inputs) {
    const s = await stat(input)
    if (s.isDirectory()) await walk(input, 0)
    else if (s.isFile()) out.push(input)
  }
  return [...new Set(out)]
}

async function pool(items, concurrency, fn) {
  let next = 0
  const workers = Array.from({ length: Math.max(1, concurrency) }, async () => {
    while (next < items.length) {
      const i = next++
      await fn(items[i], i)
    }
  })
  await Promise.all(workers)
}

/**
 * @param {object} p
 * @param {object} p.request  { id, inputs, recursive, options, vlm:{enabled,baseUrl,model,rubric,concurrency,maxSegments}, ffmpegDir, grading }
 * @param {object} p.secrets  { vlmApiKey }
 * @param {string} p.jobDir
 * @param {(event:object)=>void} [p.emit]
 * @param {AbortSignal} [p.signal]
 */
export async function runJob({ request, secrets = {}, jobDir, emit = () => {}, signal }) {
  const started = Date.now()
  const options = request.options || {}
  const th = resolveThresholds(options)
  await mkdir(join(jobDir, 'thumbs'), { recursive: true })
  const resultsPath = join(jobDir, 'results.json')
  const results = {
    version: 1, id: request.id, status: 'running', phase: 'discover', createdAt: request.createdAt || new Date().toISOString(),
    startedAt: new Date(started).toISOString(), finishedAt: null, request, error: null,
    progress: { done: 0, total: 0, current: '' }, focusRefs: {}, files: [], summary: null,
  }
  let lastWrite = 0
  const save = async (force = false) => {
    if (!force && Date.now() - lastWrite < 800) return
    lastWrite = Date.now()
    results.summary = summarize(results.files)
    await writeJsonAtomic(resultsPath, results)
  }
  const progress = (patch) => { Object.assign(results.progress, patch); emit({ type: 'progress', phase: results.phase, ...results.progress }) }
  try {
    const { ffmpeg, ffprobe } = await resolveTools(request.ffmpegDir)
    if (!ffmpeg || !ffprobe) throw new Error('未找到 ffmpeg/ffprobe。请安装 ffmpeg（macOS: brew install ffmpeg），或在设置中填写所在目录。')
    const files = await discover(request.inputs, { recursive: request.recursive !== false })
    if (!files.length) throw new Error('所选位置没有找到视频文件。')
    for (const [index, path] of files.entries()) {
      let size = 0
      try { size = (await stat(path)).size } catch {}
      results.files.push({ index, path, name: basename(path), size, status: 'queued' })
    }
    // Layer 1: measure every clip.
    results.phase = 'measure'
    progress({ done: 0, total: files.length, current: '' })
    await save(true)
    const measured = new Map()
    for (const f of results.files) {
      signal?.throwIfAborted()
      f.status = 'measuring'
      progress({ current: f.name })
      try {
        f.meta = await probe(ffprobe, f.path, { signal })
        f.duration = +f.meta.duration.toFixed(2)
        const m = await measureClip({
          ffmpeg, file: f.path, meta: f.meta, options, signal,
          onProgress: (p) => emit({ type: 'clip-progress', file: f.name, fraction: +p.toFixed(2) }),
        })
        measured.set(f.index, m)
        f.cuts = m.cuts
        f.status = 'measured'
      } catch (error) {
        if (signal?.aborted) throw error
        f.status = 'failed'
        f.error = String(error.message || error).slice(0, 400)
      }
      progress({ done: results.progress.done + 1 })
      await save()
    }
    // Batch focus reference per camera format.
    const groups = new Map()
    for (const f of results.files) {
      if (!measured.has(f.index)) continue
      const key = cameraGroup(f.meta)
      if (!groups.has(key)) groups.set(key, [])
      groups.get(key).push(f)
    }
    for (const [key, list] of groups) {
      const r = focusReference(list.map((f) => measured.get(f.index).windows), th)
      results.focusRefs[key] = r
      for (const f of list) {
        const judged = judgeClip(measured.get(f.index), th, options, r.ref)
        f.timeline = judged.windows.map((w) => [w.t0, w.score, w.flags.map((x) => x.code)])
        f.segments = judged.segments.map((s, i) => ({ id: `${f.index}-s${i}`, fileIndex: f.index, kind: 'candidate', ...s }))
        f.rejected = judged.rejected.map((s, i) => ({ id: `${f.index}-r${i}`, fileIndex: f.index, kind: 'rejected', ...s }))
        for (const s of f.segments) Object.assign(s, (({ grade, reason }) => ({ grade, gradeReason: reason }))(gradeCandidate(s, null, request.grading)))
        for (const s of f.rejected) Object.assign(s, (({ grade, reason }) => ({ grade, gradeReason: reason }))(gradeRejected(s)))
        f.status = 'judged'
      }
    }
    measured.clear()
    // Thumbnails for the review UI.
    results.phase = 'thumbs'
    const all = results.files.flatMap((f) => (f.segments ? [...f.segments, ...f.rejected].map((s) => ({ f, s })) : []))
    progress({ done: 0, total: all.length, current: '' })
    await save(true)
    await pool(all, 3, async ({ f, s }) => {
      signal?.throwIfAborted()
      try {
        const jpg = await stillJpeg({ ffmpeg, file: f.path, t: s.start + s.duration / 2, width: 480, lutPath: options.lutPath, signal })
        await writeFile(join(jobDir, 'thumbs', `${s.id}.jpg`), jpg)
        s.thumb = `${s.id}.jpg`
      } catch (error) { if (signal?.aborted) throw error }
      progress({ done: results.progress.done + 1, current: f.name })
      await save()
    })
    // Layer 3: model review of candidate segments.
    const vlm = request.vlm || {}
    if (vlm.enabled && vlm.baseUrl && vlm.model) {
      results.phase = 'review'
      let candidates = results.files.flatMap((f) => (f.segments || []).map((s) => ({ f, s })))
      // Review the technically strongest first when a cap is set.
      if (vlm.maxSegments > 0 && candidates.length > vlm.maxSegments) {
        candidates = [...candidates].sort((a, b) => b.s.tech.score - a.s.tech.score).slice(0, vlm.maxSegments)
      }
      progress({ done: 0, total: candidates.length, current: '' })
      await save(true)
      const cfg = { baseUrl: vlm.baseUrl, model: vlm.model, rubric: vlm.rubric, apiKey: secrets.vlmApiKey, timeoutMs: vlm.timeoutMs }
      await pool(candidates, vlm.concurrency || 2, async ({ f, s }) => {
        signal?.throwIfAborted()
        try {
          const stills = []
          for (const t of stillTimes(s, vlm.frames || 4)) stills.push(await stillJpeg({ ffmpeg, file: f.path, t, width: 768, lutPath: options.lutPath, signal }))
          s.review = await reviewSegment(cfg, s, { name: f.name }, stills, { signal })
        } catch (error) {
          if (signal?.aborted) throw error
          s.review = { error: String(error.message || error).slice(0, 300) }
        }
        const g = gradeCandidate(s, s.review, request.grading)
        s.grade = g.grade
        s.gradeReason = g.reason
        s.combined = g.combined
        progress({ done: results.progress.done + 1, current: f.name })
        await save()
      })
    }
    results.status = 'done'
    results.phase = 'done'
  } catch (error) {
    results.status = signal?.aborted ? 'cancelled' : 'failed'
    results.error = signal?.aborted ? '已取消' : String(error.message || error).slice(0, 500)
  }
  results.finishedAt = new Date().toISOString()
  results.elapsedSeconds = +((Date.now() - started) / 1000).toFixed(1)
  await save(true)
  emit({ type: 'done', status: results.status, error: results.error, summary: results.summary })
  return results
}
