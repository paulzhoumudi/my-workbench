// Per-frame technical measurements on 8-bit grayscale buffers.
// Everything here is dependency-free and deterministic so results can be
// reproduced and thresholds calibrated against a team's own footage.

export const FOCUS_GRID = { cols: 8, rows: 5 }

/**
 * Focus measurement that tolerates shallow depth of field, flat LOG grading
 * and sensor noise.
 *
 * It estimates edge width: on edges (weighted by squared gradient of a 3x3
 * smoothed copy) the full-resolution Laplacian magnitude divided by gradient
 * magnitude is large for crisp edges and drops as defocus widens them. This is
 * contrast-independent (LOG keeps its score). The Laplacian level of flat
 * areas is subtracted first, so grain on a defocused frame does not read as
 * detail. The frame score is the mean of the sharpest 10% of tiles: a sharp
 * subject on a blurred background is "in focus"; a frame where nothing is
 * sharp is not. Calibrated values (1280-wide analysis frames): sharp 2.3-3.0,
 * gaussian sigma 0.8 ~1.9, sigma 1.2 ~1.4, sigma 2.2 ~0.9, sigma 5 ~0.4.
 */
export function focusMetrics(gray, w, h, grid = FOCUS_GRID) {
  const { cols, rows } = grid
  const tiles = cols * rows
  const tw = w / cols, th = h / rows
  const S = new Float32Array(w * h)
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x
      S[i] = (gray[i - w - 1] + gray[i - w] + gray[i - w + 1] + gray[i - 1] + gray[i] + gray[i + 1] + gray[i + w - 1] + gray[i + w] + gray[i + w + 1]) / 9
    }
  }
  const sLG = new Float64Array(tiles), sG2 = new Float64Array(tiles), sG3 = new Float64Array(tiles)
  let flatL = 0, flatN = 0
  for (let y = 2; y < h - 2; y++) {
    const ty = Math.min(rows - 1, Math.floor(y / th))
    for (let x = 2; x < w - 2; x++) {
      const i = y * w + x
      const G = Math.abs((S[i + 1] - S[i - 1]) * 0.5) + Math.abs((S[i + w] - S[i - w]) * 0.5)
      const L = Math.abs(4 * gray[i] - gray[i - 1] - gray[i + 1] - gray[i - w] - gray[i + w])
      if (G < 1.5) { flatL += L; flatN++ }
      const t = ty * cols + Math.min(cols - 1, Math.floor(x / tw))
      const g2 = G * G
      sLG[t] += L * g2; sG2[t] += g2; sG3[t] += G * g2
    }
  }
  // Noise floor: mean Laplacian magnitude where there is no structure.
  const floor = flatN > w * h * 0.005 ? flatL / flatN : 0
  const vals = []
  let textured = 0
  for (let t = 0; t < tiles; t++) {
    if (!sG2[t]) continue
    const edge = sG3[t] / sG2[t]
    // Tiles without real edges (sky, backdrop, black) carry no focus evidence.
    if (edge < 4) continue
    textured++
    vals.push(Math.max(0, sLG[t] / sG2[t] - floor) / edge)
  }
  vals.sort((a, b) => b - a)
  const k = Math.max(1, Math.round(tiles * 0.1))
  const top = vals.slice(0, k)
  const focus = top.length ? top.reduce((s, v) => s + v, 0) / top.length : 0
  return { focus, texturedFraction: textured / tiles, noise: floor }
}

/** Luma statistics and a coarse histogram for exposure and cut detection. */
export function lumaStats(gray) {
  const hist = new Float64Array(32)
  let sum = 0, sq = 0, hi = 0, lo = 0
  const n = gray.length
  for (let i = 0; i < n; i++) {
    const v = gray[i]
    sum += v; sq += v * v
    if (v >= 250) hi++
    else if (v <= 6) lo++
    hist[v >> 3]++
  }
  const mean = sum / n
  for (let i = 0; i < 32; i++) hist[i] /= n
  return { mean, std: Math.sqrt(Math.max(0, sq / n - mean * mean)), clipHi: hi / n, clipLo: lo / n, hist }
}

export function histDistance(a, b) {
  let d = 0
  for (let i = 0; i < a.length; i++) d += Math.abs(a[i] - b[i])
  return d
}

const REGIONS = { cols: 3, rows: 3 }

/** Column and row mean projections for each of 3x3 regions. */
export function projections(gray, w, h) {
  const out = []
  const rw = Math.floor(w / REGIONS.cols), rh = Math.floor(h / REGIONS.rows)
  for (let ry = 0; ry < REGIONS.rows; ry++) {
    for (let rx = 0; rx < REGIONS.cols; rx++) {
      const col = new Float32Array(rw), row = new Float32Array(rh)
      for (let y = 0; y < rh; y++) {
        const base = (ry * rh + y) * w + rx * rw
        let rs = 0
        for (let x = 0; x < rw; x++) { const v = gray[base + x]; col[x] += v; rs += v }
        row[y] = rs / rw
      }
      for (let x = 0; x < rw; x++) col[x] /= rh
      out.push({ col: zeroMean(gradient(col)), row: zeroMean(gradient(row)) })
    }
  }
  return out
}

function gradient(arr) {
  const g = new Float32Array(arr.length)
  for (let i = 1; i < arr.length - 1; i++) g[i] = (arr[i + 1] - arr[i - 1]) * 0.5
  return g
}

function zeroMean(arr) {
  let s = 0
  for (let i = 0; i < arr.length; i++) s += arr[i]
  const m = s / arr.length
  for (let i = 0; i < arr.length; i++) arr[i] -= m
  return arr
}

/** Best 1-D shift (sub-pixel) of `b` relative to `a` by mean absolute difference. */
function bestShift(a, b, radius) {
  const n = a.length
  let best = 0, bestCost = Infinity
  const costs = new Float64Array(2 * radius + 1)
  for (let s = -radius; s <= radius; s++) {
    let c = 0, cnt = 0
    const from = Math.max(0, -s) + 2, to = Math.min(n, n - s) - 2
    for (let i = from; i < to; i++) { c += Math.abs(a[i] - b[i + s]); cnt++ }
    const cost = cnt ? c / cnt : Infinity
    costs[s + radius] = cost
    if (cost < bestCost) { bestCost = cost; best = s }
  }
  // Parabolic refinement.
  const i = best + radius
  if (i > 0 && i < costs.length - 1) {
    const l = costs[i - 1], c = costs[i], r = costs[i + 1]
    const denom = l - 2 * c + r
    if (denom > 1e-9) best += 0.5 * (l - r) / denom
  }
  // Trust a region only when its profile has real structure and the match
  // has a distinct minimum; flat backdrops and repeating patterns otherwise
  // produce arbitrary shifts that would read as camera shake.
  let energy = 0
  for (let k = 0; k < n; k++) energy += Math.abs(a[k])
  const sorted = Array.from(costs).filter(Number.isFinite).sort((x, y) => x - y)
  const typical = sorted[Math.floor(sorted.length / 2)] || 0
  const distinct = typical > 0 && bestCost < typical * 0.6
  return { shift: best, confidence: energy / n > 0.3 && distinct ? 1 : 0 }
}

function median(values) {
  if (!values.length) return 0
  const s = [...values].sort((x, y) => x - y)
  return s[Math.floor(s.length / 2)]
}

/**
 * Global camera translation between two frames as the median of per-region
 * shifts, so a single moving object does not dominate the estimate.
 */
export function globalShift(prev, next, radius = 20) {
  const dxs = [], dys = []
  for (let r = 0; r < prev.length; r++) {
    const sx = bestShift(prev[r].col, next[r].col, radius)
    const sy = bestShift(prev[r].row, next[r].row, Math.max(4, Math.round(radius * 0.6)))
    if (sx.confidence) dxs.push(sx.shift)
    if (sy.confidence) dys.push(sy.shift)
  }
  // An axis needs agreement from at least 2 of the 9 regions.
  return { dx: dxs.length >= 2 ? median(dxs) : 0, dy: dys.length >= 2 ? median(dys) : 0, valid: dxs.length + dys.length >= 2 }
}

export function meanAbsDiff(a, b) {
  let d = 0
  const step = 4
  let n = 0
  for (let i = 0; i < a.length; i += step) { d += Math.abs(a[i] - b[i]); n++ }
  return d / n
}
