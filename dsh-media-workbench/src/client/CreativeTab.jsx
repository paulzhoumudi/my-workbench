import { h, Fragment, useState, useEffect, useMemo } from './react.js'
import { get, post, clock, storage, fileUrl } from './api.js'
import { ProjectTree } from './ProjectTree.jsx'
import { Markdown } from './markdown.jsx'
import { Empty, Confirm } from './ui.jsx'

const SOURCE = { chat: '由对话生成', external: '外部修改', manual: '手动创建', rollback: '回滚', system: '系统生成', 'tags-op': '标签操作', tagger: '打标' }
const ASK = {
  '00_主题简报.md': '帮我完善主题简报：平台、目标时长、受众、基调和拍摄安排',
  '01_创意方向.md': '给我 3 个创意方向，说明各自的看点和适合的平台',
  '02_文案.md': '根据选定的创意方向生成文案，控制在目标时长内',
  '03_分镜脚本.md': '根据文案出分镜脚本，每镜都要写所需标签',
  '标签字典.yaml': '看一下这个项目的素材，帮我建议一批标签：只放进待审区，每个标签给出建议维度',
  '剪辑思路.md': '根据文案和分镜写剪辑思路：节奏、BGM 与 BPM、转场、配音'
}

export function CreativeTab({ overview, projectId, notify, ask, onReveal, workingLibrary, switching, onLibrary }) {
  const docs = overview.creative.docs
  const [selection, setSelection] = useState(() => {
    const saved = storage.get(`sel:${projectId}`, null)
    // Tags moved to the 标签 tab (0.1.4): a remembered 标签管理 selection falls back to the script.
    const stale = !saved || typeof saved.path !== 'string' || saved.doc === '标签字典.yaml' || saved.path.startsWith('标签管理/') || saved.path.startsWith('.dsh/')
    return stale ? { path: '创意剪辑/02_文案.md', doc: '02_文案.md' } : saved
  })
  useEffect(() => { storage.set(`sel:${projectId}`, selection) }, [selection, projectId])
  return (
    <div className="dmw-split">
      <ProjectTree projectId={projectId} revision={overview.revision} docs={docs} libraries={overview.libraries || []}
        selectedPath={selection.path} workingLibrary={workingLibrary} switching={switching} onLibrary={onLibrary}
        onSelect={(item) => setSelection({ path: item.path, doc: item.doc || null })} />
      {selection.doc
        ? <DocView key={selection.doc} docKey={selection.doc} overview={overview} projectId={projectId} notify={notify} ask={ask} onReveal={onReveal} />
        : <FileView key={selection.path} path={selection.path} projectId={projectId} revision={overview.revision} onReveal={onReveal} />}
    </div>
  )
}

/** Any non-versioned file: text preview, image, video/audio, or file info. */
function FileView({ path, projectId, revision, onReveal }) {
  const [text, setText] = useState(null)
  const [error, setError] = useState(null)
  const ext = (path.match(/\.([^.]+)$/)?.[1] || '').toLowerCase()
  const kind = /^(md|txt|ya?ml|json|jsonl|srt|csv|log|xml|html?)$/.test(ext) ? 'text' : /^(jpe?g|png|gif|webp)$/.test(ext) ? 'image' : /^(mp4|mov|m4v|webm)$/.test(ext) ? 'video' : /^(mp3|wav|m4a|aac)$/.test(ext) ? 'audio' : 'other'
  useEffect(() => {
    if (kind !== 'text') return
    let cancelled = false
    get('/text', { project: projectId, path }).then((d) => { if (!cancelled) { setText(d); setError(null) } }).catch((e) => { if (!cancelled) setError(e.message) })
    return () => { cancelled = true }
  }, [path, revision])
  return (
    <section className="dmw-preview" aria-label="文件预览">
      <div className="dmw-bar">
        <span className="meta">{path}{kind === 'text' ? ' · 只读预览' : ''}{text?.truncated ? '（文件较大，只显示开头）' : ''}</span>
        <span className="acts"><button type="button" className="dmw-btn" onClick={() => onReveal(path)}>在文件夹中显示</button></span>
      </div>
      {error ? <div className="dmw-banner bad" role="alert">{error}</div> : null}
      {kind === 'text' ? (text ? (ext === 'md' ? <Markdown text={text.content} /> : <pre className="dmw-doc" style={{ whiteSpace: 'pre-wrap', fontSize: 12 }}>{prettyJson(ext, text.content)}</pre>) : !error ? <div className="dmw-muted">读取中…</div> : null)
        : kind === 'image' ? <img src={fileUrl(projectId, path)} alt={path} style={{ maxWidth: '100%', maxHeight: '70vh', borderRadius: 8, alignSelf: 'flex-start' }} />
        : kind === 'video' ? <video key={path} src={fileUrl(projectId, path)} controls style={{ width: '100%', maxHeight: '70vh', background: '#000', borderRadius: 8 }} />
        : kind === 'audio' ? <audio src={fileUrl(projectId, path)} controls />
        : <Empty title="这个文件不能在面板里预览">可以点「在文件夹中显示」用其他软件打开。{ext === 'mts' ? 'MTS 原片导入并切片后，可在「输出素材库/切片素材」里预览。' : ''}</Empty>}
    </section>
  )
}

function prettyJson(ext, content) {
  if (ext !== 'json') return content
  try { return JSON.stringify(JSON.parse(content), null, 2) } catch { return content }
}

/** Versioned creative document: preview, edit, history versions, diff, rollback, 剪辑使用版本. */
export function DocView({ docKey, overview, projectId, notify, ask, onReveal }) {
  const docs = overview.creative.docs
  const selected = docKey
  const [view, setView] = useState({ mode: 'read', ref: null })
  const [doc, setDoc] = useState(null)
  const [error, setError] = useState(null)
  const [draft, setDraft] = useState('')
  const [diff, setDiff] = useState(null)
  const [confirm, setConfirm] = useState(null)
  const entry = docs.find((d) => d.key === selected)
  const warnings = overview.storyboard?.warnings || []
  const warnNos = useMemo(() => new Set(warnings.map((w) => w.no)), [warnings])

  // Reload when the file version or revision changes (Agent wrote it).
  const signature = `${selected}|${view.ref}|${entry?.version}|${entry?.manualEdits}|${overview.revision}`
  useEffect(() => {
    let cancelled = false
    if (view.mode === 'edit') return
    setError(null)
    get('/doc', { project: projectId, file: selected, ref: view.ref || undefined }).then((d) => { if (!cancelled) setDoc(d) }).catch((e) => { if (!cancelled) setError(e.message) })
    return () => { cancelled = true }
  }, [signature, view.mode])

  useEffect(() => {
    if (view.mode !== 'diff') return
    let cancelled = false
    get('/doc/diff', { project: projectId, file: selected, from: view.ref }).then((d) => { if (!cancelled) setDiff(d) }).catch((e) => { if (!cancelled) setError(e.message) })
    return () => { cancelled = true }
  }, [view.mode, view.ref, selected, entry?.version, overview.revision])

  const open = (ref = null, mode = 'read') => { setView({ mode, ref }); setDiff(null) }
  const startEdit = () => { setDraft(doc?.content || ''); setView({ mode: 'edit', ref: null }) }
  const save = async () => {
    try {
      await post('/doc/save', { project: projectId, file: selected, content: draft, expectedHash: doc?.meta?.hash })
      setView({ mode: 'read', ref: null })
      notify('已保存（记为人工改动）')
    } catch (e) { setError(e.message) }
  }
  const setEditUse = async () => {
    try { await post('/doc/edit-use', { project: projectId, file: selected }); notify(`已把 ${selected} v${entry.version} 设为剪辑使用版本`) } catch (e) { notify(e.message) }
  }
  const previous = entry?.history?.find((h) => h.ref === `v${entry.version - 1}`) || entry?.history?.find((h) => !h.ref.includes('手改前')) || entry?.history?.[0]
  const isYaml = selected.endsWith('.yaml')

  const meta = () => {
    if (!entry?.exists) return `${entry?.path || selected} · 还没有内容`
    if (view.ref) return `${entry.path} · ${doc?.label || view.ref}（历史版本，只读）`
    const parts = [entry.path, `v${entry.version}`]
    if (entry.source) parts.push(`${SOURCE[entry.source] || entry.source}${entry.generatedAt ? `于 ${clock(entry.generatedAt)}` : ''}`)
    if (entry.model) parts.push(entry.model)
    if (entry.manualEdits) parts.push(`人工改动 ${entry.manualEdits} 处`)
    if (entry.note) parts.push(entry.note)
    return parts.join(' · ')
  }

  return (
    <Fragment>
      <section className="dmw-preview" aria-label="文件预览">
        <div className="dmw-bar">
          <span className="meta">{meta()}</span>
          <span className="acts">
            {view.mode === 'edit' ? <Fragment>
              <button type="button" className="dmw-btn" onClick={() => setView({ mode: 'read', ref: null })}>取消</button>
              <button type="button" className="dmw-btn pri" onClick={save}>保存</button>
            </Fragment> : view.ref ? <Fragment>
              <button type="button" className="dmw-btn" onClick={() => setView({ mode: view.mode === 'diff' ? 'read' : 'diff', ref: view.ref })}>{view.mode === 'diff' ? '查看全文' : '与当前对比'}</button>
              <button type="button" className="dmw-btn" onClick={() => setConfirm({ ref: view.ref })}>回滚到此版本</button>
              <button type="button" className="dmw-btn" onClick={() => open()}>回到当前版本</button>
            </Fragment> : entry?.exists ? <Fragment>
              {previous ? <button type="button" className="dmw-btn" onClick={() => setView({ mode: 'diff', ref: previous.ref })}>对比 {previous.label}</button> : null}
              {entry.history?.length ? (
                <select aria-label="历史版本" value="" onChange={(e) => e.target.value && open(e.target.value)}>
                  <option value="">历史版本（{entry.history.length}）</option>
                  {entry.history.map((item) => <option key={item.ref} value={item.ref}>{item.label}</option>)}
                </select>
              ) : null}
              <button type="button" className="dmw-btn" onClick={startEdit}>编辑</button>
              <button type="button" className="dmw-btn" onClick={() => onReveal(entry.path)}>在文件夹中显示</button>
              {['02_文案.md', '03_分镜脚本.md'].includes(selected) ? (
                entry.editUse === entry.version
                  ? <span className="dmw-chip ok">剪辑使用版本 v{entry.editUse}</span>
                  : <button type="button" className="dmw-btn pri" onClick={setEditUse}>{entry.editUse ? `设为剪辑使用版本（当前用 v${entry.editUse}）` : '设为剪辑使用版本'}</button>
              ) : null}
            </Fragment> : null}
          </span>
        </div>
        {selected === '03_分镜脚本.md' && !view.ref && warnings.length && view.mode === 'read' ? (
          <div className="dmw-banner warn" role="status">{warnings.length} 镜缺少「所需标签」或时长（已标黄），剪辑无法自动匹配：{warnings.map((w) => w.no).join('、')}</div>
        ) : null}
        {error ? <div className="dmw-banner bad" role="alert">{error}</div> : null}
        {view.mode === 'edit' ? (
          <textarea className="dmw-editor" aria-label={`编辑 ${selected}`} value={draft} onChange={(e) => setDraft(e.target.value)} spellCheck={false} />
        ) : view.mode === 'diff' ? (
          diff ? <div className="dmw-diff" role="region" aria-label={`对比 ${diff.from} → ${diff.to}`}>
            <div className="same dmw-muted">{diff.from} → {diff.to}</div>
            {diff.lines.map((line, i) => <div key={i} className={line.type}>{line.text || ' '}</div>)}
          </div> : <div className="dmw-muted">对比中…</div>
        ) : !entry?.exists && !view.ref ? (
          <Empty title={`还没有 ${selected}`} action={<button type="button" className="dmw-btn pri" onClick={() => ask(ASK[selected])}>让 AI 生成</button>}>
            在右侧对 AI 说「{ASK[selected]}」，生成后这里会自动刷新。也可以手动编写。
            <div style={{ marginTop: 8 }}><button type="button" className="dmw-btn" onClick={() => { setDraft(''); setView({ mode: 'edit', ref: null }) }}>手动编写</button></div>
          </Empty>
        ) : doc ? (
          isYaml ? <YamlView text={doc.content} /> : <Markdown text={doc.content} rowClass={selected === '03_分镜脚本.md' ? (cells, head) => {
            const col = head.findIndex((c) => c === '镜号')
            const no = (cells[col] || '').replace(/[^\dA-Za-z-]/g, '').padStart(2, '0')
            return warnNos.has(no) ? 'warn' : ''
          } : undefined} />
        ) : <div className="dmw-muted">读取中…</div>}
      </section>
      {confirm ? <Confirm impact={`把 ${selected} 回滚到 ${confirm.ref}。当前版本会先存入 _history，可以随时再改回来。`} confirmLabel="确认回滚"
        onConfirm={async () => { await post('/doc/rollback', { project: projectId, file: selected, ref: confirm.ref }); open(); notify('已回滚') }}
        onClose={() => setConfirm(null)} /> : null}
    </Fragment>
  )
}

function YamlView({ text }) {
  const lines = String(text || '').split('\n')
  const rows = []
  for (const line of lines) {
    const m = line.match(/^([^#:\s][^:]*):\s*\[(.*)\]\s*(#.*)?$/)
    if (m) rows.push({ key: m[1].trim(), tags: m[2].split(',').map((t) => t.trim().replace(/^["']|["']$/g, '')).filter(Boolean), note: m[3] })
  }
  const inherit = text.match(/^继承:\s*(.+)$/m)?.[1]
  return (
    <div className="dmw-doc">
      {inherit ? <p className="dmw-muted">继承标签模板：{inherit}（模板里的词不在这个文件里重复列出）</p> : null}
      {rows.map((row) => (
        <div key={row.key} className="dmw-tagdim">
          <div className="dn">{row.key}{row.key === '待审' ? '（AI 建议的新标签，在「标签」页转正或驳回）' : ''}</div>
          {row.tags.length ? row.tags.map((t) => <span key={t} className={`dmw-tag static${row.key === '待审' ? ' pending' : ''}`}>{t}</span>) : <span className="dmw-muted">（空）</span>}
        </div>
      ))}
      <details><summary className="dmw-muted" style={{ cursor: 'pointer' }}>查看 YAML 原文</summary><pre>{text}</pre></details>
    </div>
  )
}
