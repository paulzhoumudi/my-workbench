// Local stand-in for DSH Desktop: mounts the real server plugin on a Node HTTP
// server and serves a page that loads lib/client.js through a fake module
// loader and workbench host. Usage: node test/harness/serve.mjs [port]
import http from 'node:http'
import { mkdtemp, readFile, mkdir } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { Readable } from 'node:stream'
import { createService } from '../../src/server/lib/service.js'
import { registerRoutes } from '../../src/server/lib/routes.js'
import { buildDemo } from './demo-data.mjs'

const here = path.dirname(fileURLToPath(import.meta.url))
const pkg = path.join(here, '..', '..')
const port = Number(process.argv[2] || 4870)
const base = await mkdtemp(path.join(os.tmpdir(), 'mw-harness-'))
const home = path.join(base, 'home')
const demoDir = path.join(base, '东湖秋日Vlog')
const pickDir = path.join(base, '新项目文件夹')
await mkdir(demoDir, { recursive: true })
await mkdir(pickDir, { recursive: true })

const routes = []
const ctx = { logger: console, connection: { fetch: { register: (r) => routes.push(r) } } }
const service = createService({ home, logger: console })
registerRoutes(ctx, service)
if (process.env.EMPTY !== '1') await buildDemo(service, demoDir, { render: process.env.RENDER !== '0' })

const page = (await readFile(path.join(here, 'host.html'), 'utf8')).replace('__PICK_DIR__', JSON.stringify(pickDir)).replace('__DEMO_DIR__', JSON.stringify(demoDir))

http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://127.0.0.1:${port}`)
  try {
    if (url.pathname === '/') { res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); return res.end(page) }
    if (url.pathname === '/client.js') { res.writeHead(200, { 'content-type': 'text/javascript' }); return res.end(await readFile(path.join(pkg, 'lib', 'client.js'))) }
    if (url.pathname.startsWith('/vendor/')) {
      const file = { '/vendor/react.js': 'react/umd/react.development.js', '/vendor/react-dom.js': 'react-dom/umd/react-dom.development.js' }[url.pathname]
      res.writeHead(200, { 'content-type': 'text/javascript' })
      return res.end(await readFile(path.join(pkg, 'node_modules', file)))
    }
    const route = routes.find((r) => r.path === url.pathname)
    if (!route) { res.writeHead(404); return res.end('not found') }
    const chunks = []
    for await (const chunk of req) chunks.push(chunk)
    const request = new Request(url, { method: req.method, headers: req.headers, body: ['GET', 'HEAD'].includes(req.method) ? undefined : Buffer.concat(chunks) })
    const response = await route.fetch(request)
    res.writeHead(response.status, Object.fromEntries(response.headers))
    if (response.body) Readable.fromWeb(response.body).pipe(res)
    else res.end()
  } catch (error) {
    console.error(error)
    res.writeHead(500)
    res.end(String(error))
  }
}).listen(port, '127.0.0.1', () => console.log(`harness ready http://127.0.0.1:${port}  (data in ${base})`))
