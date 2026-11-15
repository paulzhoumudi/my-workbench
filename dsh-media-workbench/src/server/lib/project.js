import { mkdir, readdir } from 'node:fs/promises'
import path from 'node:path'
import { WorkbenchError, exists, now, readJson, realDirectory, shortId, writeJson, createLocks, MEDIA_EXTENSIONS, toPosix } from './util.js'
import { PROJECT_DIRS, RESERVED_DIRS, LAYOUT_VERSION, P } from './layout.js'
import { migrateLayout } from './migrate.js'

export { RESERVED_DIRS }

export const DEFAULT_CLEAN_RULES = {
  version: 'clean-rules v1',
  sharpnessMin: 60,
  shakeVarianceMax: 3.0,
  minDuration: 1.5,
  blackLuma: 16,
  blackRatioMax: 0.9,
  duplicateSimilarity: 0.95
}

/** Output defaults until the user sets the output spec in the 剪辑 tab (target duration starts unset). */
export const DEFAULT_SPEC = { aspect: '16:9', width: 3840, height: 2160, fps: 25, targetDuration: null }

const projectFile = (root) => path.join(root, '.dsh', 'project.json')

/** Registry of projects known to this DSH home (FR-01 / FR-05). Disk files stay authoritative. */
export function createRegistry(home) {
  const file = path.join(home, 'projects.json')
  const lock = createLocks()
  const read = async () => {
    const data = await readJson(file, { schema: 1, projects: [] })
    if (!Array.isArray(data.projects)) data.projects = []
    return data
  }
  const mutate = (fn) => lock('registry', async () => {
    const data = await read()
    const result = await fn(data)
    await writeJson(file, data)
    return result
  })
  return {
    read,
    async list() {
      const data = await read()
      const items = []
      for (const entry of data.projects) {
        const ok = await exists(projectFile(entry.path))
        items.push({ ...entry, missing: !ok })
      }
      return items.sort((a, b) => Number(Boolean(a.archived)) - Number(Boolean(b.archived)) || String(b.openedAt || '').localeCompare(String(a.openedAt || '')))
    },
    async get(id) {
      const data = await read()
      const entry = data.projects.find((item) => item.id === id)
      if (!entry) throw new WorkbenchError('项目不存在或已从列表移除。', 404, 'NO_PROJECT')
      return entry
    },
    async findByPath(dir) {
      const data = await read()
      const key = path.resolve(dir).toLowerCase()
      return data.projects.find((item) => path.resolve(item.path).toLowerCase() === key) || null
    },
    upsert(entry) {
      return mutate((data) => {
        const index = data.projects.findIndex((item) => item.id === entry.id)
        if (index >= 0) data.projects[index] = { ...data.projects[index], ...entry }
        else data.projects.push(entry)
        return data.projects.find((item) => item.id === entry.id)
      })
    },
    patch(id, values) {
      return mutate((data) => {
        const entry = data.projects.find((item) => item.id === id)
        if (!entry) throw new WorkbenchError('项目不存在。', 404, 'NO_PROJECT')
        Object.assign(entry, values)
        return entry
      })
    },
    remove(id) {
      return mutate((data) => { data.projects = data.projects.filter((item) => item.id !== id) })
    }
  }
}

export async function readProject(root) {
  const data = await readJson(projectFile(root), null)
  if (!data) throw new WorkbenchError('这个文件夹还不是媒体项目（缺少 .dsh/project.json）。', 404, 'NOT_PROJECT')
  data.spec = { ...DEFAULT_SPEC, ...(data.spec || {}) }
  data.cleanRules = { ...DEFAULT_CLEAN_RULES, ...(data.cleanRules || {}) }
  data.rawSources = Array.isArray(data.rawSources) ? data.rawSources : []
  data.eagle = { folderId: null, folderName: data.name, ...(data.eagle || {}) }
  return data
}

export const writeProject = (root, data) => writeJson(projectFile(root), { ...data, updatedAt: now() })

/** Find top-level folders (or the root itself) holding media that are not standard dirs (FR-03). */
async function discoverRawSources(root) {
  const sources = []
  const entries = await readdir(root, { withFileTypes: true })
  if (entries.some((entry) => entry.isFile() && MEDIA_EXTENSIONS.has(path.extname(entry.name).toLowerCase()))) sources.push('.')
  for (const entry of entries) {
    if (!entry.isDirectory() || RESERVED_DIRS.has(entry.name) || entry.name === P.raw || entry.name.startsWith('.')) continue
    if (await containsMedia(path.join(root, entry.name), 3)) sources.push(toPosix(entry.name))
  }
  return sources
}

async function containsMedia(dir, depth) {
  if (depth < 0) return false
  let entries
  try { entries = await readdir(dir, { withFileTypes: true }) } catch { return false }
  for (const entry of entries) {
    if (entry.isFile() && MEDIA_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) return true
  }
  for (const entry of entries) {
    if (entry.isDirectory() && !entry.name.startsWith('.') && await containsMedia(path.join(dir, entry.name), depth - 1)) return true
  }
  return false
}

/**
 * Create or adopt a project folder. Never moves or renames user files; only
 * adds the four libraries and `.dsh` (FR-02 / FR-03). An existing v1 project
 * is migrated to the library layout first.
 */
export async function initProject(dir, { name, spec, template } = {}) {
  const root = await realDirectory(dir)
  const existing = await readJson(projectFile(root), null)
  if (existing) {
    await ensureLayout(root)
    return { root, project: await readProject(root), created: false }
  }
  const rawSources = await discoverRawSources(root)
  for (const sub of PROJECT_DIRS) await mkdir(path.join(root, sub), { recursive: true })
  const project = {
    schema: 1,
    layout: LAYOUT_VERSION,
    id: shortId('p_'),
    name: (typeof name === 'string' && name.trim()) || path.basename(root),
    createdAt: now(),
    spec: { ...DEFAULT_SPEC, ...sanitizeSpec(spec) },
    template: typeof template === 'string' && template ? template : 'vlog-base',
    cleanRules: { ...DEFAULT_CLEAN_RULES },
    rawSources,
    eagle: { folderId: null, folderName: (typeof name === 'string' && name.trim()) || path.basename(root) },
    jianyingDraftDir: ''
  }
  await writeProject(root, project)
  return { root, project, created: true }
}

export function sanitizeSpec(spec) {
  if (!spec || typeof spec !== 'object') return {}
  const out = {}
  if (['16:9', '9:16', '1:1', '4:3'].includes(spec.aspect)) out.aspect = spec.aspect
  for (const key of ['width', 'height']) if (Number.isInteger(spec[key]) && spec[key] >= 160 && spec[key] <= 8192) out[key] = spec[key]
  if ([23.976, 24, 25, 29.97, 30, 50, 60].includes(Number(spec.fps))) out.fps = Number(spec.fps)
  if (Number.isFinite(Number(spec.targetDuration)) && spec.targetDuration > 0 && spec.targetDuration <= 7200) out.targetDuration = Number(spec.targetDuration)
  return out
}

export function sanitizeRules(rules) {
  const out = {}
  if (!rules || typeof rules !== 'object') return out
  const ranges = { sharpnessMin: [0, 100], shakeVarianceMax: [0, 100], minDuration: [0, 30], blackLuma: [0, 255], blackRatioMax: [0, 1], duplicateSimilarity: [0.5, 1] }
  for (const [key, [min, max]] of Object.entries(ranges)) {
    const n = Number(rules[key])
    if (rules[key] !== undefined && Number.isFinite(n) && n >= min && n <= max) out[key] = n
  }
  return out
}

const migrated = new Map()
/** Bring a project folder to the current layout once per process (idempotent on disk too). */
export function ensureLayout(root) {
  if (!migrated.has(root)) {
    const task = (async () => {
      const project = await readJson(projectFile(root), null)
      if (!project) return null
      if ((project.layout || 1) >= LAYOUT_VERSION) {
        for (const sub of PROJECT_DIRS) await mkdir(path.join(root, sub), { recursive: true })
        return null
      }
      const report = await migrateLayout(root, project)
      await writeProject(root, { ...project, ...report.project, layout: LAYOUT_VERSION })
      return report
    })()
    migrated.set(root, task)
    task.catch(() => migrated.delete(root))
  }
  return migrated.get(root)
}
