import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import path from 'node:path'
import { Readable } from 'node:stream'
import { WorkbenchError, appendLog } from './util.js'

export const API = '/api/dsh-media-workbench'

const NO_STORE = { 'cache-control': 'no-store' }
const MIME = { '.jpg': 'image/jpeg', '.mp4': 'video/mp4', '.mov': 'video/quicktime', '.m4v': 'video/mp4', '.srt': 'text/plain; charset=utf-8', '.json': 'application/json; charset=utf-8' }

async function body(request, limit = 4 * 1024 * 1024) {
  const text = await request.text()
  if (text.length > limit) throw new WorkbenchError('请求过大。', 413)
  if (!text) return {}
  try {
    const value = JSON.parse(text)
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('not an object')
    return value
  } catch { throw new WorkbenchError('请求体不是有效的 JSON。') }
}

function failure(error, logger) {
  const known = error instanceof WorkbenchError
  if (!known) logger?.warn?.('media-workbench: request failed: %s', error?.stack || error)
  return Response.json({ error: known ? error.message : `处理失败：${error?.message || error}`, code: known ? error.code : 'INTERNAL' }, { status: known ? error.status : 500, headers: NO_STORE })
}

/** Register every panel endpoint under /api/dsh-media-workbench/ (own prefix only). */
export function registerRoutes(ctx, service) {
  const logger = ctx.logger
  // Harness allows exactly one registration per path, so methods sharing a
  // path are collected first and registered together at the end.
  const table = new Map()
  const route = (method, sub, handler) => {
    const path = `${API}${sub}`
    if (!table.has(path)) table.set(path, {})
    const methods = table.get(path)
    if (methods[method]) throw new Error(`duplicate route ${method} ${path}`)
    methods[method] = handler
  }
  const flush = () => {
    for (const [path, handlers] of table) {
      ctx.connection.fetch.register({
        path,
        methods: Object.keys(handlers),
        requestBody: 'buffered',
        async fetch(request) {
          try {
            const handler = handlers[request.method]
            if (!handler) return Response.json({ error: 'Method not allowed' }, { status: 405, headers: NO_STORE })
            const url = new URL(request.url)
            const input = request.method === 'GET' ? Object.fromEntries(url.searchParams) : await body(request)
            const result = await handler(input, request)
            if (result instanceof Response) return result
            return Response.json(result ?? { ok: true }, { headers: NO_STORE })
          } catch (error) { return failure(error, logger) }
        }
      })
    }
  }
  const need = (value, label) => {
    if (typeof value !== 'string' || !value) throw new WorkbenchError(`缺少参数：${label}`)
    return value
  }
  const job = async (promise) => {
    const { job, joined } = await promise
    return { job, joined }
  }
  const logged = async (projectId, action, fn) => {
    const result = await fn()
    try { const { root } = await service.open(projectId); await appendLog(root, { action, by: 'panel' }); service.bump(root) } catch { /* log only */ }
    return result
  }

  route('GET', '/projects', async () => ({ projects: await service.listProjects() }))
  route('POST', '/projects/create', (input) => service.createProject({ path: need(input.path, 'path'), name: input.name, spec: input.spec, template: input.template }))
  route('POST', '/projects/patch', (input) => service.patchProject(need(input.project, 'project'), input))
  route('POST', '/projects/relocate', (input) => service.relocate(need(input.project, 'project'), need(input.path, 'path')))
  route('POST', '/projects/remove', (input) => service.removeProject(need(input.project, 'project')))
  route('GET', '/revision', async (input) => {
    const { root } = await service.open(need(input.project, 'project'))
    const jobs = await service.jobs.list(root)
    return { revision: service.revision(root), running: jobs.running }
  })
  route('GET', '/overview', (input) => service.overview(need(input.project, 'project')))
  route('GET', '/tree', (input) => service.listDir(need(input.project, 'project'), input.path || ''))
  route('GET', '/text', (input) => service.readTextFile(need(input.project, 'project'), need(input.path, 'path')))
  route('POST', '/context', async (input) => { service.setContext(need(input.project, 'project'), { tab: input.tab, sessionId: input.sessionId || null }); return { ok: true } })

  // Creative documents
  route('GET', '/doc', async (input) => { const { root } = await service.open(need(input.project, 'project')); return service.creative.read(root, need(input.file, 'file'), input.ref) })
  route('POST', '/doc/save', async (input) => {
    const { root } = await service.open(need(input.project, 'project'))
    const result = await service.creative.write(root, need(input.file, 'file'), input.content, { source: 'manual', expectedHash: input.expectedHash })
    service.bump(root)
    return result
  })
  route('GET', '/doc/diff', async (input) => { const { root } = await service.open(need(input.project, 'project')); return service.creative.diff(root, need(input.file, 'file'), need(input.from, 'from'), input.to) })
  route('POST', '/doc/rollback', async (input) => { const { root } = await service.open(need(input.project, 'project')); const r = await service.creative.rollback(root, need(input.file, 'file'), need(input.ref, 'ref')); service.bump(root); return r })
  route('POST', '/doc/edit-use', async (input) => { const { root } = await service.open(need(input.project, 'project')); const r = await service.creative.setEditUse(root, need(input.file, 'file')); service.bump(root); return r })

  // Tags
  route('GET', '/tags/impact', (input) => service.tagImpact(need(input.project, 'project'), input))
  route('POST', '/tags/op', (input) => service.tagOperation(need(input.project, 'project'), input, { source: 'manual' }))
  route('GET', '/tags/history', async (input) => {
    const { root } = await service.open(need(input.project, 'project'))
    const docs = await service.creative.list(root)
    return docs.find((d) => d.key === '标签字典.yaml') || null
  })

  // Tag templates (global, shared by all projects)
  route('GET', '/templates', (input) => service.listTemplates(input.project || null))
  route('POST', '/templates/switch', (input) => service.switchProjectTemplate(need(input.project, 'project'), need(input.key, 'key'), { apply: input.apply === true }))
  route('POST', '/templates/save', (input) => service.saveTemplate(need(input.key, 'key'), { label: input.label, dims: input.dims }))
  route('POST', '/templates/create', (input) => service.createTemplate({ label: input.label, dims: input.dims, fromProject: input.fromProject || null, use: input.use === true }))
  route('POST', '/templates/remove', (input) => service.removeTemplate(need(input.key, 'key')))
  route('POST', '/templates/reset', (input) => service.resetTemplate(need(input.key, 'key')))

  // Footage
  route('GET', '/clips', async (input) => {
    const { root } = await service.open(need(input.project, 'project'))
    return service.media.listClips(root, { tag: input.tag, filter: input.filter, rawId: input.raw, limit: Math.min(Number(input.limit) || 300, 2000), offset: Number(input.offset) || 0 })
  })
  route('POST', '/clips/review', async (input) => {
    const { root } = await service.open(need(input.project, 'project'))
    const r = await service.media.review(root, need(input.clipId, 'clipId'), Array.isArray(input.tags) ? input.tags.map(String) : [], { reviewed: input.reviewed !== false })
    service.bump(root)
    return r
  })
  route('POST', '/media/run', (input) => job(service.runStep(need(input.project, 'project'), need(input.step, 'step'), { force: input.force === true, rawIds: Array.isArray(input.rawIds) ? input.rawIds : undefined, clipIds: Array.isArray(input.clipIds) ? input.clipIds : undefined })))
  route('POST', '/media/restore', async (input) => {
    const { root, project } = await service.open(need(input.project, 'project'))
    const r = await service.media.restore(root, project, Array.isArray(input.rawIds) ? input.rawIds : [need(input.rawId, 'rawId')])
    service.bump(root)
    return r
  })
  route('GET', '/jobs', async (input) => { const { root } = await service.open(need(input.project, 'project')); return service.jobs.list(root) })
  route('POST', '/jobs/cancel', async (input) => { const { root } = await service.open(need(input.project, 'project')); return { cancelled: service.jobs.cancel(root, input.jobId) } })

  // Edit
  route('POST', '/edit/spec', async (input) => { const { root, project } = await service.open(need(input.project, 'project')); const r = await service.edit.setSpec(root, project, input.spec || {}); service.bump(root); return r })
  route('POST', '/edit/match', (input) => logged(input.project, 'edit.match', async () => { const { root } = await service.open(need(input.project, 'project')); return service.edit.match(root, { keepManual: input.keepManual !== false }) }))
  route('POST', '/edit/select', async (input) => { const { root } = await service.open(need(input.project, 'project')); const r = await service.edit.select(root, need(input.no, 'no'), input.clipId || null); service.bump(root); return r })
  route('POST', '/edit/gaps', async (input) => { const { root } = await service.open(need(input.project, 'project')); const r = await service.edit.gaps(root); service.bump(root); return r })
  route('POST', '/edit/timeline', async (input) => { const { root, project } = await service.open(need(input.project, 'project')); const r = await service.edit.buildTimeline(root, project); service.bump(root); return { duration: r.duration, segments: r.tracks.video.length, warnings: r.warnings } })
  route('POST', '/edit/capcut', async (input) => { const { root, project } = await service.open(need(input.project, 'project')); return service.edit.capcutDraft(root, project) })

  // Files, reveal, settings
  route('POST', '/reveal', (input) => service.reveal(need(input.project, 'project'), input.path))
  route('GET', '/settings', async () => ({ settings: await service.readSettings(), ffmpeg: await service.ffmpeg.detect(), eagle: await service.eagle.info() }))
  route('POST', '/settings', async (input) => ({ settings: await service.writeSettings(input), ffmpeg: await service.ffmpeg.detect(), eagle: await service.eagle.info() }))

  flush()
  ctx.connection.fetch.register({
    path: `${API}/file`,
    methods: ['GET'],
    requestBody: 'buffered',
    async fetch(request) {
      try {
        const url = new URL(request.url)
        const file = await service.fileFor(url.searchParams.get('project') || '', url.searchParams.get('path') || '')
        const info = await stat(file)
        const type = MIME[path.extname(file).toLowerCase()] || 'application/octet-stream'
        const range = request.headers.get('range')
        const headers = { 'content-type': type, 'accept-ranges': 'bytes', 'cache-control': 'no-cache' }
        if (range) {
          const match = range.match(/bytes=(\d*)-(\d*)/)
          let start = match?.[1] ? Number(match[1]) : 0
          let end = match?.[2] ? Number(match[2]) : Math.min(info.size - 1, start + 8 * 1024 * 1024 - 1)
          if (!match?.[1] && match?.[2]) { start = Math.max(0, info.size - Number(match[2])); end = info.size - 1 }
          if (start >= info.size) return new Response(null, { status: 416, headers: { 'content-range': `bytes */${info.size}` } })
          end = Math.min(end, info.size - 1)
          return new Response(Readable.toWeb(createReadStream(file, { start, end })), { status: 206, headers: { ...headers, 'content-range': `bytes ${start}-${end}/${info.size}`, 'content-length': String(end - start + 1) } })
        }
        return new Response(Readable.toWeb(createReadStream(file)), { headers: { ...headers, 'content-length': String(info.size) } })
      } catch (error) { return failure(error, logger) }
    }
  })
}
