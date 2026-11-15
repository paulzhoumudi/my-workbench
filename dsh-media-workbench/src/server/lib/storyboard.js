/**
 * Parse the storyboard markdown table — the contract between creative,
 * footage and edit (分镜脚本必填字段). Columns are found by header name so
 * the Agent or the user can reorder them freely.
 */
const COLUMNS = {
  no: ['镜号', '镜头', '编号', 'no', 'shot'],
  duration: ['时长', '秒数', 'duration'],
  desc: ['画面描述', '画面', '内容', 'description'],
  line: ['台词/旁白', '台词', '旁白', '口播', '文案', 'line'],
  tags: ['所需标签', '标签', 'tags'],
  size: ['景别', 'size'],
  move: ['运镜', 'camera', 'move'],
  note: ['备注', 'note']
}

const EMPTY = /^(—|-|–|无|\/|n\/a)?$/i

function cells(line) {
  const trimmed = line.trim().replace(/^\|/, '').replace(/\|$/, '')
  return trimmed.split('|').map((cell) => cell.trim())
}

export function splitTags(text) {
  if (!text || EMPTY.test(text.trim())) return []
  return [...new Set(text.split(/[,，、;；\s/]+/).map((item) => item.replace(/^#/, '').trim()).filter((item) => item && !EMPTY.test(item)))]
}

export function parseDuration(text) {
  if (!text) return 0
  const t = String(text).trim()
  const mmss = t.match(/^(\d+):(\d{1,2}(?:\.\d+)?)$/)
  if (mmss) return Number(mmss[1]) * 60 + Number(mmss[2])
  const n = t.match(/(\d+(?:\.\d+)?)/)
  return n ? Number(n[1]) : 0
}

export function parseStoryboard(markdown) {
  const lines = String(markdown || '').replace(/\r\n/g, '\n').split('\n')
  const shots = []
  let header = null
  for (const raw of lines) {
    const line = raw.trim()
    if (!line.startsWith('|')) continue
    const row = cells(line)
    if (row.every((cell) => /^:?-{2,}:?$/.test(cell) || cell === '')) continue
    if (row.some((cell) => COLUMNS.no.includes(cell.toLowerCase()) || cell === '镜号')) {
      header = {}
      row.forEach((cell, index) => {
        const name = cell.toLowerCase()
        for (const [key, names] of Object.entries(COLUMNS)) {
          if (header[key] === undefined && names.includes(name)) header[key] = index
        }
      })
      continue
    }
    if (!header || header.no === undefined) continue
    const no = row[header.no] || ''
    if (!/\d/.test(no)) continue
    const get = (key) => (header[key] === undefined ? '' : (row[header[key]] || ''))
    const shot = {
      no: no.replace(/[^\dA-Za-z-]/g, '').padStart(2, '0'),
      duration: parseDuration(get('duration')),
      desc: get('desc'),
      line: EMPTY.test(get('line')) ? '' : get('line'),
      tags: splitTags(get('tags')),
      size: EMPTY.test(get('size')) ? '' : get('size'),
      move: EMPTY.test(get('move')) ? '' : get('move'),
      note: get('note'),
      warnings: []
    }
    if (header.tags === undefined || !shot.tags.length) shot.warnings.push('缺少「所需标签」，剪辑无法自动匹配')
    if (!shot.duration) shot.warnings.push('缺少时长')
    shots.push(shot)
  }
  const total = shots.reduce((sum, shot) => sum + shot.duration, 0)
  return { shots, total: Math.round(total * 100) / 100, hasTable: Boolean(header) }
}
