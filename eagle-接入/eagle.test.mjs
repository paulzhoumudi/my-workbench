import http from 'node:http'
import assert from 'node:assert/strict'
import { createEagle } from './eagle.mjs'

let lib = {
  folders: [{ name: '保温杯', children: [] }],
  tagsGroups: [
    { name: '产品名', tags: ['保温杯', '蓝牙耳机', ' 保温杯 '] },
    { name: '动作', tags: ['静物展示', '手持展示', '使用演示', '保温杯'] },
    { name: '场景', tags: ['办公桌', '户外露营', '厨房', '蓝牙耳机'] },
    { name: '只有产品名', tags: ['蓝牙耳机'] },
  ],
}
const items = [{ tags: ['静物展示', '暖色调', '保温杯'] }, { tags: ['俯拍', '蓝牙耳机'] }]

const server = http.createServer((req, res) => {
  const u = new URL(req.url, 'http://x')
  res.setHeader('content-type', 'application/json')
  if (u.pathname === '/api/library/info') return res.end(JSON.stringify({ status: 'success', data: lib }))
  if (u.pathname === '/api/item/list') return res.end(JSON.stringify({ status: 'success', data: u.searchParams.get('offset') === '0' ? items : [] }))
  res.statusCode = 404; res.end('{}')
})
await new Promise((r) => server.listen(0, '127.0.0.1', r))
const base = `http://127.0.0.1:${server.address().port}`

// 1. 产品名来自「产品名」标签组；其余标签排除产品名后作参考
const c = await createEagle({ baseUrl: base }).catalog()
assert.equal(c.ok, true, c.error)
assert.equal(c.productGroup, '产品名')
assert.deepEqual(c.products, ['保温杯', '蓝牙耳机'])
assert.deepEqual(c.referenceTags, [
  { group: '动作', tags: ['静物展示', '手持展示', '使用演示'] },
  { group: '场景', tags: ['办公桌', '户外露营', '厨房'] },
  { group: '未归组', tags: ['暖色调', '俯拍'] },
])
assert.deepEqual(c.allTags, ['静物展示', '手持展示', '使用演示', '办公桌', '户外露营', '厨房', '暖色调', '俯拍'])

// 2. 指定组名
lib.tagsGroups[0].name = '品牌产品'
const named = await createEagle({ baseUrl: base, productGroup: '品牌产品' }).catalog()
assert.deepEqual(named.products, ['保温杯', '蓝牙耳机'])

// 3. 找不到产品名组时给出可操作的提示
const missing = await createEagle({ baseUrl: base }).catalog()
assert.equal(missing.ok, false)
assert.match(missing.error, /没找到产品名标签组.*品牌产品/)

// 4. 你资料库的真实结构：组名带排序前缀「01_产品名」
lib = {
  folders: [{ name: 'Spa5', children: [] }, { name: 'PH3-T', children: [] }],
  tagsGroups: [
    { name: '01_产品名', tags: ['Spa5', 'Spa3-A', 'Pure5', 'Spa3-T'] },
    { name: '02_景别', tags: ['1远景', '2全景', '5特写'] },
    { name: '03_运镜', tags: ['固定机位', '推进'] },
    { name: '07_传递感受', tags: ['适合开头', 'Spa5'] },
  ],
}
const real = await createEagle({ baseUrl: base, cacheMs: 0 }).catalog({ includeUngrouped: false })
assert.equal(real.ok, true, real.error)
assert.equal(real.productGroup, '01_产品名')
assert.deepEqual(real.products, ['Spa5', 'Spa3-A', 'Pure5', 'Spa3-T'])
assert.deepEqual(real.referenceTags.map((g) => g.group), ['02_景别', '03_运镜', '07_传递感受'])
assert.deepEqual(real.referenceTags[2].tags, ['适合开头'])

// 5. Eagle 没开
server.close()
const down = await createEagle({ baseUrl: base }).catalog()
assert.equal(down.ok, false)
assert.match(down.error, /连不上 Eagle/)
console.log('eagle: all assertions passed')
