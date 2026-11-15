import { h, Fragment } from './react.js'

/**
 * Small, safe Markdown renderer for creative documents (no innerHTML). Covers
 * headings, paragraphs, lists, quotes, code fences, rules and pipe tables.
 * `rowClass(cells, header)` lets callers highlight table rows (分镜缺标签).
 */
export function Markdown({ text, rowClass }) {
  const blocks = parseBlocks(String(text || ''))
  return <div className="dmw-doc">{blocks.map((block, i) => renderBlock(block, i, rowClass))}</div>
}

function parseBlocks(text) {
  const lines = text.replace(/\r\n/g, '\n').split('\n')
  const blocks = []
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    if (/^\s*```/.test(line)) {
      const body = []
      i++
      while (i < lines.length && !/^\s*```/.test(lines[i])) body.push(lines[i++])
      i++
      blocks.push({ type: 'code', text: body.join('\n') })
      continue
    }
    if (!line.trim()) { i++; continue }
    const heading = line.match(/^(#{1,6})\s+(.*)$/)
    if (heading) { blocks.push({ type: 'h', level: Math.min(3, heading[1].length), text: heading[2] }); i++; continue }
    if (/^\s*(-{3,}|\*{3,})\s*$/.test(line)) { blocks.push({ type: 'hr' }); i++; continue }
    if (/^\s*\|/.test(line)) {
      const rows = []
      while (i < lines.length && /^\s*\|/.test(lines[i])) rows.push(lines[i++])
      blocks.push({ type: 'table', rows: rows.map(splitRow).filter((cells) => !cells.every((c) => /^:?-{2,}:?$/.test(c) || c === '')) })
      continue
    }
    if (/^\s*>/.test(line)) {
      const body = []
      while (i < lines.length && /^\s*>/.test(lines[i])) body.push(lines[i++].replace(/^\s*>\s?/, ''))
      blocks.push({ type: 'quote', text: body.join('\n') })
      continue
    }
    if (/^\s*([-*+]|\d+[.)])\s+/.test(line)) {
      const ordered = /^\s*\d+[.)]/.test(line)
      const items = []
      while (i < lines.length && /^\s*([-*+]|\d+[.)])\s+/.test(lines[i])) items.push(lines[i++].replace(/^\s*([-*+]|\d+[.)])\s+/, ''))
      blocks.push({ type: 'list', ordered, items })
      continue
    }
    const body = []
    while (i < lines.length && lines[i].trim() && !/^(#{1,6}\s|\s*\||\s*```|\s*>|\s*([-*+]|\d+[.)])\s+)/.test(lines[i])) body.push(lines[i++])
    blocks.push({ type: 'p', lines: body })
  }
  return blocks
}

function splitRow(line) {
  return line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim())
}

function renderBlock(block, key, rowClass) {
  switch (block.type) {
    case 'h': return h(`h${block.level}`, { key }, inline(block.text))
    case 'hr': return <hr key={key} />
    case 'code': return <pre key={key}><code>{block.text}</code></pre>
    case 'quote': return <blockquote key={key}>{block.text.split('\n').map((l, i) => <Fragment key={i}>{i ? <br /> : null}{inline(l)}</Fragment>)}</blockquote>
    case 'list': return h(block.ordered ? 'ol' : 'ul', { key }, block.items.map((item, i) => <li key={i}>{inline(item)}</li>))
    case 'table': {
      const [head, ...rows] = block.rows
      if (!head) return null
      return (
        <div className="dmw-tablewrap" key={key}>
          <table className="dmw-table">
            <thead><tr>{head.map((c, i) => <th key={i}>{inline(c)}</th>)}</tr></thead>
            <tbody>{rows.map((cells, r) => <tr key={r} className={rowClass ? rowClass(cells, head) || undefined : undefined}>{head.map((_, c) => <td key={c}>{inline(cells[c] || '')}</td>)}</tr>)}</tbody>
          </table>
        </div>
      )
    }
    default: return <p key={key}>{block.lines.map((l, i) => <Fragment key={i}>{i ? <br /> : null}{inline(l)}</Fragment>)}</p>
  }
}

/** Inline: **bold**, *em*, `code`, [text](url) (rendered as text — links never navigate inside the app). */
export function inline(text) {
  const out = []
  const pattern = /(\*\*([^*]+)\*\*|`([^`]+)`|\[([^\]]+)\]\(([^)]+)\)|\*([^*\s][^*]*)\*)/g
  let last = 0
  let match
  let k = 0
  while ((match = pattern.exec(text))) {
    if (match.index > last) out.push(text.slice(last, match.index))
    if (match[2]) out.push(<strong key={k++}>{match[2]}</strong>)
    else if (match[3]) out.push(<code key={k++}>{match[3]}</code>)
    else if (match[4]) out.push(<span key={k++} title={match[5]} style={{ textDecoration: 'underline dotted' }}>{match[4]}</span>)
    else if (match[6]) out.push(<em key={k++}>{match[6]}</em>)
    last = match.index + match[0].length
  }
  if (last < text.length) out.push(text.slice(last))
  return out
}
