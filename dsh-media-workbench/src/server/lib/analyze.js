/**
 * Pure-JS footage metrics used by the cleaning step (清洗规则). All inputs are
 * 8-bit grayscale frames produced by FFmpeg, so no native OpenCV build is
 * needed on Windows or macOS. Scores are calibrated estimates; thresholds live
 * in project.json and are adjustable per project.
 */

/** Variance of the 4-neighbour Laplacian — the standard focus measure. */
export function laplacianVariance(frame, width, height) {
  let sum = 0
  let sumSq = 0
  let count = 0
  for (let y = 1; y < height - 1; y++) {
    const row = y * width
    for (let x = 1; x < width - 1; x++) {
      const i = row + x
      const v = frame[i - 1] + frame[i + 1] + frame[i - width] + frame[i + width] - 4 * frame[i]
      sum += v
      sumSq += v * v
      count++
    }
  }
  const mean = sum / count
  return sumSq / count - mean * mean
}

export const SHARPNESS_SCALE = 150

/** Map Laplacian variance (320×180 analysis frames) onto a 0–100 clarity score. */
export function sharpnessScore(variance) {
  return Math.round(100 * (1 - Math.exp(-variance / SHARPNESS_SCALE)))
}

export function meanLuma(frame) {
  let sum = 0
  for (let i = 0; i < frame.length; i++) sum += frame[i]
  return sum / frame.length
}

/** Dynamic range check so a flat grey card is not mistaken for a sharp image. */
export function lumaStdDev(frame) {
  const mean = meanLuma(frame)
  let sq = 0
  for (let i = 0; i < frame.length; i++) sq += (frame[i] - mean) ** 2
  return Math.sqrt(sq / frame.length)
}

/**
 * Translation between two frames by block matching on the central region,
 * refined to sub-pixel precision with a parabola through the neighbouring
 * costs (so slow, smooth pans do not look jittery after rounding).
 */
export function estimateShift(a, b, width, height, radius = 6) {
  const margin = radius + 4
  const costAt = (dx, dy) => {
    let cost = 0
    let n = 0
    for (let y = margin; y < height - margin; y += 2) {
      const rowA = y * width
      const rowB = (y + dy) * width
      for (let x = margin; x < width - margin; x += 2) {
        cost += Math.abs(a[rowA + x] - b[rowB + x + dx])
        n++
      }
    }
    return cost / n
  }
  const grid = new Map()
  let best = { dx: 0, dy: 0, cost: Infinity }
  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      const cost = costAt(dx, dy)
      grid.set(`${dx},${dy}`, cost)
      if (cost < best.cost - 1e-9 || (Math.abs(cost - best.cost) < 1e-9 && Math.abs(dx) + Math.abs(dy) < Math.abs(best.dx) + Math.abs(best.dy))) best = { dx, dy, cost }
    }
  }
  const refine = (minus, center, plus) => {
    if (minus === undefined || plus === undefined) return 0
    const denom = minus - 2 * center + plus
    return denom > 1e-9 ? Math.max(-0.5, Math.min(0.5, (minus - plus) / (2 * denom))) : 0
  }
  const fx = refine(grid.get(`${best.dx - 1},${best.dy}`), best.cost, grid.get(`${best.dx + 1},${best.dy}`))
  const fy = refine(grid.get(`${best.dx},${best.dy - 1}`), best.cost, grid.get(`${best.dx},${best.dy + 1}`))
  return { dx: best.dx + fx, dy: best.dy + fy, cost: best.cost }
}

/** Mean absolute difference above which two frames are treated as a cut, not motion. */
const CUT_COST = 28

/**
 * Shake = variance of the high-frequency part of the camera path. Deliberate
 * pans and dolly moves are smooth and removed by the moving average; handheld
 * jitter remains. Frame pairs across a hard cut are ignored. Units: pixels²
 * at 160×90 analysis resolution.
 */
export function shakeVariance(frames, width, height) {
  if (frames.length < 4) return 0
  const path = [{ x: 0, y: 0 }]
  for (let i = 1; i < frames.length; i++) {
    const shift = estimateShift(frames[i - 1], frames[i], width, height)
    const last = path[path.length - 1]
    const cut = shift.cost > CUT_COST
    path.push({ x: last.x + (cut ? 0 : shift.dx), y: last.y + (cut ? 0 : shift.dy) })
  }
  const window = 2
  const residuals = []
  for (let i = 0; i < path.length; i++) {
    let sx = 0
    let sy = 0
    let n = 0
    for (let j = Math.max(0, i - window); j <= Math.min(path.length - 1, i + window); j++) { sx += path[j].x; sy += path[j].y; n++ }
    residuals.push({ x: path[i].x - sx / n, y: path[i].y - sy / n })
  }
  const variance = (values) => {
    const mean = values.reduce((s, v) => s + v, 0) / values.length
    return values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length
  }
  return variance(residuals.map((r) => r.x)) + variance(residuals.map((r) => r.y))
}

/** 64-bit difference hash (9×8 area-averaged) as a BigInt. */
export function dHash(frame, width, height) {
  const cols = 9
  const rows = 8
  const cells = new Float64Array(cols * rows)
  for (let r = 0; r < rows; r++) {
    const y0 = Math.floor((r * height) / rows)
    const y1 = Math.floor(((r + 1) * height) / rows)
    for (let c = 0; c < cols; c++) {
      const x0 = Math.floor((c * width) / cols)
      const x1 = Math.floor(((c + 1) * width) / cols)
      let sum = 0
      let n = 0
      for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) { sum += frame[y * width + x]; n++ }
      cells[r * cols + c] = n ? sum / n : 0
    }
  }
  let hash = 0n
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols - 1; c++) {
      hash = (hash << 1n) | (cells[r * cols + c] > cells[r * cols + c + 1] ? 1n : 0n)
    }
  }
  return hash
}

export function hashSimilarity(a, b) {
  let x = BigInt.asUintN(64, BigInt(a) ^ BigInt(b))
  let bits = 0
  while (x) { bits += Number(x & 1n); x >>= 1n }
  return 1 - bits / 64
}

/** Mean similarity across the aligned start/middle/end fingerprints. */
export function fingerprintSimilarity(a, b) {
  if (!a?.length || !b?.length) return 0
  const n = Math.min(a.length, b.length)
  let total = 0
  for (let i = 0; i < n; i++) total += hashSimilarity(a[i], b[i])
  return total / n
}

export function median(values) {
  if (!values.length) return 0
  const sorted = [...values].sort((x, y) => x - y)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}
