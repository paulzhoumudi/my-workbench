import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { randomUUID } from 'node:crypto'
import { buildSegments, measureWindows, resolveThresholds } from '../engine/analyze.mjs'
import { gradeCandidate } from '../engine/grade.mjs'
import { normalizeReview } from '../engine/vlm.mjs'
import { createService } from '../dsh/service.js'
import { registerRoutes } from '../dsh/routes.js'
import { footageTools } from '../dsh/tools.js'
import { resolveTools, run } from '../engine/tools.mjs'

test('short but usable material is sent to review rather than archived', () => {
  const windows = [{ t0: 0, t1: 1, score: 92, bad: false, flags: [], focus: 2, focusRel: 1, shake: 0, mean: 120, motion: 0 }]
  const { segments, rejected } = buildSegments(windows, [], resolveThresholds())
  assert.equal(rejected.length, 0)
  assert.equal(segments.length, 1)
  assert.equal(segments[0].short, true)
  assert.equal(gradeCandidate(segments[0], null).grade, 'B')
})

test('hard cuts inside a second become exact segment boundaries', () => {
  const motion = Array.from({ length: 30 }, (_, i) => ({ t: i / 10, dx: 0, dy: 0, hd: i === 13 ? 0.9 : 0, mean: 120, std: 30, clipHi: 0, clipLo: 0 }))
  const focus = Array.from({ length: 6 }, (_, i) => ({ t: i / 2, focus: 2, texturedFraction: 0.5 }))
  const { windows, cuts } = measureWindows({ motion, focus, motionFps: 10, sizes: { motion: { w: 480 } } }, { duration: 3 }, resolveThresholds())
  assert.deepEqual(cuts, [1.3])
  assert.ok(windows.some((w) => w.t1 === 1.3))
  assert.ok(windows.some((w) => w.t0 === 1.3))
})

test('incomplete model output cannot silently approve content', () => {
  assert.throws(() => normalizeReview({ aesthetic: 9, composition: 9 }), /missing required/)
  const review = normalizeReview({ usable: true, subject_clear: true, aesthetic: 8, composition: 8, issues: ['无穿帮'], reason: '画面干净' })
  const seg = { tech: { score: 90 }, flags: [], duration: 4, short: false }
  assert.equal(gradeCandidate(seg, review).grade, 'A')
  assert.equal(gradeCandidate(seg, { ...review, issues: ['穿帮'] }).grade, 'C')
})

test('agent tools use the JSON output schema accepted by the desktop host', () => {
  const definitions = footageTools((definition) => definition, {})
  assert.equal(definitions.length, 5)
  for (const definition of definitions) assert.deepEqual(definition.output.schema, { type: 'json' })
})

test('preview is generated on demand and supports byte range playback', async (t) => {
  const { ffmpeg } = await resolveTools()
  if (!ffmpeg) return t.skip('ffmpeg not installed')
  const base = await mkdtemp(join(process.cwd(), '.test-footage-culler-'))
  t.after(async () => { if (dirname(base) === process.cwd()) await rm(base, { recursive: true, force: true }) })
  const source = join(base, 'source.mp4')
  await run(ffmpeg, ['-hide_banner', '-nostdin', '-loglevel', 'error', '-f', 'lavfi', '-i', 'testsrc2=size=640x360:rate=25', '-t', '2', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', source], { maxBytes: 1024 })
  const root = join(base, 'data')
  const id = randomUUID()
  const jobDir = join(root, 'jobs', id)
  await mkdir(jobDir, { recursive: true })
  await writeFile(join(jobDir, 'results.json'), JSON.stringify({
    id, status: 'done', request: {}, files: [{ status: 'judged', path: source,
      segments: [{ id: '0-s0', start: 0.25, end: 1.75, duration: 1.5 }], rejected: [] }],
  }))
  const service = createService({ root, secret: { read: async () => undefined, write: async () => {} } })
  const preview = await service.preview(id, '0-s0')
  assert.ok(preview.size > 1000)
  assert.equal((await readFile(preview.path)).toString('ascii', 4, 8), 'ftyp')
  const routes = new Map()
  registerRoutes((route) => routes.set(route.path, route), service)
  const request = new Request(`http://localhost/api/footage-culler/preview?id=${id}&segment=0-s0`, { headers: { range: 'bytes=0-15' } })
  const response = await routes.get('/api/footage-culler/preview').fetch(request)
  assert.equal(response.status, 206)
  assert.equal(response.headers.get('content-length'), '16')
  assert.equal((await response.arrayBuffer()).byteLength, 16)
  await assert.rejects(() => service.preview(id, '../source'), /无效/)
})
