// Business service behind the HTTP routes and agent tools. Host-agnostic so it
// can be exercised outside DSH (see test/host-smoke.mjs).
import { spawn } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { appendFile, mkdir, readdir, readFile, realpath, rename, stat } from 'node:fs/promises'
import { dirname, join, relative, isAbsolute } from 'node:path'
import { fileURLToPath } from 'node:url'
import { readJson, writeJsonAtomic } from '../engine/job.mjs'
import { exportJob } from '../engine/export-job.mjs'
import { effectiveGrade, summarize } from '../engine/grade.mjs'
import { resolveTools, run } from '../engine/tools.mjs'
import { flagLabel } from '../engine/analyze.mjs'
import { chatUrl } from '../engine/vlm.mjs'

const ENGINE_CLI = fileURLToPath(new URL('../engine/cli.mjs', import.meta.url))

export class ServiceError extends Error {
  constructor(message, status = 400, code = 'BAD_REQUEST') { super(message); this.status = status; this.code = code }
}

export const DEFAULT_SETTINGS = {
  ffmpegDir: '',
  strictness: 'standard',
  minSegment: 2,
  log: false,
  lutPath: '',
  hwaccel: true,
  recursive: true,
  vlm: { enabled: false, baseUrl: '', model: '', rubric: '', concurrency: 2, maxSegments: 0, frames: 4 },
  grading: { techWeight: 0.4 },
}

const STRICTNESS = new Set(['loose', 'standard', 'strict'])
const GRADES = new Set(['A', 'B', 'C'])
const FORMATS = new Set(['fcpxml', 'xmeml', 'csv', 'json'])

function inside(child, parent) {
  const rel = relative(parent, child)
  return rel === '' || (!rel.startsWith('..') && !isAbsolute(rel))
}

function cleanSettings(input, previous) {
  const s = structuredClone(previous)
  if (!input || typeof input !== 'object') throw new ServiceError('设置格式不正确')
  if (typeof input.ffmpegDir === 'string') s.ffmpegDir = input.ffmpegDir.trim().slice(0, 500)
  if (STRICTNESS.has(input.strictness)) s.strictness = input.strictness
  if (Number.isFinite(Number(input.minSegment))) s.minSegment = Math.max(0.5, Math.min(30, Number(input.minSegment)))
  if (typeof input.log === 'boolean') s.log = input.log
  if (typeof input.lutPath === 'string') s.lutPath = input.lutPath.trim().slice(0, 1000)
  if (typeof input.hwaccel === 'boolean') s.hwaccel = input.hwaccel
  if (typeof input.recursive === 'boolean') s.recursive = input.recursive
  const v = input.vlm || {}
  if (typeof v.enabled === 'boolean') s.vlm.enabled = v.enabled
  if (typeof v.baseUrl === 'string') s.vlm.baseUrl = v.baseUrl.trim().slice(0, 500)
  if (typeof v.model === 'string') s.vlm.model = v.model.trim().slice(0, 200)
  if (typeof v.rubric === 'string') s.vlm.rubric = v.rubric.slice(0, 6000)
  if (Number.isFinite(Number(v.concurrency))) s.vlm.concurrency = Math.max(1, Math.min(8, Math.round(Number(v.concurrency))))
  if (Number.isFinite(Number(v.maxSegments))) s.vlm.maxSegments = Math.max(0, Math.round(Number(v.maxSegments)))
  if (Number.isFinite(Number(v.frames))) s.vlm.frames = Math.max(1, Math.min(8, Math.round(Number(v.frames))))
  if (input.grading && Number.isFinite(Number(input.grading.techWeight))) s.grading.techWeight = Math.max(0, Math.min(1, Number(input.grading.techWeight)))
  if (s.vlm.enabled) {
    if (!s.vlm.baseUrl || !s.vlm.model) throw new ServiceError('启用 AI 复审需要填写 API 地址和模型名')
    try { chatUrl(s.vlm.baseUrl) } catch (e) { throw new ServiceError(e.message) }
  }
  return s
}

/**
 * @param {object} deps
 * @param {string} deps.root  plugin data directory
 * @param {{read:()=>Promise<string|undefined>, write:(key:string|undefined)=>Promise<void>}} deps.secret  VLM API key storage
 * @param {object} [deps.logger]
 * @param {string} [deps.nodePath]  executable used to run the engine
 */
export function createService({ root, secret, logger = console, nodePath = process.execPath }) {
  const jobsDir = join(root, 'jobs')
  const foldersPath = join(root, 'folders.json')
  const settingsPath = join(root, 'settings.json')
  const running = new Map() // id -> { child, progress, startedAt }
  const previews = new Map() // one transcode per segment, generated only when opened
  const ready = (async () => {
    await mkdir(jobsDir, { recursive: true })
    // Jobs left "running" by a previous Harness process were interrupted.
    for (const id of await readdir(jobsDir).catch(() => [])) {
      const p = join(jobsDir, id, 'results.json')
      const r = await readJson(p, null)
      if (r && (r.status === 'running' || r.status === 'queued')) {
        r.status = 'interrupted'; r.error = '上次运行被中断（应用关闭或重启），可重新发起清洗'
        await writeJsonAtomic(p, r).catch(() => {})
      }
    }
  })()

  const readFolders = async () => (await readJson(foldersPath, { folders: [] })).folders || []
  const readSettings = async () => {
    const stored = await readJson(settingsPath, {})
    return { ...structuredClone(DEFAULT_SETTINGS), ...stored, vlm: { ...DEFAULT_SETTINGS.vlm, ...(stored.vlm || {}) }, grading: { ...DEFAULT_SETTINGS.grading, ...(stored.grading || {}) } }
  }

  async function authorizedFolder(path) {
    if (typeof path !== 'string' || !isAbsolute(path)) throw new ServiceError('请提供素材文件夹的完整路径')
    let real
    try { real = await realpath(path) } catch { throw new ServiceError('素材位置不存在或无法访问', 404, 'NOT_FOUND') }
    for (const f of await readFolders()) {
      const fr = await realpath(f.path).catch(() => null)
      if (fr && inside(real, fr)) return real
    }
    throw new ServiceError('该位置尚未在素材清洗台中添加。请先在工作台点击「添加素材文件夹」选择它。', 403, 'NOT_AUTHORIZED')
  }

  function jobDir(id) {
    if (typeof id !== 'string' || !/^[a-f0-9-]{36}$/.test(id)) throw new ServiceError('任务编号无效', 400, 'BAD_JOB')
    return join(jobsDir, id)
  }

  async function loadJob(id) {
    const dir = jobDir(id)
    const results = await readJson(join(dir, 'results.json'), null)
    if (!results) throw new ServiceError('找不到该清洗任务', 404, 'NOT_FOUND')
    const overrides = await readJson(join(dir, 'overrides.json'), {})
    return { dir, results, overrides }
  }

  function withOverrides(results, overrides) {
    const live = running.get(results.id)
    const progress = live?.progress ? { ...results.progress, ...live.progress } : results.progress
    return { ...results, progress, overrides, summary: results.files ? summarize(results.files, overrides) : results.summary }
  }

  return {
    ready: () => ready,

    async state() {
      await ready
      const settings = await readSettings()
      const tools = await resolveTools(settings.ffmpegDir)
      return { folders: await readFolders(), jobs: await this.listJobs(), ffmpeg: { found: !!(tools.ffmpeg && tools.ffprobe), ffmpeg: tools.ffmpeg, ffprobe: tools.ffprobe } }
    },

    async addFolder(path) {
      await ready
      if (typeof path !== 'string' || !isAbsolute(path)) throw new ServiceError('请选择一个文件夹')
      const s = await stat(path).catch(() => null)
      if (!s?.isDirectory()) throw new ServiceError('所选位置不是可访问的文件夹', 404, 'NOT_FOUND')
      const folders = await readFolders()
      if (!folders.some((f) => f.path === path)) folders.push({ path, addedAt: new Date().toISOString() })
      await writeJsonAtomic(foldersPath, { folders })
      return folders
    },

    async removeFolder(path) {
      await ready
      const folders = (await readFolders()).filter((f) => f.path !== path)
      await writeJsonAtomic(foldersPath, { folders })
      return folders
    },

    async getSettings() {
      const s = await readSettings()
      return { ...s, vlm: { ...s.vlm, apiKeyConfigured: !!(await secret.read().catch(() => undefined)) } }
    },

    async saveSettings(input) {
      await ready
      const next = cleanSettings(input, await readSettings())
      if (input?.vlm && typeof input.vlm.apiKey === 'string') {
        const key = input.vlm.apiKey.trim()
        if (key && (key.length > 4096 || /[\s\x00-\x1f]/.test(key))) throw new ServiceError('API Key 格式不正确')
        if (key) await secret.write(key)
        else if (input.vlm.clearApiKey) await secret.write(undefined)
      }
      await writeJsonAtomic(settingsPath, next)
      return this.getSettings()
    },

    async testVlm() {
      const s = await readSettings()
      if (!s.vlm.baseUrl || !s.vlm.model) throw new ServiceError('请先填写 API 地址和模型名并保存')
      const { ffmpeg } = await resolveTools(s.ffmpegDir)
      if (!ffmpeg) throw new ServiceError('未找到 ffmpeg')
      const { run } = await import('../engine/tools.mjs')
      const jpg = await run(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-f', 'lavfi', '-i', 'testsrc2=size=256x144', '-frames:v', '1', '-f', 'image2pipe', '-vcodec', 'mjpeg', 'pipe:1'])
      const { reviewSegment } = await import('../engine/vlm.mjs')
      const started = Date.now()
      const review = await reviewSegment({ ...s.vlm, apiKey: await secret.read() }, { start: 0, end: 1, duration: 1, tech: { shake: 0, mean: 120 }, flags: [] }, { name: '连接测试' }, [jpg], {})
      return { ok: true, model: review.model, ms: Date.now() - started, sample: review }
    },

    async startScan({ folder, recursive } = {}) {
      await ready
      const input = await authorizedFolder(folder)
      if ([...running.values()].length) throw new ServiceError('已有清洗任务在进行，请等待完成或取消后再开始', 409, 'BUSY')
      const settings = await readSettings()
      const tools = await resolveTools(settings.ffmpegDir)
      if (!tools.ffmpeg || !tools.ffprobe) throw new ServiceError('未找到 ffmpeg/ffprobe。请安装 ffmpeg（macOS：brew install ffmpeg），或在设置中填写所在目录。', 424, 'NO_FFMPEG')
      const id = randomUUID()
      const dir = jobDir(id)
      await mkdir(dir, { recursive: true })
      const request = {
        id, createdAt: new Date().toISOString(), inputs: [input], recursive: typeof recursive === 'boolean' ? recursive : settings.recursive,
        options: { strictness: settings.strictness, minSegment: settings.minSegment, log: settings.log, lutPath: settings.lutPath || undefined, hwaccel: settings.hwaccel },
        vlm: { enabled: settings.vlm.enabled, baseUrl: settings.vlm.baseUrl, model: settings.vlm.model, rubric: settings.vlm.rubric, concurrency: settings.vlm.concurrency, maxSegments: settings.vlm.maxSegments, frames: settings.vlm.frames },
        grading: settings.grading,
        ffmpegDir: dirname(tools.ffmpeg),
      }
      await writeJsonAtomic(join(dir, 'request.json'), request)
      await writeJsonAtomic(join(dir, 'results.json'), { version: 1, id, status: 'queued', phase: 'queued', createdAt: request.createdAt, request, progress: { done: 0, total: 0, current: '' }, files: [] })
      const apiKey = settings.vlm.enabled ? await secret.read().catch(() => undefined) : undefined
      const env = { ELECTRON_RUN_AS_NODE: '1', PATH: process.env.PATH || '', HOME: process.env.HOME || '', LANG: process.env.LANG || 'en_US.UTF-8' }
      if (process.platform === 'win32') { env.SystemRoot = process.env.SystemRoot; env.TEMP = process.env.TEMP }
      if (process.env.FOOTAGE_CULLER_DIRECT_WRITE) env.FOOTAGE_CULLER_DIRECT_WRITE = process.env.FOOTAGE_CULLER_DIRECT_WRITE
      const child = spawn(nodePath, [ENGINE_CLI, 'scan', '--job-dir', dir, '--secrets-stdin'], { stdio: ['pipe', 'pipe', 'pipe'], env, windowsHide: true })
      const entry = { child, progress: null, startedAt: Date.now(), stderr: '' }
      running.set(id, entry)
      child.stdin.end(JSON.stringify({ vlmApiKey: apiKey }))
      let buf = ''
      child.stdout.on('data', (c) => {
        buf += c
        let nl
        while ((nl = buf.indexOf('\n')) >= 0) {
          const line = buf.slice(0, nl); buf = buf.slice(nl + 1)
          try {
            const ev = JSON.parse(line)
            if (ev.type === 'progress') entry.progress = { phase: ev.phase, done: ev.done, total: ev.total, current: ev.current }
            if (ev.type === 'clip-progress') entry.progress = { ...(entry.progress || {}), clip: ev.file, clipFraction: ev.fraction }
          } catch { /* ignore partial lines */ }
        }
      })
      child.stderr.on('data', (c) => { if (entry.stderr.length < 8000) entry.stderr += c })
      child.on('error', (e) => logger.warn?.('footage-culler: engine spawn failed: %s', e.message))
      child.on('close', async (code) => {
        running.delete(id)
        logger.info?.('footage-culler: job %s finished code=%s', id, code)
        if (code !== 0) {
          const p = join(dir, 'results.json')
          const r = await readJson(p, null)
          if (r && r.status !== 'done' && r.status !== 'failed' && r.status !== 'cancelled') {
            r.status = entry.cancelled ? 'cancelled' : 'failed'
            r.error = entry.cancelled ? '已取消' : (entry.stderr.trim().split('\n').slice(-2).join(' ').slice(0, 400) || `engine exited ${code}`)
            await writeJsonAtomic(p, r).catch(() => {})
          }
        }
      })
      return { id, folder: input }
    },

    async cancel(id) {
      const entry = running.get(id)
      if (!entry) throw new ServiceError('该任务未在运行', 409, 'NOT_RUNNING')
      entry.cancelled = true
      entry.child.kill('SIGTERM')
      setTimeout(() => { if (running.has(id)) entry.child.kill('SIGKILL') }, 5000).unref?.()
      return { id, cancelled: true }
    },

    async listJobs() {
      await ready
      const ids = await readdir(jobsDir).catch(() => [])
      const jobs = []
      for (const id of ids) {
        if (!/^[a-f0-9-]{36}$/.test(id)) continue
        const r = await readJson(join(jobsDir, id, 'results.json'), null)
        if (!r) continue
        const overrides = await readJson(join(jobsDir, id, 'overrides.json'), {})
        const live = running.get(id)
        jobs.push({
          id, status: r.status, phase: r.phase, createdAt: r.createdAt, finishedAt: r.finishedAt, error: r.error,
          folder: r.request?.inputs?.[0], progress: live?.progress ? { ...r.progress, ...live.progress } : r.progress,
          summary: r.files?.length ? summarize(r.files, overrides) : null, vlm: !!r.request?.vlm?.enabled,
        })
      }
      jobs.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
      return jobs.slice(0, 50)
    },

    async job(id) {
      const { results, overrides } = await loadJob(id)
      return withOverrides(results, overrides)
    },

    async setOverride(id, segmentId, grade) {
      const { dir, results, overrides } = await loadJob(id)
      if (results.status === 'running') throw new ServiceError('任务运行中，完成后再改判', 409, 'BUSY')
      const seg = results.files?.flatMap((f) => [...(f.segments || []), ...(f.rejected || [])]).find((s) => s.id === segmentId)
      if (!seg) throw new ServiceError('找不到该片段', 404, 'NOT_FOUND')
      if (grade === null || grade === 'reset' || grade === seg.grade) delete overrides[segmentId]
      else if (GRADES.has(grade)) overrides[segmentId] = grade
      else throw new ServiceError('等级只能是 A、B、C')
      await writeJsonAtomic(join(dir, 'overrides.json'), overrides)
      // Human corrections are the training signal for the team's own taste model.
      const file = results.files[seg.fileIndex]
      const line = JSON.stringify({ at: new Date().toISOString(), job: id, segment: segmentId, file: file?.path, start: seg.start, end: seg.end, machine: seg.grade, human: overrides[segmentId] || seg.grade, tech: seg.tech, review: seg.review && !seg.review.error ? { aesthetic: seg.review.aesthetic, composition: seg.review.composition, shotType: seg.review.shotType, tags: seg.review.tags } : null })
      await appendFile(join(root, 'feedback.ndjson'), line + '\n').catch(() => {})
      return { id, segment: segmentId, grade: effectiveGrade(seg, overrides), summary: summarize(results.files, overrides) }
    },

    async export(id, { dest, formats = ['fcpxml', 'xmeml', 'csv'], grades = ['A'] } = {}) {
      const { dir, results, overrides } = await loadJob(id)
      if (results.status !== 'done') throw new ServiceError('任务完成后才能导出', 409, 'NOT_DONE')
      const fs = [].concat(formats).filter((f) => FORMATS.has(f))
      const gs = [].concat(grades).filter((g) => GRADES.has(g))
      if (!fs.length || !gs.length) throw new ServiceError('请选择导出格式和等级')
      let target, createDest = false
      if (dest) {
        if (typeof dest !== 'string' || !isAbsolute(dest)) throw new ServiceError('导出位置无效')
        const s = await stat(dest).catch(() => null)
        if (!s?.isDirectory()) throw new ServiceError('导出位置不存在或不是文件夹，请重新选择', 400, 'BAD_DEST')
        target = dest
      } else {
        target = join(dir, 'exports') // plugin-owned location, used by agent tools
        createDest = true
      }
      return exportJob(results, overrides, { dest: target, formats: fs, grades: gs, createDest })
    },

    async thumb(id, name) {
      const dir = jobDir(id)
      if (typeof name !== 'string' || !/^[0-9]+-[sr][0-9]+\.jpg$/.test(name)) throw new ServiceError('无效的缩略图', 400)
      try { return await readFile(join(dir, 'thumbs', name)) } catch { throw new ServiceError('缩略图不存在', 404, 'NOT_FOUND') }
    },

    async preview(id, segmentId) {
      const { dir, results } = await loadJob(id)
      if (typeof segmentId !== 'string' || !/^[0-9]+-[sr][0-9]+$/.test(segmentId)) throw new ServiceError('无效的片段编号')
      const file = results.files?.find((f) => [...(f.segments || []), ...(f.rejected || [])].some((s) => s.id === segmentId))
      const seg = file && [...(file.segments || []), ...(file.rejected || [])].find((s) => s.id === segmentId)
      if (!seg || file.status !== 'judged') throw new ServiceError('片段尚不可预览', 404, 'NOT_FOUND')
      const targetDir = join(dir, 'previews')
      const target = join(targetDir, `${segmentId}.mp4`)
      const existing = await stat(target).catch(() => null)
      if (existing?.size) return { path: target, size: existing.size }
      const key = `${id}:${segmentId}`
      if (!previews.has(key)) {
        const task = (async () => {
          const { ffmpeg } = await resolveTools(results.request?.ffmpegDir)
          if (!ffmpeg) throw new ServiceError('未找到 ffmpeg，无法生成预览', 424, 'NO_FFMPEG')
          await mkdir(targetDir, { recursive: true })
          const temporary = join(targetDir, `${segmentId}.${randomUUID()}.mp4`)
          try {
            await run(ffmpeg, ['-hide_banner', '-nostdin', '-loglevel', 'error',
              '-ss', String(seg.start), '-i', file.path, '-t', String(seg.duration),
              '-map', '0:v:0', '-map', '0:a:0?', '-vf', 'scale=960:-2:flags=fast_bilinear',
              '-c:v', 'libx264', '-preset', 'ultrafast', '-crf', '28', '-pix_fmt', 'yuv420p',
              '-c:a', 'aac', '-b:a', '96k', '-movflags', '+faststart', temporary], { maxBytes: 1024 })
            await rename(temporary, target)
          } finally {
            const { rm } = await import('node:fs/promises')
            await rm(temporary, { force: true }).catch(() => {})
          }
        })()
        previews.set(key, task)
        task.finally(() => previews.delete(key)).catch(() => {})
      }
      await previews.get(key)
      return { path: target, size: (await stat(target)).size }
    },

    /** Compact view for the agent: what matters for a director, not raw metrics. */
    async agentView(id, { limit = 30 } = {}) {
      const job = await this.job(id)
      const segs = []
      for (const f of job.files || []) {
        for (const s of [...(f.segments || []), ...(f.rejected || [])]) {
          segs.push({
            segment_id: s.id, file: f.name, in: s.start, out: s.end, seconds: s.duration,
            grade: effectiveGrade(s, job.overrides), machine_grade: s.grade, reason: s.gradeReason,
            tech_score: s.tech.score, warnings: s.flags.map(flagLabel),
            shot_type: s.review?.shotType, subject: s.review?.subject, aesthetic: s.review?.aesthetic, tags: s.review?.tags,
          })
        }
      }
      const order = { A: 0, B: 1, C: 2 }
      segs.sort((a, b) => order[a.grade] - order[b.grade] || (b.aesthetic ?? 0) - (a.aesthetic ?? 0) || b.tech_score - a.tech_score)
      return {
        job_id: job.id, status: job.status, phase: job.phase, progress: job.progress, error: job.error,
        folder: job.request?.inputs?.[0], ai_review: !!job.request?.vlm?.enabled, summary: job.summary,
        failed_files: (job.files || []).filter((f) => f.status === 'failed').map((f) => ({ file: f.name, error: f.error })),
        segments: segs.slice(0, Math.max(1, Math.min(200, limit))), total_segments: segs.length,
      }
    },

    authorizedFolder,
    isRunning: () => running.size > 0,
    dispose() { for (const e of running.values()) { e.cancelled = true; e.child.kill('SIGTERM') } },
  }
}
