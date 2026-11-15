import path from 'node:path'
import { mkdir } from 'node:fs/promises'
import { WorkbenchError, readJson, writeJson, now, shortId, createLocks } from './util.js'
import { BUILTIN_TEMPLATES, DIMENSIONS } from './tags.js'

/**
 * Global tag templates, shared by every project of this DSH home (FR-14).
 * Built-in templates can be edited (the edit is stored as an override and can
 * be reset); templates saved from a project are custom and can be deleted.
 * A project dictionary inherits one template: its effective vocabulary is
 * template ∪ project tags.
 */
export function createTemplateStore(home) {
  const file = path.join(home, 'tag-templates.json')
  const lock = createLocks()
  const read = async () => {
    const data = await readJson(file, { schema: 1, templates: {} })
    if (!data.templates || typeof data.templates !== 'object') data.templates = {}
    return data
  }
  const write = async (data) => { await mkdir(home, { recursive: true }); await writeJson(file, data) }

  async function all() {
    const data = await read()
    const out = {}
    for (const [key, value] of Object.entries(BUILTIN_TEMPLATES)) {
      const override = data.templates[key]
      out[key] = { key, label: override?.label || value.label, dims: cleanDims(override?.dims || value.dims), builtin: true, edited: Boolean(override), updatedAt: override?.updatedAt || null }
    }
    for (const [key, value] of Object.entries(data.templates)) {
      if (BUILTIN_TEMPLATES[key] || !value || value.deleted) continue
      out[key] = { key, label: value.label || key, dims: cleanDims(value.dims), builtin: false, edited: false, updatedAt: value.updatedAt || null, createdFrom: value.createdFrom || null }
    }
    return out
  }

  return {
    all,
    async list() {
      return Object.values(await all())
    },
    async get(key) {
      const map = await all()
      return map[key] || null
    },
    /** Replace a template's label and dimensions. */
    save(key, { label, dims }) {
      return lock('templates', async () => {
        const map = await all()
        if (!map[key]) throw new WorkbenchError('模板不存在。', 404, 'NO_TEMPLATE')
        const data = await read()
        const nextLabel = typeof label === 'string' && label.trim() ? label.trim().slice(0, 40) : map[key].label
        assertUniqueLabel(map, nextLabel, key)
        data.templates[key] = { ...(data.templates[key] || {}), label: nextLabel, dims: cleanDims(dims || map[key].dims), updatedAt: now() }
        await write(data)
        return (await all())[key]
      })
    },
    /** New custom template, e.g. saved from a project's current tags. */
    create({ label, dims, createdFrom }) {
      return lock('templates', async () => {
        const name = typeof label === 'string' ? label.trim().slice(0, 40) : ''
        if (!name) throw new WorkbenchError('请给模板起个名字。')
        const map = await all()
        assertUniqueLabel(map, name)
        const data = await read()
        const key = shortId('tpl_')
        data.templates[key] = { label: name, dims: cleanDims(dims), createdAt: now(), updatedAt: now(), ...(createdFrom ? { createdFrom } : {}) }
        await write(data)
        return (await all())[key]
      })
    },
    remove(key) {
      return lock('templates', async () => {
        if (BUILTIN_TEMPLATES[key]) throw new WorkbenchError('内置模板不能删除，可以「恢复默认」。')
        const data = await read()
        if (!data.templates[key]) throw new WorkbenchError('模板不存在。', 404, 'NO_TEMPLATE')
        delete data.templates[key]
        await write(data)
        return { removed: key }
      })
    },
    /** Drop the user's edits to a built-in template. */
    reset(key) {
      return lock('templates', async () => {
        if (!BUILTIN_TEMPLATES[key]) throw new WorkbenchError('只有内置模板可以恢复默认。')
        const data = await read()
        delete data.templates[key]
        await write(data)
        return (await all())[key]
      })
    }
  }
}

function assertUniqueLabel(map, label, self) {
  const clash = Object.values(map).find((t) => t.label === label && t.key !== self)
  if (clash) throw new WorkbenchError(`已经有名为「${label}」的模板。`)
}

/** Normalise { dim: [tag] }: trimmed, unique, each tag in one dimension only. */
export function cleanDims(dims) {
  const out = {}
  const seen = new Set()
  const source = dims && typeof dims === 'object' ? dims : {}
  const order = [...DIMENSIONS, ...Object.keys(source).filter((k) => !DIMENSIONS.includes(k))]
  for (const dim of order) {
    const name = String(dim).trim().slice(0, 20)
    if (!name || name === '继承' || name === '待审') continue
    const list = Array.isArray(source[dim]) ? source[dim] : []
    out[name] = []
    for (const raw of list) {
      const tag = String(raw ?? '').trim().slice(0, 30)
      if (!tag || seen.has(tag)) continue
      seen.add(tag)
      out[name].push(tag)
    }
  }
  return out
}

export { DIMENSIONS }
