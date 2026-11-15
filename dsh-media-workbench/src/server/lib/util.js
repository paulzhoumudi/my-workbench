import { mkdir, readFile, rename, writeFile, stat, appendFile, realpath, lstat } from 'node:fs/promises'
import { createHash, randomBytes } from 'node:crypto'
import path from 'node:path'

export class WorkbenchError extends Error {
  /** @param {string} message @param {number} [status] @param {string} [code] */
  constructor(message, status = 400, code = 'BAD_REQUEST') {
    super(message)
    this.status = status
    this.code = code
  }
}

export const now = () => new Date().toISOString()
export const sha1 = (text) => createHash('sha1').update(text).digest('hex')
export const shortId = (prefix = '') => prefix + randomBytes(5).toString('hex')

export async function exists(file) {
  try { await stat(file); return true } catch (error) { if (error.code === 'ENOENT') return false; throw error }
}

export async function readJson(file, fallback) {
  try {
    return JSON.parse(await readFile(file, 'utf8'))
  } catch (error) {
    if (error.code === 'ENOENT') return fallback
    if (error instanceof SyntaxError) throw new WorkbenchError(`文件不是有效的 JSON：${path.basename(file)}`, 500, 'BAD_JSON')
    throw error
  }
}

/** Write through a sibling temp file so a crash never leaves half a JSON file behind. */
export async function writeAtomic(file, data) {
  await mkdir(path.dirname(file), { recursive: true })
  const temp = `${file}.${randomBytes(4).toString('hex')}.tmp`
  await writeFile(temp, data)
  try {
    await rename(temp, file)
  } catch (error) {
    // Windows refuses to replace a file another process is reading; retry once.
    if (error.code !== 'EPERM' && error.code !== 'EBUSY') throw error
    await new Promise((resolve) => setTimeout(resolve, 80))
    await rename(temp, file)
  }
}

export const writeJson = (file, value) => writeAtomic(file, JSON.stringify(value, null, 2) + '\n')

export async function readText(file, fallback = null) {
  try { return await readFile(file, 'utf8') } catch (error) { if (error.code === 'ENOENT') return fallback; throw error }
}

/**
 * Resolve a project-relative path and refuse anything that escapes the root.
 * All agent and panel file access goes through this check (P5 / 禁止访问项目外路径).
 */
export function inside(root, relative) {
  if (typeof relative !== 'string' || relative.includes('\0')) throw new WorkbenchError('路径无效。')
  const resolved = path.resolve(root, relative)
  const rel = path.relative(root, resolved)
  if (rel.startsWith('..') || path.isAbsolute(rel)) throw new WorkbenchError('只能访问项目文件夹内的文件。', 403, 'OUTSIDE_PROJECT')
  return resolved
}

export const toPosix = (p) => p.split(path.sep).join('/')
export const relTo = (root, file) => toPosix(path.relative(root, file))

export async function realDirectory(dir) {
  if (typeof dir !== 'string' || !dir.trim()) throw new WorkbenchError('请选择项目文件夹。')
  let real
  try { real = await realpath(dir) } catch { throw new WorkbenchError('文件夹不存在或无法访问。', 404, 'NOT_FOUND') }
  const info = await lstat(real)
  if (!info.isDirectory()) throw new WorkbenchError('所选路径不是文件夹。')
  return real
}

/** Simple per-key promise chain so concurrent requests never interleave writes to the same file. */
export function createLocks() {
  const chains = new Map()
  return function lock(key, task) {
    const previous = chains.get(key) || Promise.resolve()
    const next = previous.then(task, task)
    const settled = next.catch(() => {})
    chains.set(key, settled)
    settled.then(() => { if (chains.get(key) === settled) chains.delete(key) })
    return next
  }
}

export async function appendLog(root, entry) {
  try {
    const day = new Date().toISOString().slice(0, 10)
    const file = path.join(root, '.dsh', 'log', `${day}.jsonl`)
    await mkdir(path.dirname(file), { recursive: true })
    await appendFile(file, JSON.stringify({ at: now(), ...entry }) + '\n')
  } catch {
    // Logging must never block a user operation; failures surface nowhere else by design.
  }
}

export const round = (value, digits = 2) => Math.round(value * 10 ** digits) / 10 ** digits

export function clampNumber(value, min, max, fallback) {
  const n = Number(value)
  if (!Number.isFinite(n)) return fallback
  return Math.min(max, Math.max(min, n))
}

export const MEDIA_EXTENSIONS = new Set(['.mp4', '.mov', '.mts', '.m2ts', '.mxf', '.avi', '.mkv', '.m4v'])
