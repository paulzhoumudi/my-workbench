// v2 → v3 migration (标签管理 folder → .dsh/tags), tag templates and tag operations.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { createService } from '../src/server/lib/service.js'
import { parseDictionary, serializeDictionary } from '../src/server/lib/tags.js'

const put = async (root, rel, content = 'x') => { await mkdir(path.dirname(path.join(root, rel)), { recursive: true }); await writeFile(path.join(root, rel), content) }

async function withService(fn) {
  const home = await mkdtemp(path.join(os.tmpdir(), 'mw-th-'))
  const dirs = []
  const service = createService({ home })
  const folder = async () => { const d = await mkdtemp(path.join(os.tmpdir(), 'mw-tp-')); dirs.push(d); return d }
  try { await fn(service, folder, home) } finally {
    service.dispose()
    await rm(home, { recursive: true, force: true })
    for (const d of dirs) await rm(d, { recursive: true, force: true })
  }
}

/** Put clips with tags into a project's index (kept raws). */
async function seedClips(root, clips) {
  const raws = {}
  const map = {}
  for (const [id, tags] of Object.entries(clips)) {
    raws[`R_${id}`] = { id: `R_${id}`, path: `原始素材库/${id}.mp4`, status: 'kept', duration: 5 }
    map[id] = { id, rawId: `R_${id}`, proxy: `输出素材库/切片素材/${id}.mp4`, tags, aiTags: tags.map((tag) => ({ tag, confidence: 0.9 })), pendingTags: [], tagStatus: 'tagged' }
  }
  await put(root, '.dsh/index.json', JSON.stringify({ schema: 1, raws, clips: map }))
}

test('v2 projects: 标签管理 moves into .dsh/tags, user files stay', async () => {
  await withService(async (service, folder) => {
    const root = await folder()
    await put(root, '.dsh/project.json', JSON.stringify({ schema: 1, layout: 2, id: 'p_v2', name: 'v2 项目', template: 'product-ad', rawSources: [] }))
    for (const dir of ['原始素材库', '输出素材库/切片素材', '输出素材库/成片', '创意剪辑']) await mkdir(path.join(root, dir), { recursive: true })
    await put(root, '标签管理/标签字典.yaml', '继承: product-ad\n场景: [展台]\n待审: [反光]\n')
    await put(root, '标签管理/_history/标签字典_v1.yaml', '场景: []\n')
    await put(root, '标签管理/清洗报告.json', '{"imported":1}')
    await put(root, '标签管理/丢弃登记/C0002.json', '{}')
    await put(root, '标签管理/我的笔记.txt', '用户自己的文件')
    await put(root, '.dsh/creative.json', JSON.stringify({ files: {}, editUse: {} }))

    const { project } = await service.createProject({ path: root })
    const { root: r } = await service.open(project.id)
    for (const rel of ['.dsh/tags/标签字典.yaml', '.dsh/tags/_history/标签字典_v1.yaml', '.dsh/tags/清洗报告.json', '.dsh/tags/丢弃登记/C0002.json']) assert.ok(existsSync(path.join(r, rel)), rel)
    assert.ok(existsSync(path.join(r, '标签管理/我的笔记.txt')), 'user files are never moved')
    assert.ok(!existsSync(path.join(r, '标签管理/标签字典.yaml')))
    assert.ok(!existsSync(path.join(r, '标签管理/丢弃登记')), 'emptied folders removed')
    const p = JSON.parse(await readFile(path.join(r, '.dsh/project.json'), 'utf8'))
    assert.equal(p.layout, 3)
    const o = await service.overview(project.id)
    assert.deepEqual(o.libraries.map((l) => l.dir), ['原始素材库', '输出素材库', '创意剪辑'])
    assert.equal(o.material.tags.inheritLabel, '产品广告')
    assert.ok(o.material.tags.dims.find((d) => d.dim === '场景').tags.some((t) => t.tag === '展台' && !t.fromTemplate))
    assert.deepEqual(o.material.tags.pending.map((p) => p.tag), ['反光'])
    // 标签管理 is now an ordinary user folder, not a library.
    const top = await service.listDir(project.id, '')
    assert.equal(top.items.find((i) => i.name === '标签管理').library, null)
  })
})

test('dictionary keeps suggested dimensions for 待审 tags', () => {
  const dict = parseDictionary('继承: vlog-base\n场景: [湖边]\n待审: {金属反光: 主体, 夜景: null}\n')
  assert.deepEqual(dict.pending, ['金属反光', '夜景'])
  assert.deepEqual(dict.pendingDims, { 金属反光: '主体' })
  const again = parseDictionary(serializeDictionary(dict))
  assert.deepEqual(again.pending, dict.pending)
  assert.deepEqual(again.pendingDims, dict.pendingDims)
  assert.deepEqual(parseDictionary(serializeDictionary({ ...dict, pending: ['a'], pendingDims: {} })).pending, ['a'])
})

test('tag operations: add, move, add/delete dimension, suggest, batch approve, template-tag guard', async () => {
  await withService(async (service, folder) => {
    const root = await folder()
    const { project } = await service.createProject({ path: root, name: '标签测试', template: 'vlog-base' })
    const id = project.id
    await seedClips(root, { C1: ['人物', '近景'] })
    await service.tagOperation(id, { op: 'add', tag: '咖啡杯', dim: '主体' })
    await service.tagOperation(id, { op: 'add-dim', dim: '光线' })
    await service.tagOperation(id, { op: 'move', tag: '咖啡杯', dim: '光线' })
    let tags = (await service.overview(id)).material.tags
    assert.deepEqual(tags.dims.find((d) => d.dim === '光线').tags.map((t) => t.tag), ['咖啡杯'])
    assert.equal(tags.dims.find((d) => d.dim === '光线').base, false)
    await assert.rejects(() => service.tagOperation(id, { op: 'delete-dim', dim: '光线' }), /还有标签/)
    await assert.rejects(() => service.tagOperation(id, { op: 'delete', tag: '人物' }), /来自模板/)
    await assert.rejects(() => service.tagOperation(id, { op: 'move', tag: '人物', dim: '场景' }), /来自模板/)
    await service.tagOperation(id, { op: 'delete', tag: '咖啡杯' })
    await service.tagOperation(id, { op: 'delete-dim', dim: '光线' })
    await assert.rejects(() => service.tagOperation(id, { op: 'delete-dim', dim: '场景' }), /基础维度/)

    const s = await service.suggestTags(id, [{ tag: '逆光', dim: '情绪' }, { tag: '人物', dim: '主体' }, '露营'])
    assert.deepEqual(s.added, [{ tag: '逆光', dim: '情绪' }, { tag: '露营' }])
    assert.equal(s.skipped.length, 1)
    tags = (await service.overview(id)).material.tags
    assert.deepEqual(tags.pending.map((p) => [p.tag, p.suggestedDim]), [['逆光', '情绪'], ['露营', null]])
    const docBefore = await service.creative.read(root, '标签字典.yaml')
    const r = await service.tagOperation(id, { ops: [{ op: 'approve', tag: '逆光', dim: '情绪' }, { op: 'reject', tag: '露营' }] })
    assert.match(r.summary, /2 项标签操作/)
    const docAfter = await service.creative.read(root, '标签字典.yaml')
    assert.equal(docAfter.version, docBefore.version + 1, 'a batch is one dictionary version')
    tags = (await service.overview(id)).material.tags
    assert.equal(tags.pending.length, 0)
    assert.ok(tags.dims.find((d) => d.dim === '情绪').tags.some((t) => t.tag === '逆光'))
  })
})

test('templates: switch keeps used tags, edit preserves tags in use, save-as, delete guard, reset', async () => {
  await withService(async (service, folder) => {
    const a = await folder()
    const b = await folder()
    const { project: pa } = await service.createProject({ path: a, name: '项目A', template: 'vlog-base' })
    const { project: pb } = await service.createProject({ path: b, name: '项目B', template: 'vlog-base' })
    await seedClips(a, { C1: ['自拍', '航拍'] })

    const { templates } = await service.listTemplates(pa.id)
    assert.deepEqual(templates.map((t) => t.key), ['vlog-base', 'product-ad'])

    // Switch A: vlog-base → product-ad. 自拍 / 航拍 are used, so they stay as project tags.
    const preview = await service.switchProjectTemplate(pa.id, 'product-ad')
    assert.equal(preview.applied, undefined)
    assert.deepEqual(preview.kept.sort(), ['自拍', '航拍'].sort())
    assert.ok(preview.dropped.includes('食物'))
    assert.ok(preview.added.includes('棚拍'))
    await service.switchProjectTemplate(pa.id, 'product-ad', { apply: true })
    let tags = (await service.overview(pa.id)).material.tags
    assert.equal(tags.inherit, 'product-ad')
    const all = tags.dims.flatMap((d) => d.tags)
    assert.ok(all.find((t) => t.tag === '自拍' && !t.fromTemplate))
    assert.ok(all.find((t) => t.tag === '棚拍' && t.fromTemplate))
    assert.ok(!all.find((t) => t.tag === '食物'))
    assert.equal(JSON.parse(await readFile(path.join(a, '.dsh/project.json'), 'utf8')).template, 'product-ad')
    await assert.rejects(() => service.switchProjectTemplate(pa.id, 'product-ad'), /已经在使用/)

    // Edit product-ad: drop 棚拍 (used by a clip in A) and add 开箱.
    await seedClips(a, { C1: ['自拍', '航拍'], C2: ['棚拍'] })
    const current = (await service.listTemplates()).templates.find((t) => t.key === 'product-ad')
    const dims = { ...current.dims, 场景: current.dims.场景.filter((t) => t !== '棚拍'), 用途: [...current.dims.用途, '开箱'] }
    const saved = await service.saveTemplate('product-ad', { label: '产品广告', dims })
    assert.equal(saved.template.edited, true)
    assert.deepEqual(saved.preserved, [{ project: '项目A', tags: ['棚拍'] }])
    tags = (await service.overview(pa.id)).material.tags
    assert.ok(tags.dims.flatMap((d) => d.tags).find((t) => t.tag === '棚拍' && !t.fromTemplate), '棚拍 kept as a project tag')
    assert.ok(tags.dims.flatMap((d) => d.tags).find((t) => t.tag === '开箱' && t.fromTemplate))

    // Save A's tags as a new template and use it.
    const created = await service.createTemplate({ label: '家电广告', fromProject: pa.id, use: true })
    assert.equal(created.switched, created.template.key)
    assert.ok(created.template.dims.场景.includes('棚拍'))
    tags = (await service.overview(pa.id)).material.tags
    assert.equal(tags.inheritLabel, '家电广告')
    assert.ok(tags.dims.flatMap((d) => d.tags).every((t) => t.fromTemplate), 'project list is folded into the template')
    await assert.rejects(() => service.createTemplate({ label: '家电广告', dims: {} }), /已经有名为/)

    // New projects can start from it.
    const c = await folder()
    const { project: pc } = await service.createProject({ path: c, name: '项目C', template: created.template.key })
    assert.equal((await service.overview(pc.id)).material.tags.inheritLabel, '家电广告')

    // Delete is refused while projects use it.
    await assert.rejects(() => service.removeTemplate(created.template.key), /还有项目在用/)
    await assert.rejects(() => service.removeTemplate('vlog-base'), /内置模板不能删除/)
    await service.switchProjectTemplate(pc.id, 'vlog-base', { apply: true })
    await service.switchProjectTemplate(pa.id, 'vlog-base', { apply: true })
    await service.removeTemplate(created.template.key)
    assert.ok(!(await service.listTemplates()).templates.some((t) => t.key === created.template.key))

    // Reset a built-in template.
    const reset = await service.resetTemplate('product-ad')
    assert.equal(reset.template.edited, false)
    assert.ok(reset.template.dims.场景.includes('棚拍'))
    // B was untouched by A's edits.
    assert.equal((await service.overview(pb.id)).material.tags.inherit, 'vlog-base')
  })
})
