// Agent tools: let the DSH conversation drive culling in business language.
// Scope boundary: tools only touch folders the director added in the
// workbench; they cannot add new locations or write outside the plugin's
// data directory.

const out = { schema: { type: 'json' }, render: (_args, value) => [{ type: 'text', text: JSON.stringify(value) }] }
const card = (title) => (args) => ({ card: 'generic', kind: 'execute', title, rawInput: args })

const sleep = (ms, signal) => new Promise((resolve) => {
  const t = setTimeout(resolve, ms)
  signal?.addEventListener('abort', () => { clearTimeout(t); resolve() }, { once: true })
})

export function footageTools(defineTool, service) {
  return [
    defineTool({
      name: 'footage_folders',
      description: 'List the footage folders the director added in the Footage Culler workbench, recent culling jobs and whether ffmpeg is available. Call this first to find which folder to scan.',
      parameters: {},
      output: out,
      timeoutMs: 20_000,
      isConcurrencySafe: () => true,
      presentCall: card('查看素材文件夹'),
      async execute() {
        const s = await service.state()
        return { folders: s.folders.map((f) => f.path), ffmpeg_found: s.ffmpeg.found, recent_jobs: s.jobs.slice(0, 8).map((j) => ({ job_id: j.id, folder: j.folder, status: j.status, created_at: j.createdAt, summary: j.summary })) }
      },
    }),
    defineTool({
      name: 'footage_scan',
      description: 'Start an AI culling job on an added footage folder (or a sub-folder of it). Runs technical checks (focus, shake, exposure, black frames), optional multimodal review, and grades every usable range A/B/C. Returns a job_id immediately; poll with footage_job. Source files are never modified.',
      parameters: {
        folder: { type: 'string', required: true, description: 'Absolute path of an added folder or a sub-folder inside it.' },
        recursive: { type: 'boolean', description: 'Include sub-folders (default: workbench setting).' },
      },
      output: out,
      timeoutMs: 30_000,
      presentCall: card('开始素材清洗'),
      async execute(args) {
        const r = await service.startScan({ folder: args.folder, recursive: args.recursive })
        return { job_id: r.id, folder: r.folder, status: 'started', next: 'Call footage_job with this job_id (wait_seconds up to 120) until status is done.' }
      },
    }),
    defineTool({
      name: 'footage_job',
      description: 'Get progress and results of a culling job: summary (A/B/C counts and seconds) and the ranked segments with in/out points, grade, reason, shot type and tags. Optionally waits up to wait_seconds for the job to finish.',
      parameters: {
        job_id: { type: 'string', required: true },
        wait_seconds: { type: 'integer', description: 'Wait for completion up to this many seconds (0-120).' },
        limit: { type: 'integer', description: 'Maximum segments to return (default 30, max 200).' },
      },
      output: out,
      timeoutMs: 150_000,
      isConcurrencySafe: () => true,
      presentCall: card('查看清洗结果'),
      async execute(args, exec) {
        const deadline = Date.now() + Math.max(0, Math.min(120, Number(args.wait_seconds) || 0)) * 1000
        let view = await service.agentView(args.job_id, { limit: args.limit || 30 })
        while (['running', 'queued'].includes(view.status) && Date.now() < deadline && !exec?.signal?.aborted) {
          await sleep(3000, exec?.signal)
          view = await service.agentView(args.job_id, { limit: args.limit || 30 })
        }
        return view
      },
    }),
    defineTool({
      name: 'footage_set_grade',
      description: 'Record the director\'s decision for one segment (A priority candidate, B review, C problem segment) or reset it to the machine grade. Corrections are kept as feedback for calibrating the team\'s taste.',
      parameters: {
        job_id: { type: 'string', required: true },
        segment_id: { type: 'string', required: true },
        grade: { type: 'string', required: true, enum: ['A', 'B', 'C', 'reset'] },
      },
      output: out,
      timeoutMs: 20_000,
      presentCall: card('改判片段等级'),
      async execute(args) {
        return service.setOverride(args.job_id, args.segment_id, args.grade === 'reset' ? null : args.grade)
      },
    }),
    defineTool({
      name: 'footage_export',
      description: 'Export selected grades as editing timelines (FCPXML for Final Cut/Resolve, FCP7 XML for Premiere/Resolve) and a CSV shot log into the job\'s export folder inside the plugin data directory. Tell the user the returned paths; for a custom destination they use Export in the workbench.',
      parameters: {
        job_id: { type: 'string', required: true },
        grades: { type: 'string', description: 'Comma-separated grades to include, e.g. "A" or "A,B". Default "A".' },
        formats: { type: 'string', description: 'Comma-separated: fcpxml, xmeml, csv, json. Default "fcpxml,xmeml,csv".' },
      },
      output: out,
      timeoutMs: 60_000,
      presentCall: card('导出选片时间线'),
      async execute(args) {
        const list = (v, d) => (typeof v === 'string' && v.trim() ? v.split(/[,\s，]+/).map((x) => x.trim()).filter(Boolean) : d)
        const written = await service.export(args.job_id, { grades: list(args.grades, ['A']).map((g) => g.toUpperCase()), formats: list(args.formats, ['fcpxml', 'xmeml', 'csv']).map((f) => f.toLowerCase()) })
        return { written }
      },
    }),
  ]
}
