import { WorkbenchError } from './util.js'

/**
 * Eagle local API client (http://localhost:41595). Uses the documented v1
 * endpoints: application/info, folder/create, folder/list, item/addFromPaths,
 * item/list and item/update. Eagle must be running on this computer.
 */
export function createEagle(getBase) {
  async function call(pathname, { method = 'GET', body, timeoutMs = 6000, query } = {}) {
    const base = await getBase()
    const url = new URL(pathname, base)
    for (const [key, value] of Object.entries(query || {})) if (value !== undefined && value !== null) url.searchParams.set(key, String(value))
    let response
    try {
      response = await fetch(url, {
        method,
        headers: body ? { 'content-type': 'application/json' } : undefined,
        body: body ? JSON.stringify(body) : undefined,
        signal: AbortSignal.timeout(timeoutMs)
      })
    } catch {
      throw new WorkbenchError('Eagle 未连接：请先打开 Eagle（本地接口端口 41595）。', 503, 'EAGLE_OFFLINE')
    }
    let data = null
    try { data = await response.json() } catch { /* handled below */ }
    if (!response.ok || !data || data.status !== 'success') {
      throw new WorkbenchError(`Eagle 接口返回错误：${data?.message || data?.data || response.status}`, 502, 'EAGLE_ERROR')
    }
    return data.data
  }

  return {
    async info() {
      try {
        const data = await call('/api/application/info', { timeoutMs: 1500 })
        return { connected: true, version: data?.version || null, platform: data?.platform || null }
      } catch (error) {
        return { connected: false, error: error.message }
      }
    },
    async ensureFolder(name, knownId) {
      const folders = await call('/api/folder/list')
      const flat = []
      const walk = (list) => { for (const f of list || []) { flat.push(f); walk(f.children) } }
      walk(folders)
      if (knownId && flat.some((f) => f.id === knownId)) return knownId
      const found = flat.find((f) => f.name === name)
      if (found) return found.id
      const created = await call('/api/folder/create', { method: 'POST', body: { folderName: name } })
      return created.id
    },
    addFromPaths(items, folderId) {
      return call('/api/item/addFromPaths', { method: 'POST', body: { items, folderId }, timeoutMs: 60_000 })
    },
    async listFolder(folderId) {
      const out = []
      for (let offset = 0; offset < 100_000; offset += 1) {
        const page = await call('/api/item/list', { query: { folders: folderId, limit: 1000, offset }, timeoutMs: 20_000 })
        if (!Array.isArray(page) || !page.length) break
        out.push(...page)
        if (page.length < 1000) break
      }
      return out
    },
    update(id, values) {
      return call('/api/item/update', { method: 'POST', body: { id, ...values } })
    }
  }
}
