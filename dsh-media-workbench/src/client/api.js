export const API = '/api/dsh-media-workbench'

export class ApiError extends Error {
  constructor(message, status, code) {
    super(message)
    this.status = status
    this.code = code
  }
}

async function handle(response) {
  let data = null
  try { data = await response.json() } catch { /* non-JSON */ }
  if (!response.ok) throw new ApiError(data?.error || `请求失败（HTTP ${response.status}）`, response.status, data?.code)
  return data
}

export function get(path, params = {}, signal) {
  const query = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')).toString()
  return fetch(`${API}${path}${query ? `?${query}` : ''}`, { signal, credentials: 'same-origin', headers: { accept: 'application/json' } }).then(handle)
}

export function post(path, body = {}, signal) {
  return fetch(`${API}${path}`, { method: 'POST', signal, credentials: 'same-origin', headers: { 'content-type': 'application/json', accept: 'application/json' }, body: JSON.stringify(body) }).then(handle)
}

export const fileUrl = (project, path) => `${API}/file?${new URLSearchParams({ project, path })}`

export const storage = {
  get(key, fallback) {
    try { const v = window.localStorage.getItem(`dmw:${key}`); return v === null ? fallback : JSON.parse(v) } catch { return fallback }
  },
  set(key, value) {
    try { window.localStorage.setItem(`dmw:${key}`, JSON.stringify(value)) } catch { /* storage unavailable */ }
  }
}

export function normPath(p) {
  return String(p || '').replace(/\\/g, '/').replace(/\/+$/, '').toLowerCase()
}

export function timeAgo(iso) {
  if (!iso) return ''
  const t = Date.parse(iso)
  if (!Number.isFinite(t)) return ''
  const diff = (Date.now() - t) / 1000
  if (diff < 60) return '刚刚'
  if (diff < 3600) return `${Math.floor(diff / 60)} 分钟前`
  const d = new Date(t)
  const today = new Date()
  if (d.toDateString() === today.toDateString()) return `今天 ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  if (diff < 86400 * 7) return `${Math.max(1, Math.round(diff / 86400))} 天前`
  return `${d.getMonth() + 1}月${d.getDate()}日`
}

export function clock(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const today = new Date()
  const hm = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  return d.toDateString() === today.toDateString() ? hm : `${d.getMonth() + 1}/${d.getDate()} ${hm}`
}

export const pct = (n, total) => (total ? `${(Math.round((n / total) * 1000) / 10).toFixed(1)}%` : '0%')

export function fmtDuration(seconds) {
  if (!Number.isFinite(seconds)) return '—'
  if (seconds < 60) return `${Math.round(seconds * 10) / 10}s`
  const m = Math.floor(seconds / 60)
  const s = Math.round(seconds % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

export function fmtSize(bytes) {
  if (!bytes) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  let i = 0
  let n = bytes
  while (n >= 1024 && i < units.length - 1) { n /= 1024; i++ }
  return `${n.toFixed(n >= 10 || i === 0 ? 0 : 1)} ${units[i]}`
}
