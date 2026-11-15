import { mkdir, readdir, rename, rmdir, stat } from 'node:fs/promises'
import path from 'node:path'
import { exists, readJson, writeJson, appendLog } from './util.js'
import { P, PROJECT_DIRS, LEGACY_TAGS_DIR } from './layout.js'

/**
 * Layout migrations. v1 (numbered folders) and v2 (标签管理 folder) projects are
 * brought to v3. Generated files are moved (same-volume renames, nothing is
 * copied or deleted); a target that already exists is never overwritten.
 *
 * v1 → v2 layout migration (00_brief … 06_export → four libraries).
 * Generated files are moved (same-volume renames, nothing is copied or
 * deleted); raw footage in 02_raw is NOT moved — 02_raw stays a registered raw
 * source so the files keep their original location (P4). A target that already
 * exists is never overwritten; the source then stays where it was.
 */
export async function migrateLayout(root, project, from = project.layout || 1) {
  const moved = []
  const kept = []
  const rawSources = [...(project.rawSources || [])]
  const abs = (rel) => path.join(root, rel)
  for (const sub of PROJECT_DIRS) await mkdir(abs(sub), { recursive: true })

  async function move(fromRel, toRel) {
    const from = abs(fromRel)
    const to = abs(toRel)
    if (!(await exists(from))) return false
    if (await exists(to)) { kept.push(fromRel); return false }
    await mkdir(path.dirname(to), { recursive: true })
    await rename(from, to)
    moved.push([fromRel, toRel])
    return true
  }
  async function list(rel) {
    try { return await readdir(abs(rel), { withFileTypes: true }) } catch { return [] }
  }
  /** Move every entry of a folder into another folder (optionally renaming). */
  async function moveAll(fromDir, toDir, renameFn = (n) => n, filter = () => true) {
    for (const entry of await list(fromDir)) {
      if (!filter(entry)) continue
      await move(`${fromDir}/${entry.name}`, `${toDir}/${renameFn(entry.name)}`)
    }
  }

  if (from < 2) await fromV1()
  // v2 → v3: the 标签管理 folder becomes hidden data under .dsh/tags (managed in the 标签 tab).
  const legacy = LEGACY_TAGS_DIR
  await move(`${legacy}/标签字典.yaml`, P.dictionary)
  await moveAll(`${legacy}/_history`, `${P.tags}/_history`, (n) => n, (e) => /^标签字典_v\d+/.test(e.name))
  await move(`${legacy}/清洗报告.json`, P.cleanReport)
  await moveAll(`${legacy}/丢弃登记`, P.rejected, (n) => n, (e) => e.isFile() && e.name.endsWith('.json'))
  for (const dir of [`${legacy}/丢弃登记`, `${legacy}/_history`, legacy]) await removeIfEmpty(abs(dir))

  await appendLog(root, { action: 'project.migrateLayout', from, to: 3, moved: moved.length, kept })
  return { moved, kept, project: { rawSources } }

  async function fromV1() {
    // Creative documents and their history.
    for (const name of ['00_主题简报.md', '01_创意方向.md', '02_文案.md', '03_分镜脚本.md']) await move(`01_creative/${name}`, `${P.creative}/${name}`)
    await move('01_creative/04_标签字典.yaml', P.dictionary)
    for (const entry of await list('01_creative/_history')) {
      if (entry.name.startsWith('04_标签字典_')) await move(`01_creative/_history/${entry.name}`, `${P.tags}/_history/${entry.name.replace(/^04_标签字典_/, '标签字典_')}`)
      else await move(`01_creative/_history/${entry.name}`, `${P.creative}/_history/${entry.name}`)
    }
    await moveAll('01_creative', P.creative, (n) => n, (e) => e.name !== '_history')

    // Edit data.
    await move('05_edit/剪辑思路.md', `${P.creative}/剪辑思路.md`)
    await move('05_edit/缺口清单.md', `${P.creative}/缺口清单.md`)
    await moveAll('05_edit/_history', `${P.creative}/_history`)
    await moveAll('05_edit', P.editData, (n) => n, (e) => e.name !== '_history')

    // Clean report, discard register and clips.
    await move('03_clips/clean_report.json', P.cleanReport)
    await moveAll('03_clips/_rejected', P.rejected)
    await moveAll('03_clips', P.clips, (n) => n, (e) => e.name !== '_rejected')

    // Exports and references.
    await moveAll('06_export', P.export)
    await moveAll('00_brief', P.refs)
    await moveAll('04_generated', `${P.output}/AI生成`)

    // Raw footage stays in place: keep 02_raw scanned if it holds anything.
    if ((await list('02_raw')).length && !rawSources.includes('02_raw')) rawSources.push('02_raw')

    // Index: clip proxies moved with 03_clips.
    const indexFile = abs('.dsh/index.json')
    const index = await readJson(indexFile, null)
    if (index?.clips) {
      for (const clip of Object.values(index.clips)) {
        if (typeof clip.proxy === 'string' && clip.proxy.startsWith('03_clips/')) clip.proxy = `${P.clips}/${clip.proxy.slice('03_clips/'.length)}`
      }
      await writeJson(indexFile, index)
    }
    // Creative metadata: the dictionary document key changed.
    const metaFile = abs('.dsh/creative.json')
    const meta = await readJson(metaFile, null)
    if (meta?.files?.['04_标签字典.yaml']) {
      meta.files['标签字典.yaml'] ||= meta.files['04_标签字典.yaml']
      delete meta.files['04_标签字典.yaml']
      await writeJson(metaFile, meta)
    }
    await move('.dsh/cache/creative/04_标签字典.yaml', '.dsh/cache/creative/标签字典.yaml')

    // Remove the old folders only when they ended up empty.
    for (const dir of ['01_creative/_history', '01_creative', '05_edit/_history', '05_edit', '03_clips/_rejected', '03_clips', '06_export', '00_brief', '04_generated', '02_raw']) {
      await removeIfEmpty(abs(dir))
    }
  }
}

async function removeIfEmpty(dir) {
  try {
    const info = await stat(dir)
    if (!info.isDirectory()) return
    if ((await readdir(dir)).length === 0) await rmdir(dir)
  } catch { /* missing or not empty: leave it */ }
}

