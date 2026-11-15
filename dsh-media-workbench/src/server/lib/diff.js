/**
 * Line diff for creative documents (FR-12). Documents are small (a few
 * hundred lines), so an O(n·m) LCS table is simpler and exact.
 * @returns {{ type: 'same' | 'add' | 'del', text: string }[]}
 */
export function diffLines(before, after) {
  const a = splitLines(before)
  const b = splitLines(after)
  if (a.length * b.length > 4_000_000) return [...a.map((text) => ({ type: 'del', text })), ...b.map((text) => ({ type: 'add', text }))]
  const n = a.length
  const m = b.length
  const table = Array.from({ length: n + 1 }, () => new Uint32Array(m + 1))
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      table[i][j] = a[i] === b[j] ? table[i + 1][j + 1] + 1 : Math.max(table[i + 1][j], table[i][j + 1])
    }
  }
  const out = []
  let i = 0
  let j = 0
  while (i < n && j < m) {
    if (a[i] === b[j]) { out.push({ type: 'same', text: a[i] }); i++; j++ }
    else if (table[i + 1][j] >= table[i][j + 1]) { out.push({ type: 'del', text: a[i] }); i++ }
    else { out.push({ type: 'add', text: b[j] }); j++ }
  }
  while (i < n) out.push({ type: 'del', text: a[i++] })
  while (j < m) out.push({ type: 'add', text: b[j++] })
  return out
}

/** Number of contiguous change blocks — used for "人工改动 N 处". */
export function countChanges(before, after) {
  let blocks = 0
  let inside = false
  for (const line of diffLines(before, after)) {
    if (line.type === 'same') inside = false
    else if (!inside) { blocks++; inside = true }
  }
  return blocks
}

function splitLines(text) {
  if (!text) return []
  return String(text).replace(/\r\n/g, '\n').replace(/\n$/, '').split('\n')
}
