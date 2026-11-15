import { readdir, mkdir, copyFile } from 'node:fs/promises'
import path from 'node:path'
import { WorkbenchError, exists, now, readJson, readText, sha1, writeAtomic, writeJson, appendLog } from './util.js'
import { countChanges, diffLines } from './diff.js'
import { P } from './layout.js'

/** The versioned documents a project owns (FR-10, FR-31). Keys are what the Agent and panel use. */
export const DOCS = {
  '00_主题简报.md': '创意剪辑/00_主题简报.md',
  '01_创意方向.md': '创意剪辑/01_创意方向.md',
  '02_文案.md': '创意剪辑/02_文案.md',
  '03_分镜脚本.md': '创意剪辑/03_分镜脚本.md',
  '标签字典.yaml': P.dictionary,
  '剪辑思路.md': '创意剪辑/剪辑思路.md'
}
export const EDIT_USE_DOCS = ['02_文案.md', '03_分镜脚本.md']

const metaFile = (root) => path.join(root, '.dsh', 'creative.json')
const cacheFile = (root, key) => path.join(root, '.dsh', 'cache', 'creative', key)

export function resolveDocKey(input) {
  if (typeof input !== 'string') throw new WorkbenchError('请指定文件。')
  let name = input.trim().replace(/\\/g, '/').split('/').pop()
  if (name === '04_标签字典.yaml') name = '标签字典.yaml' // v1 name
  if (DOCS[name]) return name
  // Accept loose names such as "文案", "分镜", "标签字典", "02".
  const loose = Object.keys(DOCS).find((key) => key.replace(/^\d+_/, '').replace(/\.(md|yaml)$/, '') === name.replace(/\.(md|yaml)$/, '')
    || key.startsWith(name + '_') || (name.length >= 2 && key.includes(name)))
  if (loose) return loose
  throw new WorkbenchError(`不支持的创意文件：${input}。可用：${Object.keys(DOCS).join('、')}`)
}

function historyPaths(root, key) {
  const rel = DOCS[key]
  const dir = path.join(root, path.dirname(rel), '_history')
  const ext = path.extname(rel)
  const stem = path.basename(rel, ext)
  return { dir, ext, stem }
}

const historyFile = (root, key, label) => {
  const { dir, ext, stem } = historyPaths(root, key)
  return path.join(dir, `${stem}_${label}${ext}`)
}

export function createCreativeStore({ lock }) {
  const readMeta = async (root) => {
    const meta = await readJson(metaFile(root), { files: {}, editUse: {} })
    meta.files ||= {}
    meta.editUse ||= {}
    return meta
  }

  /**
   * Bring metadata in line with disk. When something outside this API changed
   * a document (the Agent's generic file tool, an editor), the last known
   * content is archived as the previous version so nothing is lost (P5).
   */
  async function reconcile(root, meta, key) {
    const file = path.join(root, DOCS[key])
    const disk = await readText(file)
    const entry = meta.files[key]
    if (disk === null) {
      if (entry) entry.missing = true
      return { changed: Boolean(entry && !entry.missing), content: null }
    }
    const hash = sha1(disk)
    if (!entry) {
      meta.files[key] = { version: 1, source: 'external', generatedAt: now(), manualEdits: 0, hash }
      await writeAtomic(cacheFile(root, key), disk)
      return { changed: true, content: disk }
    }
    delete entry.missing
    if (entry.hash === hash) return { changed: false, content: disk }
    const previous = await readText(cacheFile(root, key))
    if (previous !== null) {
      await mkdir(historyPaths(root, key).dir, { recursive: true })
      const target = historyFile(root, key, `v${entry.version}`)
      if (!(await exists(target))) await writeAtomic(target, previous)
    }
    entry.version += 1
    entry.source = 'external'
    entry.generatedAt = now()
    entry.manualEdits = 0
    entry.hash = hash
    delete entry.model
    await writeAtomic(cacheFile(root, key), disk)
    await appendLog(root, { action: 'creative.reconcile', file: key, version: entry.version, note: '检测到外部修改，旧内容已存入 _history' })
    return { changed: true, content: disk }
  }

  async function reconcileAll(root) {
    return lock(`creative:${root}`, async () => {
      const meta = await readMeta(root)
      let changed = false
      for (const key of Object.keys(DOCS)) changed = (await reconcile(root, meta, key)).changed || changed
      if (changed) await writeJson(metaFile(root), meta)
      return meta
    })
  }

  async function listHistory(root, key) {
    const { dir, ext, stem } = historyPaths(root, key)
    let names = []
    try { names = await readdir(dir) } catch { return [] }
    const pattern = new RegExp(`^${escapeRegExp(stem)}_v(\\d+)(_手改前)?${escapeRegExp(ext)}$`)
    return names.map((name) => {
      const match = name.match(pattern)
      if (!match) return null
      return { version: Number(match[1]), label: match[2] ? `v${match[1]} 手改前` : `v${match[1]}`, ref: match[2] ? `v${match[1]}_手改前` : `v${match[1]}`, file: name }
    }).filter(Boolean).sort((a, b) => b.version - a.version || a.label.localeCompare(b.label))
  }

  return {
    reconcileAll,
    async list(root) {
      const meta = await reconcileAll(root)
      const out = []
      for (const [key, rel] of Object.entries(DOCS)) {
        const entry = meta.files[key]
        out.push({
          key, path: rel,
          exists: Boolean(entry && !entry.missing),
          version: entry?.version ?? 0,
          source: entry?.source ?? null,
          model: entry?.model ?? null,
          generatedAt: entry?.generatedAt ?? null,
          manualEdits: entry?.manualEdits ?? 0,
          note: entry?.note ?? null,
          editUse: meta.editUse[key] ?? null,
          history: await listHistory(root, key)
        })
      }
      return out
    },
    async read(root, keyInput, ref) {
      const key = resolveDocKey(keyInput)
      const meta = await reconcileAll(root)
      const entry = meta.files[key]
      if (ref === undefined || ref === null || ref === '' || ref === 'current' || (entry && ref === `v${entry.version}`) || (entry && Number(ref) === entry.version)) {
        const content = await readText(path.join(root, DOCS[key]))
        return { key, path: DOCS[key], version: entry?.version ?? 0, current: true, content: content ?? '', exists: content !== null, meta: entry || null, editUse: meta.editUse[key] ?? null }
      }
      const label = typeof ref === 'number' || /^\d+$/.test(String(ref)) ? `v${ref}` : String(ref)
      if (!/^v\d+(_手改前)?$/.test(label)) throw new WorkbenchError('版本号无效。')
      const content = await readText(historyFile(root, key, label))
      if (content === null) throw new WorkbenchError(`找不到 ${key} 的 ${label}。`, 404, 'NO_VERSION')
      return { key, path: DOCS[key], version: Number(label.match(/\d+/)[0]), label, current: false, content, exists: true, meta: null }
    },
    /**
     * Versioned write. Agent writes (source chat) make a new version and move the
     * old one to _history (FR-12). Manual panel saves keep the version number,
     * archive the pre-edit original once, and count edited blocks (FR-11).
     */
    async write(root, keyInput, content, { source = 'chat', model, note, expectedHash } = {}) {
      const key = resolveDocKey(keyInput)
      if (typeof content !== 'string') throw new WorkbenchError('内容必须是文本。')
      if (content.length > 2_000_000) throw new WorkbenchError('内容过大。', 413)
      return lock(`creative:${root}`, async () => {
        const meta = await readMeta(root)
        const { content: current } = await reconcile(root, meta, key)
        const file = path.join(root, DOCS[key])
        const entry = meta.files[key]
        if (expectedHash && current !== null && sha1(current) !== expectedHash) {
          await writeJson(metaFile(root), meta)
          throw new WorkbenchError('文件已被其他人（Agent 或外部编辑器）修改，请先查看最新内容再保存。', 409, 'CONFLICT')
        }
        if (current === content) {
          await writeJson(metaFile(root), meta)
          return { key, version: entry?.version ?? 1, unchanged: true }
        }
        await mkdir(historyPaths(root, key).dir, { recursive: true })
        let result
        if (current === null || !entry) {
          meta.files[key] = { version: 1, source, generatedAt: now(), manualEdits: 0, hash: sha1(content), ...(model ? { model } : {}), ...(note ? { note } : {}) }
          result = { key, version: 1, created: true }
        } else if (source === 'manual' || source === 'system') {
          // In-place edits keep the version; the pre-edit original of this version is archived once.
          const original = historyFile(root, key, `v${entry.version}_手改前`)
          if (!(await exists(original))) await writeAtomic(original, current)
          if (source === 'manual') entry.manualEdits = (entry.manualEdits || 0) + countChanges(current, content)
          entry.hash = sha1(content)
          entry.editedAt = now()
          result = { key, version: entry.version, manualEdits: entry.manualEdits }
        } else {
          await writeAtomic(historyFile(root, key, `v${entry.version}`), current)
          Object.assign(entry, { version: entry.version + 1, source, generatedAt: now(), manualEdits: 0, hash: sha1(content) })
          if (model) entry.model = model; else delete entry.model
          if (note) entry.note = note; else delete entry.note
          result = { key, version: entry.version, previous: entry.version - 1 }
        }
        await writeAtomic(file, content)
        await writeAtomic(cacheFile(root, key), content)
        await writeJson(metaFile(root), meta)
        await appendLog(root, { action: 'creative.write', file: key, source, version: result.version, model: model || null })
        return result
      })
    },
    async diff(root, keyInput, from, to) {
      const key = resolveDocKey(keyInput)
      const a = await this.read(root, key, from)
      const b = await this.read(root, key, to)
      return { key, from: a.label || `v${a.version}`, to: b.label || `v${b.version}`, lines: diffLines(a.content, b.content) }
    },
    async rollback(root, keyInput, ref) {
      const key = resolveDocKey(keyInput)
      const old = await this.read(root, key, ref)
      if (old.current) throw new WorkbenchError('已经是当前版本。')
      return this.write(root, key, old.content, { source: 'rollback', note: `回滚自 ${old.label || 'v' + old.version}` })
    },
    async setEditUse(root, keyInput, version) {
      const key = resolveDocKey(keyInput)
      if (!EDIT_USE_DOCS.includes(key)) throw new WorkbenchError('只有文案和分镜脚本可以设为剪辑使用版本。')
      return lock(`creative:${root}`, async () => {
        const meta = await readMeta(root)
        await reconcile(root, meta, key)
        const entry = meta.files[key]
        if (!entry || entry.missing) throw new WorkbenchError(`${key} 还不存在。`)
        const target = version === undefined || version === null ? entry.version : Number(version)
        if (!Number.isInteger(target) || target < 1 || target > entry.version) throw new WorkbenchError('版本号无效。')
        if (target !== entry.version) throw new WorkbenchError('只能把当前版本设为剪辑使用版本；如需旧版本请先回滚。')
        meta.editUse[key] = target
        await writeJson(metaFile(root), meta)
        await appendLog(root, { action: 'creative.editUse', file: key, version: target })
        return { key, editUse: target }
      })
    },
    readMeta,
    /** Copy a file into _history without changing versions (used before destructive tag rewrites). */
    async snapshot(root, keyInput, label) {
      const key = resolveDocKey(keyInput)
      const src = path.join(root, DOCS[key])
      if (!(await exists(src))) return null
      await mkdir(historyPaths(root, key).dir, { recursive: true })
      const target = historyFile(root, key, label)
      await copyFile(src, target)
      return target
    }
  }
}

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
