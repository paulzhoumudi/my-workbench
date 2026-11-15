// Eagle 本地 API 读取（品类配置页用）
//   产品名称：来自 Eagle 里的「产品名」标签组（组名可配置，默认自动匹配 产品名 / 产品名称 / 产品）
//   参考标签：其余所有标签组 + 未归组标签，全部排除产品名，在品类配置页展示供参考
// Eagle 需要在本机运行，API 默认 http://localhost:41595
//
//   const eagle = createEagle({ baseUrl, token, productGroup })
//   await eagle.catalog() →
//     { ok: true,
//       productGroup: '产品名',
//       products: ['保温杯', ...],
//       referenceTags: [{ group: '动作', tags: [...] }, { group: '场景', tags: [...] }, { group: '未归组', tags: [...] }],
//       allTags: ['静物展示', ...],      // referenceTags 拍平去重，可直接做标签输入框的候选
//       fetchedAt }
//   或 { ok: false, error: '…' }

const DEFAULT_BASE = 'http://localhost:41595'
const PRODUCT_GROUP_NAMES = ['产品名', '产品名称', '产品', 'product', 'products']
const UNGROUPED = '未归组'
const norm = (s) => String(s ?? '').normalize('NFKC').trim().toLowerCase()

export function createEagle({ baseUrl = DEFAULT_BASE, token = '', productGroup = '', timeoutMs = 4000, cacheMs = 30_000, fetchImpl = fetch } = {}) {
  const base = String(baseUrl || DEFAULT_BASE).replace(/\/+$/, '')
  let cache = null

  async function get(path, params = {}) {
    const url = new URL(base + path)
    for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== '') url.searchParams.set(k, String(v))
    if (token) url.searchParams.set('token', token)
    const res = await fetchImpl(url, { signal: AbortSignal.timeout(timeoutMs) })
    if (!res.ok) throw new Error(`Eagle 返回 HTTP ${res.status}`)
    const body = await res.json()
    if (body?.status !== 'success') throw new Error(`Eagle 返回错误：${body?.message || body?.status || '未知'}`)
    return body.data
  }

  /** 未归组标签：Eagle 没有标签列表接口，从素材上汇总（最多扫描 maxItems 条）。 */
  async function itemTags(maxItems) {
    const tags = new Set()
    const limit = 1000
    for (let offset = 0; offset * limit < maxItems; offset++) {
      const items = await get('/api/item/list', { limit, offset })
      for (const it of items || []) for (const t of it.tags || []) tags.add(t)
      if (!items || items.length < limit) break
    }
    return [...tags]
  }

  return {
    async catalog({ refresh = false, includeUngrouped = true, maxItems = 20000 } = {}) {
      if (!refresh && cache && Date.now() - cache.at < cacheMs) return cache.value
      let value
      try {
        const info = await get('/api/library/info')
        const groups = info.tagsGroups || []
        // 组名前的排序前缀（如「01_产品名」里的 01_）不参与匹配
        const bare = (s) => norm(s).replace(/^\d+[\s._、-]*/, '')
        const wanted = productGroup ? [norm(productGroup)] : PRODUCT_GROUP_NAMES.map(norm)
        const pg = wanted.map((w) => groups.find((g) => norm(g.name) === w || bare(g.name) === bare(w))).find(Boolean)
        if (!pg) {
          const names = groups.map((g) => g.name).filter(Boolean).join('、') || '（没有标签组）'
          throw new Error(`Eagle 里没找到产品名标签组${productGroup ? `「${productGroup}」` : '（产品名 / 产品名称）'}。现有标签组：${names}。可以在「引擎与设置」里指定组名。`)
        }
        const products = uniq(pg.tags || [])
        const productSet = new Set(products.map(norm))
        const keep = (t) => norm(t) && !productSet.has(norm(t))

        const seen = new Set(products.map(norm))
        const referenceTags = []
        for (const g of groups) {
          if (g === pg) continue
          const tags = uniq((g.tags || []).filter(keep))
          for (const t of g.tags || []) seen.add(norm(t))
          if (tags.length) referenceTags.push({ group: String(g.name || '').trim() || '未命名组', tags })
        }
        if (includeUngrouped) {
          const loose = uniq((await itemTags(maxItems).catch(() => [])).filter((t) => keep(t) && !seen.has(norm(t))))
          if (loose.length) referenceTags.push({ group: UNGROUPED, tags: loose })
        }
        value = {
          ok: true, productGroup: pg.name, products, referenceTags,
          allTags: uniq(referenceTags.flatMap((g) => g.tags)), fetchedAt: new Date().toISOString(),
        }
      } catch (e) {
        value = { ok: false, error: explain(e, base) }
      }
      cache = { at: Date.now(), value }
      return value
    },
  }
}

function uniq(list) {
  const seen = new Set(), out = []
  for (const x of list) {
    const s = String(x ?? '').trim()
    if (s && !seen.has(norm(s))) { seen.add(norm(s)); out.push(s) }
  }
  return out
}

function explain(e, base) {
  const msg = String(e?.cause?.code || e?.name || '') + ' ' + String(e?.message || e)
  if (/ECONNREFUSED|fetch failed|ENOTFOUND/i.test(msg)) return `连不上 Eagle（${base}）。请先打开 Eagle 和对应的资料库。`
  if (/Timeout|AbortError/i.test(msg)) return `Eagle 响应超时（${base}）。`
  return String(e?.message || e).slice(0, 300)
}
