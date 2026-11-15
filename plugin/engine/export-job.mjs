import { mkdir, stat, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { selectSegments, toCsv, toFcpxml, toXmeml } from './export.mjs'

const EXT = { fcpxml: 'fcpxml', xmeml: 'xml', csv: 'csv', json: 'json' }
const VALID_GRADES = new Set(['A', 'B', 'C'])

function stamp(iso) {
  const d = iso ? new Date(iso) : new Date()
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}`
}

/**
 * Write the requested export files into an existing, user-chosen directory.
 * Never creates the destination directory itself and never overwrites:
 * a numeric suffix is added when a name exists.
 */
export async function exportJob(results, overrides, { dest, formats, grades, createDest = false }) {
  const s = await stat(dest).catch(() => null)
  if (!s) {
    if (!createDest) throw new Error('导出目录不存在')
    await mkdir(dest, { recursive: true })
  } else if (!s.isDirectory()) throw new Error('导出位置不是文件夹')
  const gs = grades.filter((g) => VALID_GRADES.has(g))
  if (!gs.length) throw new Error('请选择要导出的等级')
  const items = selectSegments(results, gs, overrides)
  const title = `AI选片_${gs.join('')}_${stamp(results.startedAt)}`
  const written = []
  for (const format of formats) {
    if (!EXT[format]) continue
    let body
    if (format === 'fcpxml') body = toFcpxml(results, items, title)
    else if (format === 'xmeml') body = toXmeml(results, items, title)
    else if (format === 'csv') body = toCsv(results, items)
    else body = JSON.stringify({ title, items: items.map(({ file, seg, grade }) => ({ grade, file: file.path, start: seg.start, end: seg.end, review: seg.review, tech: seg.tech, reason: seg.gradeReason })) }, null, 1)
    const suffix = format === 'xmeml' ? '_Premiere' : format === 'fcpxml' ? '_FCP_Resolve' : ''
    let path = join(dest, `${title}${suffix}.${EXT[format]}`)
    for (let n = 2; await stat(path).then(() => true, () => false); n++) path = join(dest, `${title}${suffix}_${n}.${EXT[format]}`)
    await writeFile(path, body, { flag: 'wx' })
    written.push({ format, path, count: items.length })
  }
  return written
}
