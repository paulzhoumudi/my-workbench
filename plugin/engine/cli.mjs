#!/usr/bin/env node
// Command-line entry. The DSH plugin runs `scan --job-dir` in a child process
// (so decoding never blocks the Harness host). It also works standalone for
// overnight batches on a workstation or NAS-attached machine.
//
//   node engine/cli.mjs scan --input <dir|file> [--input ...] --out <jobDir>
//        [--strictness loose|standard|strict] [--log] [--lut <file.cube>] [--min-segment 2]
//        [--vlm-base-url <url> --vlm-model <name>]   (API key from env FOOTAGE_VLM_API_KEY)
//   node engine/cli.mjs scan --job-dir <jobDir> --secrets-stdin     (used by the plugin)
//   node engine/cli.mjs export --job-dir <jobDir> --dest <dir> [--formats fcpxml,xmeml,csv] [--grades A,B]
import { mkdir, readFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { randomUUID } from 'node:crypto'
import { readJson, runJob, writeJsonAtomic } from './job.mjs'
import { exportJob } from './export-job.mjs'

function parseArgs(argv) {
  const args = { _: [] }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (!a.startsWith('--')) { args._.push(a); continue }
    const key = a.slice(2)
    const next = argv[i + 1]
    const value = next === undefined || next.startsWith('--') ? true : (i++, next)
    if (args[key] === undefined) args[key] = value
    else args[key] = [].concat(args[key], value)
  }
  return args
}

async function readStdin() {
  const chunks = []
  for await (const c of process.stdin) chunks.push(c)
  return Buffer.concat(chunks).toString('utf8')
}

const emit = (event) => process.stdout.write(JSON.stringify(event) + '\n')

async function scan(args) {
  let jobDir, request, secrets = {}
  if (args['job-dir']) {
    jobDir = resolve(args['job-dir'])
    request = JSON.parse(await readFile(join(jobDir, 'request.json'), 'utf8'))
    if (args['secrets-stdin']) secrets = JSON.parse((await readStdin()) || '{}')
  } else {
    const inputs = [].concat(args.input || []).map((p) => resolve(p))
    if (!inputs.length || !args.out) throw new Error('scan needs --input and --out (or --job-dir)')
    jobDir = resolve(args.out)
    await mkdir(jobDir, { recursive: true })
    request = {
      id: randomUUID(), createdAt: new Date().toISOString(), inputs, recursive: !args['no-recursive'],
      options: {
        strictness: args.strictness || 'standard', log: !!args.log, lutPath: args.lut ? resolve(args.lut) : undefined,
        minSegment: args['min-segment'] ? Number(args['min-segment']) : undefined, hwaccel: !!args.hwaccel,
      },
      vlm: args['vlm-base-url'] ? { enabled: true, baseUrl: args['vlm-base-url'], model: args['vlm-model'], concurrency: Number(args['vlm-concurrency'] || 2), maxSegments: Number(args['vlm-max'] || 0) } : { enabled: false },
      ffmpegDir: args['ffmpeg-dir'],
    }
    await writeJsonAtomic(join(jobDir, 'request.json'), request)
    secrets = { vlmApiKey: process.env.FOOTAGE_VLM_API_KEY }
  }
  const controller = new AbortController()
  for (const sig of ['SIGTERM', 'SIGINT']) process.on(sig, () => controller.abort())
  const result = await runJob({ request, secrets, jobDir, emit, signal: controller.signal })
  if (!args['job-dir']) {
    const s = result.summary
    process.stderr.write(`\n${result.status}: ${s.analyzed}/${s.files} clips, footage ${s.footageSeconds}s -> A ${s.A.count} (${s.A.seconds}s), B ${s.B.count} (${s.B.seconds}s), C ${s.C.count} (${s.C.seconds}s) in ${result.elapsedSeconds}s\n${result.error ? 'error: ' + result.error + '\n' : ''}results: ${join(jobDir, 'results.json')}\n`)
  }
  process.exitCode = result.status === 'done' ? 0 : 1
}

async function exportCmd(args) {
  const jobDir = resolve(args['job-dir'])
  const results = await readJson(join(jobDir, 'results.json'))
  if (!results) throw new Error('results.json not found')
  const overrides = (await readJson(join(jobDir, 'overrides.json'), {})) || {}
  const written = await exportJob(results, overrides, {
    dest: resolve(args.dest),
    formats: String(args.formats || 'fcpxml,xmeml,csv').split(','),
    grades: String(args.grades || 'A').split(','),
  })
  for (const w of written) process.stderr.write(`wrote ${w.path} (${w.count} clips)\n`)
}

const args = parseArgs(process.argv.slice(2))
const cmd = args._[0]
try {
  if (cmd === 'scan') await scan(args)
  else if (cmd === 'export') await exportCmd(args)
  else { process.stderr.write('usage: cli.mjs scan|export ... (see header of engine/cli.mjs)\n'); process.exitCode = 2 }
} catch (error) {
  emit({ type: 'fatal', error: String(error.message || error) })
  process.stderr.write(`${error.stack || error}\n`)
  process.exitCode = 1
}
