// Local HTTP routes under /api/footage-culler/. They are served by the Harness
// connection service, which applies host authentication and Origin checks.
import { ServiceError } from './service.js'
import { createReadStream } from 'node:fs'
import { Readable } from 'node:stream'

export const API = '/api/footage-culler'
const MAX_BODY = 64 * 1024

async function readBody(request) {
  const len = Number(request.headers.get('content-length'))
  if (Number.isFinite(len) && len > MAX_BODY) throw new ServiceError('请求过大', 413)
  const text = await request.text()
  if (text.length > MAX_BODY) throw new ServiceError('请求过大', 413)
  if (!text) return {}
  try { return JSON.parse(text) } catch { throw new ServiceError('请求不是有效的 JSON') }
}

const json = (value, status = 200) => Response.json(value, { status, headers: { 'cache-control': 'no-store' } })

function failure(error, logger) {
  if (error instanceof ServiceError) return json({ code: error.code, error: error.message }, error.status)
  logger?.warn?.('footage-culler: route failed: %s', error?.message)
  return json({ code: 'INTERNAL', error: String(error?.message || error).slice(0, 300) }, 500)
}

/** @param {(route:object)=>unknown} register  ctx.connection.fetch.register */
export function registerRoutes(register, service, logger) {
  const route = (path, methods, handler) => register({
    path: `${API}${path}`, methods, requestBody: 'buffered',
    async fetch(request) {
      try { return await handler(request) } catch (error) { return failure(error, logger) }
    },
  })
  const query = (request, key) => new URL(request.url).searchParams.get(key)

  route('/state', ['GET'], async () => json(await service.state()))
  route('/folders/add', ['POST'], async (r) => json({ folders: await service.addFolder((await readBody(r)).path) }))
  route('/folders/remove', ['POST'], async (r) => json({ folders: await service.removeFolder((await readBody(r)).path) }))
  route('/settings', ['GET'], async () => json(await service.getSettings()))
  route('/settings/save', ['POST'], async (r) => json(await service.saveSettings(await readBody(r))))
  route('/settings/test', ['POST'], async () => json(await service.testVlm()))
  route('/scan', ['POST'], async (r) => { const b = await readBody(r); return json(await service.startScan({ folder: b.folder, recursive: b.recursive })) })
  route('/jobs', ['GET'], async () => json({ jobs: await service.listJobs() }))
  route('/job', ['GET'], async (r) => json(await service.job(query(r, 'id'))))
  route('/cancel', ['POST'], async (r) => json(await service.cancel((await readBody(r)).id)))
  route('/override', ['POST'], async (r) => { const b = await readBody(r); return json(await service.setOverride(b.id, b.segment, b.grade ?? null)) })
  route('/export', ['POST'], async (r) => { const b = await readBody(r); return json({ written: await service.export(b.id, { dest: b.dest, formats: b.formats, grades: b.grades }) }) })
  route('/thumb', ['GET'], async (r) => new Response(await service.thumb(query(r, 'id'), query(r, 'name')), { headers: { 'content-type': 'image/jpeg', 'cache-control': 'private, max-age=3600' } }))
  route('/preview', ['GET'], async (r) => {
    const { path, size } = await service.preview(query(r, 'id'), query(r, 'segment'))
    const range = r.headers.get('range')
    let start = 0, end = size - 1, status = 200
    if (range) {
      const match = /^bytes=(\d*)-(\d*)$/.exec(range)
      if (!match || (!match[1] && !match[2])) return new Response(null, { status: 416, headers: { 'content-range': `bytes */${size}` } })
      if (!match[1]) {
        const suffix = Number(match[2])
        start = Math.max(0, size - suffix)
      } else {
        start = Number(match[1])
        if (match[2]) end = Math.min(size - 1, Number(match[2]))
      }
      if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start > end || start >= size) {
        return new Response(null, { status: 416, headers: { 'content-range': `bytes */${size}` } })
      }
      status = 206
    }
    const headers = {
      'content-type': 'video/mp4', 'content-length': String(end - start + 1),
      'accept-ranges': 'bytes', 'cache-control': 'private, max-age=3600',
    }
    if (status === 206) headers['content-range'] = `bytes ${start}-${end}/${size}`
    return new Response(Readable.toWeb(createReadStream(path, { start, end })), { status, headers })
  })
}
