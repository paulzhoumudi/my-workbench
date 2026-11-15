import YAML from 'yaml'
import { WorkbenchError } from './util.js'

export const DIMENSIONS = ['场景', '主体', '景别', '运镜', '情绪', '用途']
const META_KEYS = new Set(['继承', '待审'])

/** Built-in global templates (users can edit them or add their own: see templates.js). */
export const BUILTIN_TEMPLATES = {
  'vlog-base': {
    label: 'Vlog 基础',
    dims: {
      场景: [], 主体: ['人物', '自拍', '食物', '街景', '植物'], 景别: ['远景', '全景', '中景', '近景', '特写'],
      运镜: ['固定', '推', '拉', '摇', '移', '跟拍', '环绕', '航拍', '延时'], 情绪: ['治愈', '热闹', '安静', '温暖'],
      用途: ['开场', '转场空镜', '结尾', '口播']
    }
  },
  'product-ad': {
    label: '产品广告',
    dims: {
      场景: ['棚拍', '桌面', '户外', '居家', '办公'], 主体: ['产品整体', '产品细节', 'Logo', '包装', '手部操作', '使用者'],
      景别: ['全景', '中景', '近景', '特写', '微距'], 运镜: ['固定', '推', '拉', '摇', '滑轨', '环绕', '升降', '转台'],
      情绪: ['高级', '科技', '活力', '温暖'], 用途: ['开场', '卖点展示', '功能演示', '转场空镜', '结尾', '口播', '价格信息']
    }
  }
}

/** Parse the dictionary YAML into { inherit, dims: {dim: [tag]}, pending: [tag] }. Comments are preserved on write. */
export function parseDictionary(text) {
  const doc = YAML.parseDocument(text || '')
  if (doc.errors.length) throw new WorkbenchError(`标签字典 YAML 有语法错误：${doc.errors[0].message.split('\n')[0]}`, 422, 'BAD_YAML')
  const data = doc.toJS() || {}
  if (typeof data !== 'object' || Array.isArray(data)) throw new WorkbenchError('标签字典必须是「维度: [标签]」的结构。', 422, 'BAD_YAML')
  const dims = {}
  for (const [key, value] of Object.entries(data)) {
    if (META_KEYS.has(key)) continue
    dims[key] = toList(value)
  }
  for (const dim of DIMENSIONS) dims[dim] ||= []
  const rawPending = data['待审']
  const pendingDims = {}
  let pending
  if (rawPending && typeof rawPending === 'object' && !Array.isArray(rawPending)) {
    pending = []
    for (const [tag, dim] of Object.entries(rawPending)) {
      const name = String(tag).trim()
      if (!name || pending.includes(name)) continue
      pending.push(name)
      if (typeof dim === 'string' && dim.trim()) pendingDims[name] = dim.trim()
    }
  } else pending = toList(rawPending)
  return { inherit: typeof data['继承'] === 'string' ? data['继承'] : null, dims, pending, pendingDims }
}

function toList(value) {
  if (value === null || value === undefined) return []
  const list = Array.isArray(value) ? value : String(value).split(/[,，、]/)
  return [...new Set(list.map((item) => String(item).trim()).filter(Boolean))]
}

export function serializeDictionary({ inherit, dims, pending, pendingDims }, header = '# 标签字典（项目级）· 打标只能从这里选；待审区是 AI 建议的新标签，确认后转正\n') {
  const lines = [header.trimEnd()]
  if (inherit) lines.push(`继承: ${quote(inherit)}`)
  const order = [...DIMENSIONS, ...Object.keys(dims).filter((key) => !DIMENSIONS.includes(key))]
  for (const dim of order) lines.push(`${quote(dim)}: [${(dims[dim] || []).map(quote).join(', ')}]`)
  const list = pending || []
  const hints = pendingDims || {}
  if (list.some((tag) => hints[tag])) lines.push(`待审: {${list.map((tag) => `${quote(tag)}: ${hints[tag] ? quote(hints[tag]) : 'null'}`).join(', ')}}`)
  else lines.push(`待审: [${list.map(quote).join(', ')}]`)
  return lines.join('\n') + '\n'
}

const quote = (tag) => (/^[\p{L}\p{N}_\- ·]+$/u.test(tag) && !/^\s|\s$/.test(tag) && !/^(true|false|null|yes|no|on|off|~|\d+(\.\d+)?)$/i.test(tag) ? tag : JSON.stringify(tag))

/**
 * Template ∪ project dictionary: the vocabulary the tagger may choose from.
 * `templates` maps template key → { dims } (built-in plus the user's own).
 */
export function effectiveDictionary(dictionary, templates = BUILTIN_TEMPLATES) {
  const template = dictionary.inherit && templates?.[dictionary.inherit]
  const dims = {}
  const seen = new Set()
  const keys = [...new Set([...DIMENSIONS, ...Object.keys(template?.dims || {}), ...Object.keys(dictionary.dims)])]
  for (const dim of keys) {
    dims[dim] = []
    for (const tag of [...(template?.dims?.[dim] || []), ...(dictionary.dims[dim] || [])]) {
      if (seen.has(tag)) continue
      seen.add(tag)
      dims[dim].push(tag)
    }
  }
  return { inherit: dictionary.inherit, dims, pending: dictionary.pending, pendingDims: dictionary.pendingDims || {}, templateMissing: Boolean(dictionary.inherit && !template) }
}

/**
 * Switch the template a project inherits. Tags the clips already use that
 * would disappear with the old template are kept as project tags, so no clip
 * loses a tag.
 */
export function switchTemplate(dictionary, key, templates, usedTags = new Set()) {
  const before = effectiveDictionary(dictionary, templates)
  const next = { ...cloneDictionary(dictionary), inherit: key }
  const after = effectiveDictionary(next, templates)
  const known = tagIndex(after)
  const kept = []
  for (const [dim, tags] of Object.entries(before.dims)) {
    for (const tag of tags) {
      if (known.has(tag) || !usedTags.has(tag)) continue
      next.dims[dim] ||= []
      next.dims[dim].push(tag)
      kept.push(tag)
    }
  }
  const dropped = Object.values(before.dims).flat().filter((tag) => !known.has(tag) && !kept.includes(tag))
  const added = Object.values(after.dims).flat().filter((tag) => !tagIndex(before).has(tag))
  return { dictionary: next, kept, dropped, added }
}

/** Snapshot of the effective vocabulary, for saving a project's tags as a template. */
export function dimsForTemplate(dictionary, templates) {
  return effectiveDictionary(dictionary, templates).dims
}

const cloneDictionary = (dictionary) => ({
  inherit: dictionary.inherit,
  dims: Object.fromEntries(Object.entries(dictionary.dims).map(([k, v]) => [k, [...v]])),
  pending: [...(dictionary.pending || [])],
  pendingDims: { ...(dictionary.pendingDims || {}) }
})

export function tagIndex(effective) {
  const map = new Map()
  for (const [dim, tags] of Object.entries(effective.dims)) for (const tag of tags) if (!map.has(tag)) map.set(tag, dim)
  return map
}

export function defaultDictionaryText(template = 'vlog-base') {
  return serializeDictionary({ inherit: typeof template === 'string' && template ? template : 'vlog-base', dims: Object.fromEntries(DIMENSIONS.map((dim) => [dim, []])), pending: [] })
}

/**
 * Apply one dictionary operation (FR-24). Returns the new dictionary plus a
 * function mapping a clip's tag list to its updated list, so the index and
 * Eagle can be rewritten consistently.
 */
export function applyTagOperation(dictionary, op, templates = BUILTIN_TEMPLATES) {
  const next = cloneDictionary(dictionary)
  const tag = typeof op.tag === 'string' ? op.tag.trim() : ''
  const to = typeof op.to === 'string' ? op.to.trim() : ''
  const dim = typeof op.dim === 'string' ? op.dim.trim() : ''
  const effective = effectiveDictionary(dictionary, templates)
  const known = tagIndex(effective)
  const dropPending = (name) => { next.pending = next.pending.filter((item) => item !== name); delete next.pendingDims[name] }
  const removeEverywhere = (name) => {
    for (const key of Object.keys(next.dims)) next.dims[key] = next.dims[key].filter((item) => item !== name)
    dropPending(name)
  }
  const isTemplateTag = (name) => known.has(name) && !(dictionary.dims[known.get(name)] || []).includes(name)
  // Dimension-level operations.
  if (op.op === 'add-dim') {
    if (!dim) throw new WorkbenchError('请填写维度名称。')
    if (dim === '继承' || dim === '待审') throw new WorkbenchError('这个名字是保留字，请换一个。')
    if (effective.dims[dim]) throw new WorkbenchError(`已经有【${dim}】维度。`)
    next.dims[dim] = []
    return { dictionary: next, mapTags: (tags) => tags, affects: () => false, summary: `新增维度【${dim}】` }
  }
  if (op.op === 'delete-dim') {
    if (DIMENSIONS.includes(dim)) throw new WorkbenchError(`【${dim}】是基础维度，不能删除。`)
    if (!effective.dims[dim]) throw new WorkbenchError(`没有【${dim}】维度。`)
    if (effective.dims[dim].length) throw new WorkbenchError(`【${dim}】里还有标签，先删除或移走这些标签。`)
    delete next.dims[dim]
    return { dictionary: next, mapTags: (tags) => tags, affects: () => false, summary: `删除维度【${dim}】` }
  }
  if (!tag) throw new WorkbenchError('请指定标签。')
  switch (op.op) {
    case 'suggest': {
      // AI proposal: goes to 待审 with a suggested dimension; never straight into the dictionary.
      if (known.has(tag)) throw new WorkbenchError(`「${tag}」已在【${known.get(tag)}】维度。`)
      if (!next.pending.includes(tag)) next.pending.push(tag)
      if (dim) next.pendingDims[tag] = dim
      return { dictionary: next, mapTags: (tags) => tags, affects: () => false, summary: `建议新标签「${tag}」${dim ? `（${dim}）` : ''}进入待审` }
    }
    case 'move': {
      if (!dim) throw new WorkbenchError('请指定要移到哪个维度。')
      if (!known.has(tag)) throw new WorkbenchError(`字典里没有「${tag}」。`)
      if (known.get(tag) === dim) throw new WorkbenchError(`「${tag}」已经在【${dim}】。`)
      if (isTemplateTag(tag)) throw new WorkbenchError(`「${tag}」来自模板，请在「编辑模板」里调整它的维度。`)
      removeEverywhere(tag)
      next.dims[dim] ||= []
      next.dims[dim].push(tag)
      return { dictionary: next, mapTags: (tags) => tags, affects: (clip) => clip.tags?.includes(tag), summary: `把「${tag}」移到【${dim}】`, retag: { tag, dim } }
    }
    case 'add': {
      if (!dim) throw new WorkbenchError('新增标签需要指定维度。')
      if (known.has(tag)) throw new WorkbenchError(`「${tag}」已在【${known.get(tag)}】维度。`)
      next.dims[dim] ||= []
      next.dims[dim].push(tag)
      dropPending(tag)
      return { dictionary: next, mapTags: (tags) => tags, affects: () => false, summary: `在【${dim}】新增「${tag}」` }
    }
    case 'approve': {
      if (!dim) throw new WorkbenchError('转正待审标签需要指定维度。')
      if (!next.pending.includes(tag)) throw new WorkbenchError(`「${tag}」不在待审区。`)
      if (known.has(tag)) throw new WorkbenchError(`「${tag}」已在【${known.get(tag)}】维度，直接驳回这条待审即可。`)
      dropPending(tag)
      next.dims[dim] ||= []
      if (!next.dims[dim].includes(tag)) next.dims[dim].push(tag)
      return { dictionary: next, approve: { tag, dim }, mapTags: (tags) => tags, affects: (clip) => clip.pendingTags?.some((item) => item.tag === tag), summary: `把待审标签「${tag}」转正到【${dim}】` }
    }
    case 'reject': {
      if (!next.pending.includes(tag)) throw new WorkbenchError(`「${tag}」不在待审区。`)
      dropPending(tag)
      return { dictionary: next, reject: tag, mapTags: (tags) => tags, affects: (clip) => clip.pendingTags?.some((item) => item.tag === tag), summary: `驳回待审标签「${tag}」` }
    }
    case 'rename': {
      if (!to) throw new WorkbenchError('请指定新名称。')
      if (!known.has(tag) && !next.pending.includes(tag)) throw new WorkbenchError(`字典里没有「${tag}」。`)
      if (known.has(to)) throw new WorkbenchError(`「${to}」已存在，请改用合并。`)
      const owner = known.get(tag)
      const fromTemplate = owner && !(dictionary.dims[owner] || []).includes(tag)
      for (const key of Object.keys(next.dims)) next.dims[key] = next.dims[key].map((item) => (item === tag ? to : item))
      next.pending = next.pending.map((item) => (item === tag ? to : item))
      if (next.pendingDims[tag]) { next.pendingDims[to] = next.pendingDims[tag]; delete next.pendingDims[tag] }
      if (fromTemplate) (next.dims[owner] ||= []).push(to)
      return { dictionary: next, mapTags: (tags) => dedupe(tags.map((item) => (item === tag ? to : item))), affects: (clip) => clip.tags?.includes(tag) || clip.aiTags?.some((item) => item.tag === tag), summary: `把「${tag}」改名为「${to}」` }
    }
    case 'merge': {
      if (!to) throw new WorkbenchError('请指定合并到哪个标签。')
      if (!known.has(to)) throw new WorkbenchError(`目标标签「${to}」不在字典里。`)
      if (tag === to) throw new WorkbenchError('不能合并到自身。')
      removeEverywhere(tag)
      return { dictionary: next, mapTags: (tags) => dedupe(tags.map((item) => (item === tag ? to : item))), affects: (clip) => clip.tags?.includes(tag) || clip.aiTags?.some((item) => item.tag === tag), summary: `把「${tag}」合并到「${to}」` }
    }
    case 'delete': {
      if (!known.has(tag) && !next.pending.includes(tag)) throw new WorkbenchError(`字典里没有「${tag}」。`)
      if (isTemplateTag(tag)) throw new WorkbenchError(`「${tag}」来自模板，不能只在本项目删除；可以在「编辑模板」里删，或合并到别的标签。`)
      removeEverywhere(tag)
      return { dictionary: next, mapTags: (tags) => tags.filter((item) => item !== tag), affects: (clip) => clip.tags?.includes(tag) || clip.aiTags?.some((item) => item.tag === tag), summary: `删除「${tag}」` }
    }
    default:
      throw new WorkbenchError('不支持的标签操作。可用：add / rename / merge / delete / move / approve / reject / suggest / add-dim / delete-dim')
  }
}

const dedupe = (list) => [...new Set(list)]
