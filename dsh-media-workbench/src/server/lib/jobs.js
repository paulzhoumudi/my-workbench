import path from 'node:path'
import { readJson, writeJson, now, shortId, appendLog } from './util.js'

export const JOB_LABELS = {
  import: '导入素材',
  clean: '清洗素材',
  split: '镜头切片',
  keyframes: '抽取关键帧',
  transcribe: '语音转写',
  'eagle-push': '同步到 Eagle',
  'eagle-pull': '从 Eagle 拉取',
  'render-preview': 'FFmpeg 粗剪预览',
  'render-final': 'FFmpeg 直出成片'
}

/**
 * Background jobs (FR-44). One job runs per project at a time; others queue.
 * Each pipeline step persists per item, so re-running an interrupted job skips
 * finished items (断点续跑). Progress is mirrored to `.dsh/jobs.json`.
 */
export function createJobs({ onChange }) {
  const projects = new Map()
  const state = (root) => {
    if (!projects.has(root)) projects.set(root, { running: null, queue: [], recent: [], loaded: false })
    return projects.get(root)
  }
  const file = (root) => path.join(root, '.dsh', 'jobs.json')

  async function load(root) {
    const s = state(root)
    if (s.loaded) return s
    s.loaded = true
    const saved = await readJson(file(root), { recent: [] }).catch(() => ({ recent: [] }))
    s.recent = (saved.recent || []).map((job) => (['running', 'queued'].includes(job.status) ? { ...job, status: 'interrupted', error: '应用关闭或重启时中断，可重新运行以续跑（已完成的条目会跳过）。' } : job)).slice(0, 12)
    return s
  }

  let persistTimer = null
  const dirty = new Set()
  function persist(root, immediate = false) {
    dirty.add(root)
    const flush = async () => {
      persistTimer = null
      const roots = [...dirty]
      dirty.clear()
      for (const r of roots) {
        const s = state(r)
        const recent = [...(s.running ? [view(s.running)] : []), ...s.queue.map(view), ...s.recent].slice(0, 12)
        await writeJson(file(r), { recent }).catch(() => {})
      }
    }
    if (immediate) { clearTimeout(persistTimer); return flush() }
    if (!persistTimer) persistTimer = setTimeout(flush, 500)
  }

  const view = (job) => {
    const { controller, run, resolve, reject, ...rest } = job
    return rest
  }

  async function pump(root) {
    const s = state(root)
    if (s.running || !s.queue.length) return
    const job = s.queue.shift()
    s.running = job
    job.status = 'running'
    job.startedAt = now()
    onChange(root)
    persist(root)
    const progress = (done, total, current) => {
      if (typeof total === 'number') job.total = total
      if (typeof done === 'number') job.done = done
      if (current !== undefined) job.current = current
      const elapsed = (Date.now() - Date.parse(job.startedAt)) / 1000
      job.etaSeconds = job.total && job.done ? Math.round((elapsed / job.done) * (job.total - job.done)) : null
      onChange(root)
      persist(root)
    }
    try {
      job.result = await job.run({ signal: job.controller.signal, progress })
      job.status = 'done'
      job.resolve(view(job))
    } catch (error) {
      job.status = job.controller.signal.aborted ? 'cancelled' : 'failed'
      job.error = error?.message || String(error)
      job.reject(error)
    } finally {
      job.finishedAt = now()
      job.current = null
      job.etaSeconds = null
      s.running = null
      s.recent = [view(job), ...s.recent].slice(0, 12)
      await appendLog(root, { action: `job.${job.kind}`, status: job.status, error: job.error || null, result: summarize(job.result) })
      onChange(root)
      await persist(root, true)
      pump(root)
    }
  }

  return {
    /**
     * Queue a job. Returns `{ job, done }` where `done` settles when it ends.
     * A second request of the same kind while one is queued/running joins it.
     */
    async start(root, kind, run, { params } = {}) {
      const s = await load(root)
      const same = [s.running, ...s.queue].find((job) => job && job.kind === kind && JSON.stringify(job.params || null) === JSON.stringify(params || null))
      if (same) return { job: view(same), done: same.promise, joined: true }
      const job = { id: shortId('job_'), kind, label: JOB_LABELS[kind] || kind, status: 'queued', total: 0, done: 0, current: null, createdAt: now(), params: params || null, controller: new AbortController(), run }
      job.promise = new Promise((resolve, reject) => { job.resolve = resolve; job.reject = reject })
      job.promise.catch(() => {})
      s.queue.push(job)
      onChange(root)
      persist(root)
      queueMicrotask(() => pump(root))
      return { job: view(job), done: job.promise, joined: false }
    },
    cancel(root, id) {
      const s = state(root)
      if (s.running && (!id || s.running.id === id)) { s.running.controller.abort(); return true }
      const index = s.queue.findIndex((job) => job.id === id)
      if (index >= 0) {
        const [job] = s.queue.splice(index, 1)
        job.status = 'cancelled'
        job.reject(new Error('任务已取消。'))
        s.recent = [view(job), ...s.recent].slice(0, 12)
        onChange(root)
        persist(root)
        return true
      }
      return false
    },
    async list(root) {
      const s = await load(root)
      return { running: s.running ? view(s.running) : null, queue: s.queue.map(view), recent: s.recent }
    },
    async get(root, id) {
      const { running, queue, recent } = await this.list(root)
      return [running, ...queue, ...recent].find((job) => job && job.id === id) || null
    },
    cancelAll() {
      for (const s of projects.values()) {
        s.running?.controller.abort()
        for (const job of s.queue) job.controller.abort()
      }
    }
  }
}

function summarize(result) {
  if (!result || typeof result !== 'object') return result ?? null
  const out = {}
  for (const [key, value] of Object.entries(result)) if (typeof value !== 'object' || value === null) out[key] = value
  return out
}
