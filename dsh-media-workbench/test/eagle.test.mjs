// Eagle sync against a mock of the Eagle local API (v1 endpoints).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import http from 'node:http'
import { mkdtemp, mkdir, copyFile, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createService } from '../src/server/lib/service.js'

import { ensureFixtures } from './make-fixtures.mjs'
const fixtures = ensureFixtures()

function mockEagle() {
  const state = { folders: [], items: [], seq: 0 }
  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, 'http://x')
    let body = ''
    for await (const chunk of req) body += chunk
    const json = body ? JSON.parse(body) : {}
    const ok = (data) => { res.writeHead(200, { 'content-type': 'application/json' }); res.end(JSON.stringify({ status: 'success', data })) }
    if (url.pathname === '/api/application/info') return ok({ version: '4.0.0', platform: 'win32' })
    if (url.pathname === '/api/folder/list') return ok(state.folders)
    if (url.pathname === '/api/folder/create') { const f = { id: `F${++state.seq}`, name: json.folderName, children: [] }; state.folders.push(f); return ok(f) }
    if (url.pathname === '/api/item/addFromPaths') { for (const item of json.items) state.items.push({ id: `I${++state.seq}`, name: item.name, tags: item.tags, annotation: item.annotation, folders: [json.folderId], path: item.path }); return ok(null) }
    if (url.pathname === '/api/item/list') { const page = Number(url.searchParams.get('offset') || 0); return ok(page ? [] : state.items.filter((i) => i.folders.includes(url.searchParams.get('folders')))) }
    if (url.pathname === '/api/item/update') { const item = state.items.find((i) => i.id === json.id); Object.assign(item, { tags: json.tags, annotation: json.annotation }); return ok(item) }
    res.writeHead(404); res.end('{}')
  })
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve({ server, state, port: server.address().port })))
}

test('eagle push / update / pull / missing', { timeout: 300_000 }, async () => {
  const eagle = await mockEagle()
  const home = await mkdtemp(path.join(os.tmpdir(), 'mw-eh-'))
  const dir = await mkdtemp(path.join(os.tmpdir(), 'mw-ep-'))
  await mkdir(path.join(dir, '原始素材库'))
  for (const name of ['C0001.MP4', 'C0007.MP4']) await copyFile(path.join(fixtures, name), path.join(dir, '原始素材库', name))
  const service = createService({ home })
  try {
    await service.writeSettings({ eaglePort: eagle.port })
    const { project } = await service.createProject({ path: dir, name: 'Eagle 测试' })
    const { root } = await service.open(project.id)
    assert.equal(eagle.state.folders[0].name, 'Eagle 测试', 'folder created with the project when Eagle runs')
    for (const step of ['import', 'clean', 'split']) assert.equal((await (await service.runStep(project.id, step)).done).status, 'done')
    await service.creative.write(root, '标签字典.yaml', '继承: vlog-base\n场景: [湖边步道]\n待审: []\n', { source: 'chat' })
    const index = await service.indexStore.read(root)
    await service.media.applyTags(root, Object.keys(index.clips).map((clipId) => ({ clipId, tags: [{ tag: '湖边步道', confidence: 0.9 }, { tag: '固定', confidence: 0.9 }] })))
    const push = await (await service.runStep(project.id, 'eagle-push')).done
    assert.equal(push.status, 'done', push.error)
    assert.equal(push.result.added, 3)
    assert.equal(push.result.mapped, 3)
    assert.ok(eagle.state.items[0].annotation.includes('原片：原始素材库/'))
    // Rename propagates and re-syncs.
    await service.tagOperation(project.id, { op: 'rename', tag: '湖边步道', to: '湖畔' })
    const again = await (await service.runStep(project.id, 'eagle-push')).done
    assert.equal(again.result.updated, 3)
    assert.ok(eagle.state.items.every((i) => i.tags.includes('湖畔')))
    // Edit in Eagle → pull.
    eagle.state.items[0].tags = ['湖畔', '航拍', '不在字典的词']
    eagle.state.items.splice(2, 1)
    const pull = await (await service.runStep(project.id, 'eagle-pull')).done
    assert.equal(pull.status, 'done', pull.error)
    assert.equal(pull.result.changed, 1)
    assert.equal(pull.result.missing, 1)
    assert.deepEqual(pull.result.outsideDictionary, ['不在字典的词'])
    const report = await service.media.computeReport(root, (await service.open(project.id)).project)
    assert.equal(report.eagleSynced, 2)
    assert.equal(report.eagleMissing, 1)
  } finally {
    service.dispose()
    eagle.server.close()
    await rm(home, { recursive: true, force: true })
    await rm(dir, { recursive: true, force: true })
  }
})
