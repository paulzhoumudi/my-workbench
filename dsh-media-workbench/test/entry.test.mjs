// Loads the BUILT server entry (dsh/index.js) the way Harness does and checks
// the plugin contract: routes, agent tools through the real defineTool,
// approval policy, skill and prompt section. Needs the @deepseek-ai host
// packages resolvable (skipped otherwise) — run `npm run build` first.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, rm, mkdir } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

let plugin
try { plugin = await import('../dsh/index.js') } catch (error) { plugin = null; console.log('skip entry test:', error.message) }

test('server entry registers routes, tools, approval, skill and prompt', { skip: !plugin }, async () => {
  const home = await mkdtemp(path.join(os.tmpdir(), 'mw-entry-'))
  const project = await mkdtemp(path.join(os.tmpdir(), 'mw-entry-proj-'))
  const routes = []
  const tools = []
  const listeners = {}
  const providers = []
  const sections = []
  const disposers = []
  const ctx = {
    logger: { info() {}, warn() {} },
    connection: { fetch: { register: (r) => routes.push(r) } },
    tools: { register: (t) => tools.push(t) },
    skills: { registerProvider: (fn) => providers.push(fn()) },
    systemPrompt: { section: (s) => sections.push(s) },
    on: (name, fn) => { (listeners[name] ||= []).push(fn) },
    effect: (fn) => { const d = fn(); if (typeof d === 'function') disposers.push(d) },
    inject: async (names, cb) => { if (names.every((n) => ctx[n])) await cb(ctx) }
  }
  try {
    assert.equal(plugin.name, 'dsh-media-workbench')
    assert.deepEqual(plugin.inject, ['connection'])
    assert.equal(typeof plugin.Config, 'function', 'Config is a Schemastery schema')
    plugin.apply(ctx, { root: home })
    await new Promise((r) => setTimeout(r, 300))
    assert.ok(routes.every((r) => r.path.startsWith('/api/dsh-media-workbench/')), 'own prefix only')
    assert.ok(routes.length >= 25)
    assert.equal(new Set(routes.map((r) => r.path)).size, routes.length, 'one registration per path (Harness rejects duplicates)')
    assert.equal(tools.length, 26)
    for (const t of tools) assert.ok(t.name.startsWith('media_') && typeof t.execute === 'function' && t.parameters, t.name)
    assert.equal(sections[0].name, 'tool:dsh-media-workbench')
    const skill = await providers[0].get({ name: 'media-workbench' })
    assert.match(skill.content, /分镜脚本表格/)

    // A project created through the panel route, then the approval policy for a tag rename.
    const create = routes.find((r) => r.path.endsWith('/projects/create'))
    await mkdir(path.join(project, '原始素材库'), { recursive: true })
    const res = await create.fetch(new Request('http://x/api/dsh-media-workbench/projects/create', { method: 'POST', body: JSON.stringify({ path: project, name: '入口测试' }) }))
    assert.equal(res.status, 200, await res.clone().text())
    const pre = listeners['tools/pre-execute'][0]
    const exec = (name, args) => ({ name, arguments: args, agent: { session: { header: { cwd: project } } } })
    const ask = await pre(exec('media_tags_update', { op: 'add', tag: '芦苇', dim: '场景' }), async () => ({ kind: 'allow' }))
    assert.equal(ask.kind, 'ask')
    assert.match(ask.displayReason.zh, /新增「芦苇」/)
    const plain = await pre(exec('media_context', {}), async () => ({ kind: 'allow' }))
    assert.equal(plain.kind, 'allow')
    const denied = await pre(exec('media_tags_update', { op: 'add', tag: 'x', dim: '场景' }), async () => ({ kind: 'deny', reason: 'policy' }))
    assert.equal(denied.kind, 'deny', 'never turns a denial into an ask')
    const other = await pre(exec('bash', {}), async () => ({ kind: 'allow' }))
    assert.equal(other.kind, 'allow', 'other tools untouched')

    // Tool executes through the real defineTool wrapper.
    const ctxTool = tools.find((t) => t.name === 'media_context')
    const value = await ctxTool.execute({}, { ...exec('media_context', {}), signal: new AbortController().signal })
    assert.equal(value.project.name, '入口测试')
    const bad = tools.find((t) => t.name === 'media_creative_read')
    await assert.rejects(() => bad.execute({ file: '02_文案.md' }, { name: 'media_creative_read', arguments: {}, agent: { session: { header: { cwd: os.tmpdir() } } }, signal: new AbortController().signal }), /不是媒体项目/)
  } finally {
    disposers.forEach((d) => d())
    await rm(home, { recursive: true, force: true })
    await rm(project, { recursive: true, force: true })
  }
})
