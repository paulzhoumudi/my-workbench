// v1 (00_brief … 06_export) → v3 library layout migration, file tree and text preview.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { createService } from '../src/server/lib/service.js'

const put = async (root, rel, content = 'x') => { await mkdir(path.dirname(path.join(root, rel)), { recursive: true }); await writeFile(path.join(root, rel), content) }

test('migrates a v1 project to the libraries and lists the real folder tree', async () => {
  const home = await mkdtemp(path.join(os.tmpdir(), 'mw-lh-'))
  const root = await mkdtemp(path.join(os.tmpdir(), 'mw-lp-'))
  const service = createService({ home })
  try {
    await put(root, '.dsh/project.json', JSON.stringify({ schema: 1, id: 'p_old', name: '旧项目', rawSources: [] }))
    await put(root, '01_creative/02_文案.md', '# 文案 v2')
    await put(root, '01_creative/04_标签字典.yaml', '场景: [湖边]\n待审: []\n')
    await put(root, '01_creative/_history/02_文案_v1.md', '# 文案 v1')
    await put(root, '01_creative/_history/04_标签字典_v1.yaml', '场景: []\n')
    await put(root, '.dsh/creative.json', JSON.stringify({ files: { '02_文案.md': { version: 2, hash: 'h' }, '04_标签字典.yaml': { version: 3, hash: 'k' } }, editUse: { '02_文案.md': 2 } }))
    await put(root, '03_clips/clean_report.json', '{}')
    await put(root, '03_clips/_rejected/C0002.json', '{}')
    await put(root, '03_clips/C0001/C0001_s01.mp4', 'video')
    await put(root, '.dsh/index.json', JSON.stringify({ schema: 1, raws: { C0001: { id: 'C0001', path: '02_raw/C0001.MP4', status: 'kept' } }, clips: { C0001_s01: { id: 'C0001_s01', rawId: 'C0001', proxy: '03_clips/C0001/C0001_s01.mp4' } } }))
    await put(root, '05_edit/match.json', '{}')
    await put(root, '05_edit/剪辑思路.md', '# 思路')
    await put(root, '06_export/成片.mp4', 'film')
    await put(root, '02_raw/C0001.MP4', 'raw')
    await mkdir(path.join(root, '00_brief'))
    await mkdir(path.join(root, '04_generated'))

    const { project } = await service.createProject({ path: root })
    const { root: r } = await service.open(project.id)
    const has = (rel) => existsSync(path.join(r, rel))
    for (const rel of ['创意剪辑/02_文案.md', '.dsh/tags/标签字典.yaml', '创意剪辑/_history/02_文案_v1.md', '.dsh/tags/_history/标签字典_v1.yaml',
      '.dsh/tags/清洗报告.json', '.dsh/tags/丢弃登记/C0002.json', '输出素材库/切片素材/C0001/C0001_s01.mp4', '创意剪辑/剪辑数据/match.json',
      '创意剪辑/剪辑思路.md', '输出素材库/成片/成片.mp4', '原始素材库']) assert.ok(has(rel), rel)
    for (const rel of ['01_creative', '03_clips', '05_edit', '06_export', '00_brief', '04_generated', '标签管理']) assert.ok(!has(rel), `${rel} removed when empty`)
    assert.ok(has('02_raw/C0001.MP4'), 'raw footage is never moved')
    const p = JSON.parse(await readFile(path.join(r, '.dsh/project.json'), 'utf8'))
    assert.equal(p.layout, 3)
    assert.deepEqual(p.rawSources, ['02_raw'])
    const index = JSON.parse(await readFile(path.join(r, '.dsh/index.json'), 'utf8'))
    assert.equal(index.clips.C0001_s01.proxy, '输出素材库/切片素材/C0001/C0001_s01.mp4')
    const docs = await service.creative.list(r)
    const dict = docs.find((d) => d.key === '标签字典.yaml')
    assert.equal(dict.path, '.dsh/tags/标签字典.yaml')
    assert.ok(dict.history.some((h) => h.ref === 'v1'))
    assert.equal(docs.find((d) => d.key === '02_文案.md').editUse, 2)

    // File tree: libraries first, .dsh hidden, docs recognised.
    const top = await service.listDir(project.id, '')
    assert.deepEqual(top.items.slice(0, 3).map((i) => i.name), ['原始素材库', '输出素材库', '创意剪辑'])
    assert.ok(!top.items.some((i) => i.name === '.dsh' || i.name === '标签管理'))
    const creativeDir = await service.listDir(project.id, '创意剪辑')
    assert.equal(creativeDir.items.find((i) => i.name === '02_文案.md').doc, '02_文案.md')
    await assert.rejects(() => service.listDir(project.id, '.dsh'))
    await assert.rejects(() => service.listDir(project.id, '../'))
    const text = await service.readTextFile(project.id, '创意剪辑/剪辑数据/match.json')
    assert.equal(text.content, '{}')
    await assert.rejects(() => service.readTextFile(project.id, '.dsh/project.json'))
    await assert.rejects(() => service.readTextFile(project.id, '.dsh/tags/清洗报告.json'))

    // Per-library session bookkeeping.
    await service.patchProject(project.id, { library: '创意剪辑', sessionId: 's-creative' })
    await service.patchProject(project.id, { library: '标签管理', sessionId: 's-gone' })
    await service.patchProject(project.id, { sessionId: 's-root' })
    const [entry] = await service.listProjects()
    assert.deepEqual(entry.sessions, { 创意剪辑: 's-creative' })
    assert.equal(entry.sessionId, 's-root')
  } finally {
    service.dispose()
    await rm(home, { recursive: true, force: true })
    await rm(root, { recursive: true, force: true })
  }
})

test('new projects get the three libraries, hidden tag data and nothing from v1', async () => {
  const home = await mkdtemp(path.join(os.tmpdir(), 'mw-lh-'))
  const root = await mkdtemp(path.join(os.tmpdir(), 'mw-lp-'))
  const service = createService({ home })
  try {
    await service.createProject({ path: root, name: '新项目' })
    for (const rel of ['原始素材库', '输出素材库/切片素材', '输出素材库/成片', '.dsh/tags/丢弃登记', '.dsh/tags/标签字典.yaml', '创意剪辑/00_主题简报.md', '创意剪辑/参考资料', '创意剪辑/剪辑数据']) assert.ok(existsSync(path.join(root, rel)), rel)
    for (const rel of ['标签管理', '00_brief', '01_creative', '02_raw', '03_clips', '05_edit', '06_export']) assert.ok(!existsSync(path.join(root, rel)), rel)
    const p = JSON.parse(await readFile(path.join(root, '.dsh/project.json'), 'utf8'))
    assert.equal(p.spec.targetDuration, null, 'target duration is set later in the 剪辑 tab')
  } finally {
    service.dispose()
    await rm(home, { recursive: true, force: true })
    await rm(root, { recursive: true, force: true })
  }
})
