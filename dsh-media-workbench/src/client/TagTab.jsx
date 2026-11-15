import { h, Fragment, useState, useEffect, useRef } from './react.js'
import { get, post } from './api.js'
import { Confirm, Modal } from './ui.jsx'
import { ClipGrid } from './MaterialTab.jsx'
import { DocView } from './CreativeTab.jsx'

const BASE_DIMS = ['场景', '主体', '景别', '运镜', '情绪', '用途']
const OPS = { add: '新增', rename: '改名', merge: '合并', delete: '删除', move: '移动维度', approve: '转正', reject: '驳回' }

/** Prompts the tag tab hands to the AI conversation. */
export const TAG_PROMPTS = {
  footage: '看一下这个项目的素材（已切片就看切片，否则看原片），帮我建议一批标签：只放进待审区，每个标签给出建议维度，并说明理由',
  script: '根据主题简报、文案和分镜，补充剪辑需要的标签：字典里没有的放进待审区，并给出建议维度',
  tidy: '检查标签字典里意思相近或重复的标签，给我一个合并 / 改名的建议清单，先不要直接改',
  tagClips: '给未打标的切片打标：先抽关键帧，看图后只从标签字典里选'
}

/**
 * The 标签 tab: template (switch / edit / save as), the project dictionary by
 * dimension, AI suggestions waiting for approval, and clips per tag. Tags are
 * stored in the project's hidden .dsh/tags folder, not in a visible folder.
 */
export function TagTab({ overview, projectId, notify, ask, onReveal }) {
  const tags = overview.material.tags
  const templates = overview.templates || []
  const [selected, setSelected] = useState(null)
  const [dialog, setDialog] = useState(null)
  const [switching, setSwitching] = useState(null)
  const [editor, setEditor] = useState(null)
  const [saveAs, setSaveAs] = useState(false)
  const [showFile, setShowFile] = useState(false)
  const current = templates.find((t) => t.key === tags.inherit)
  const dims = tags.dims
  const allTags = dims.flatMap((d) => d.tags.map((t) => ({ ...t, dim: d.dim })))
  const selectedInfo = selected ? allTags.find((t) => t.tag === selected) : null
  useEffect(() => { if (selected && !selectedInfo) setSelected(null) }, [selected, selectedInfo])
  const detailRef = useRef(null)
  useEffect(() => { if (selected) detailRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'nearest' }) }, [selected])

  const runOp = async (body, message) => {
    try {
      const r = await post('/tags/op', { project: projectId, ...body })
      notify(message || `${r.summary}${r.clips ? `，更新 ${r.clips} 条切片` : ''}`)
      return r
    } catch (e) { notify(e.message); return null }
  }
  const previewSwitch = async (key) => {
    if (!key || key === tags.inherit) return
    try {
      const preview = await post('/templates/switch', { project: projectId, key })
      setSwitching({ key, ...preview })
    } catch (e) { notify(e.message) }
  }
  const pending = tags.pending
  const approveAll = () => setDialog({ kind: 'bulk', ops: pending.map((p) => ({ op: 'approve', tag: p.tag, dim: p.suggestedDim && dims.some((d) => d.dim === p.suggestedDim) ? p.suggestedDim : '场景' })), label: `把 ${pending.length} 个待审标签按建议维度全部转正` })
  const rejectAll = () => setDialog({ kind: 'bulk', ops: pending.map((p) => ({ op: 'reject', tag: p.tag })), label: `驳回全部 ${pending.length} 个待审标签` })

  return (
    <Fragment>
      <div className="dmw-sec dmw-box dmw-tplbar">
        <div className="dmw-tplbar-main">
          <span className="dmw-muted">标签模板</span>
          <select aria-label="切换标签模板" value={tags.inherit || ''} onChange={(e) => previewSwitch(e.target.value)}>
            {!current ? <option value={tags.inherit || ''}>{tags.inherit ? `${tags.inheritLabel}（模板已不存在）` : '未选择'}</option> : null}
            {templates.map((t) => <option key={t.key} value={t.key}>{t.label}{t.builtin ? '' : '（我的模板）'}</option>)}
          </select>
          <button type="button" className="dmw-btn sm" onClick={() => setEditor({ key: tags.inherit })} disabled={!current}>编辑模板</button>
          <button type="button" className="dmw-btn sm" onClick={() => setSaveAs(true)}>另存为模板</button>
          <span className="dmw-muted dmw-tplbar-stat">共 {tags.totalTags} 个标签 · {tags.clips} 条切片{pending.length ? ` · 待审 ${pending.length}` : ''}</span>
        </div>
        {tags.templateMissing ? <div className="dmw-banner warn" style={{ margin: '8px 0 0' }}>这个项目继承的模板「{tags.inheritLabel}」已被删除，模板里的标签不可用了。请换一个模板。</div> : null}
        <div className="dmw-muted" style={{ marginTop: 6 }}>模板里的标签（浅色）所有用这个模板的项目共用；在这里新增的是本项目自己的标签（深色）。打标和匹配只用这些词。</div>
      </div>

      <div className="dmw-sec dmw-box dmw-aibox">
        <h3 className="dmw-h3">让 AI 生成标签 <span className="sub">· 在右侧对话里进行，建议的新标签会先进「待审」，由你转正</span></h3>
        <div className="dmw-actions">
          <button type="button" className="dmw-btn pri" onClick={() => ask(TAG_PROMPTS.footage)}>根据素材建议标签</button>
          <button type="button" className="dmw-btn" onClick={() => ask(TAG_PROMPTS.script)}>根据文案和分镜补标签</button>
          <button type="button" className="dmw-btn" onClick={() => ask(TAG_PROMPTS.tidy)}>整理相近的标签</button>
          <button type="button" className="dmw-btn ghost" disabled={!tags.clips} title={tags.clips ? undefined : '先在素材页导入、清洗、切片'} onClick={() => ask(TAG_PROMPTS.tagClips)}>给切片打标</button>
        </div>
        {!overview.material.report.imported ? <div className="dmw-muted" style={{ marginTop: 8 }}>还没有导入素材。AI 会先导入「原始素材库」里的视频再看图；也可以先去素材页导入。</div> : null}
      </div>

      {pending.length ? (
        <div className="dmw-sec dmw-box dmw-pendbox">
          <h3 className="dmw-h3">待审 <span className="sub">· AI 建议的新标签，转正后才参与打标和匹配</span>
            <span className="right"><button type="button" className="dmw-btn sm pri" onClick={approveAll}>全部转正</button><button type="button" className="dmw-btn sm" onClick={rejectAll}>全部驳回</button></span></h3>
          <div className="dmw-pendlist">
            {pending.map((p) => <PendingRow key={p.tag} item={p} dims={dims} onApprove={(dim) => runOp({ op: 'approve', tag: p.tag, dim })} onReject={() => runOp({ op: 'reject', tag: p.tag })} />)}
          </div>
        </div>
      ) : null}

      <div className="dmw-sec dmw-box">
        <h3 className="dmw-h3">标签字典 <span className="sub">· 点标签查看用到它的切片和更多操作 · 数字为切片数</span>
          <span className="right"><button type="button" className="dmw-btn sm" onClick={() => setDialog({ kind: 'dim' })}>＋ 新增维度</button></span></h3>
        {!tags.exists ? <div className="dmw-banner warn">还没有标签字典。选一个标签模板，或点上面的「根据素材建议标签」。</div> : null}
        {dims.map((dim) => (
          <DimRow key={dim.dim} dim={dim} selected={selected} onSelect={(tag) => setSelected(selected === tag ? null : tag)}
            onAdd={(tag) => runOp({ op: 'add', tag, dim: dim.dim }, `已在【${dim.dim}】新增「${tag}」`)}
            onDeleteDim={!dim.base && !dim.tags.length ? () => runOp({ op: 'delete-dim', dim: dim.dim }) : null} />
        ))}
      </div>

      {selectedInfo ? (
        <div className="dmw-sec dmw-box dmw-tagdetail" aria-live="polite" ref={detailRef}>
          <h3 className="dmw-h3">「{selectedInfo.tag}」<span className="sub">· {selectedInfo.dim} · {selectedInfo.fromTemplate ? `来自模板「${tags.inheritLabel}」` : '本项目标签'} · {selectedInfo.count} 条切片</span>
            <span className="right">
              <button type="button" className="dmw-btn sm" onClick={() => setDialog({ kind: 'op', op: 'rename', tag: selectedInfo.tag })}>改名</button>
              <button type="button" className="dmw-btn sm" onClick={() => setDialog({ kind: 'op', op: 'merge', tag: selectedInfo.tag })}>合并到…</button>
              {!selectedInfo.fromTemplate ? <button type="button" className="dmw-btn sm" onClick={() => setDialog({ kind: 'op', op: 'move', tag: selectedInfo.tag, dim: selectedInfo.dim })}>移到维度…</button> : null}
              {!selectedInfo.fromTemplate ? <button type="button" className="dmw-btn sm danger" onClick={() => setDialog({ kind: 'op', op: 'delete', tag: selectedInfo.tag })}>删除</button>
                : <button type="button" className="dmw-btn sm" onClick={() => setEditor({ key: tags.inherit, focus: selectedInfo.tag })}>在模板里修改</button>}
              <button type="button" className="dmw-btn sm ghost" onClick={() => setSelected(null)}>关闭</button>
            </span></h3>
          {selectedInfo.count ? <ClipGrid projectId={projectId} filter={{ kind: 'tag', tag: selectedInfo.tag }} setFilter={() => setSelected(null)} revision={overview.revision} dims={dims} notify={notify} total={selectedInfo.count} embedded />
            : <div className="dmw-muted">还没有切片用到这个标签。</div>}
        </div>
      ) : null}

      <div className="dmw-sec">
        <button type="button" className="dmw-link" onClick={() => setShowFile(!showFile)}>{showFile ? '收起字典文件' : '查看字典文件与历史版本'}</button>
        {showFile ? <div className="dmw-box" style={{ marginTop: 8 }}><DocView docKey="标签字典.yaml" overview={overview} projectId={projectId} notify={notify} ask={ask} onReveal={onReveal} /></div> : null}
      </div>

      {dialog?.kind === 'op' ? <TagOpDialog projectId={projectId} initial={dialog} dims={dims} onClose={() => setDialog(null)} notify={notify} onDone={(op, to) => setSelected(op === 'delete' || op === 'merge' ? (op === 'merge' ? to : null) : op === 'rename' ? to : selected)} /> : null}
      {dialog?.kind === 'dim' ? <NewDimDialog onClose={() => setDialog(null)} onSubmit={async (name) => { if (await runOp({ op: 'add-dim', dim: name })) setDialog(null) }} /> : null}
      {dialog?.kind === 'bulk' ? <BulkConfirm projectId={projectId} ops={dialog.ops} label={dialog.label} notify={notify} onClose={() => setDialog(null)} /> : null}
      {switching ? <Confirm title="更换标签模板" confirmLabel="更换"
        impact={`把模板从「${switching.from}」换成「${switching.to}」：新增 ${switching.added.length} 个模板标签，去掉 ${switching.dropped.length} 个旧模板里没人用的标签${switching.kept.length ? `；切片已经在用的 ${switching.kept.length} 个旧模板标签（${switching.kept.slice(0, 6).join('、')}${switching.kept.length > 6 ? '…' : ''}）会保留为本项目标签` : ''}。项目自己的标签和待审不变，字典旧版本自动留档。`}
        onConfirm={async () => { await post('/templates/switch', { project: projectId, key: switching.key, apply: true }); notify(`已改用模板「${switching.to}」`) }}
        onClose={() => setSwitching(null)} /> : null}
      {editor ? <TemplateEditor initialKey={editor.key} focus={editor.focus} currentKey={tags.inherit} notify={notify} onClose={() => setEditor(null)} /> : null}
      {saveAs ? <SaveAsDialog projectId={projectId} notify={notify} onClose={() => setSaveAs(false)} /> : null}
    </Fragment>
  )
}

function PendingRow({ item, dims, onApprove, onReject }) {
  const fallback = item.suggestedDim && dims.some((d) => d.dim === item.suggestedDim) ? item.suggestedDim : '场景'
  const [dim, setDim] = useState(fallback)
  useEffect(() => { setDim(fallback) }, [fallback])
  return (
    <div className="dmw-pendrow">
      <span className="dmw-tag pending static">{item.tag}{item.count ? <i>{item.count}</i> : null}</span>
      <select aria-label={`「${item.tag}」转正到哪个维度`} value={dim} onChange={(e) => setDim(e.target.value)}>
        {dims.map((d) => <option key={d.dim} value={d.dim}>{d.dim}</option>)}
      </select>
      <button type="button" className="dmw-btn sm pri" onClick={() => onApprove(dim)}>转正</button>
      <button type="button" className="dmw-btn sm" onClick={onReject}>驳回</button>
    </div>
  )
}

function DimRow({ dim, selected, onSelect, onAdd, onDeleteDim }) {
  const [adding, setAdding] = useState(false)
  const [value, setValue] = useState('')
  const input = useRef(null)
  useEffect(() => { if (adding) input.current?.focus() }, [adding])
  const submit = async () => {
    const tag = value.trim()
    if (!tag) { setAdding(false); return }
    await onAdd(tag)
    setValue('')
    input.current?.focus()
  }
  return (
    <div className="dmw-tagdim dmw-dimrow">
      <div className="dn">{dim.dim}{dim.base ? '' : <span className="dmw-mini">自定义</span>}{onDeleteDim ? <button type="button" className="dmw-link" onClick={onDeleteDim}>删除维度</button> : null}</div>
      <div>
        {dim.tags.map((t) => (
          <button type="button" key={t.tag} className={`dmw-tag${t.fromTemplate ? ' tpl' : ''}${t.count ? '' : ' zero'}`} aria-pressed={selected === t.tag}
            title={t.fromTemplate ? '来自模板' : '本项目标签'} onClick={() => onSelect(t.tag)}>{t.tag}<i>{t.count}</i></button>
        ))}
        {adding ? (
          <span className="dmw-tagadd">
            <input ref={input} value={value} aria-label={`在【${dim.dim}】新增标签`} placeholder="输入标签，回车添加" maxLength={30}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); submit() } if (e.key === 'Escape') { setAdding(false); setValue('') } }}
              onBlur={() => { if (!value.trim()) setAdding(false) }} />
          </span>
        ) : <button type="button" className="dmw-tag add" onClick={() => setAdding(true)} aria-label={`在【${dim.dim}】新增标签`}>＋</button>}
      </div>
    </div>
  )
}

function useImpact(projectId, body, ready) {
  const [impact, setImpact] = useState(null)
  const [error, setError] = useState(null)
  const timer = useRef(null)
  const key = JSON.stringify(body)
  useEffect(() => {
    clearTimeout(timer.current)
    setImpact(null)
    setError(null)
    if (!ready) return
    timer.current = setTimeout(() => {
      get('/tags/impact', { project: projectId, ...body }).then(setImpact).catch((e) => setError(e.message))
    }, 250)
    return () => clearTimeout(timer.current)
  }, [key, ready])
  return [impact, error, setError]
}

function TagOpDialog({ projectId, initial, dims, onClose, notify, onDone }) {
  const op = initial.op
  const tag = initial.tag
  const [to, setTo] = useState('')
  const [dim, setDim] = useState(initial.dim || dims[0]?.dim || '场景')
  const [busy, setBusy] = useState(false)
  const allTags = dims.flatMap((d) => d.tags.map((t) => t.tag))
  const body = { op, tag, to, dim }
  const ready = op === 'delete' || (op === 'move' && dim !== initial.dim) || (['rename', 'merge'].includes(op) && to)
  const [impact, error, setError] = useImpact(projectId, body, ready)
  const submit = async () => {
    setBusy(true)
    try {
      const r = await post('/tags/op', { project: projectId, ...body })
      notify(`${r.summary}${r.clips ? `，更新 ${r.clips} 条切片` : ''}`)
      onDone?.(op, to)
      onClose()
    } catch (e) { setError(e.message); setBusy(false) }
  }
  return (
    <Modal title={`${OPS[op]}「${tag}」`} onClose={onClose} busy={busy} footer={<Fragment>
      <button type="button" className="dmw-btn" onClick={onClose} disabled={busy}>取消</button>
      <button type="button" className={`dmw-btn pri${op === 'delete' ? ' danger' : ''}`} onClick={submit} disabled={busy || !impact}>确认{OPS[op]}</button>
    </Fragment>}>
      <div className="dmw-form">
        {op === 'rename' ? <Fragment><label htmlFor="dmw-tag-to">改为</label><input id="dmw-tag-to" value={to} onChange={(e) => setTo(e.target.value.trim())} maxLength={30} /></Fragment> : null}
        {op === 'merge' ? <Fragment><label htmlFor="dmw-tag-to">合并到</label><select id="dmw-tag-to" value={to} onChange={(e) => setTo(e.target.value)}><option value="">选择目标标签…</option>{allTags.filter((t) => t !== tag).map((t) => <option key={t}>{t}</option>)}</select></Fragment> : null}
        {op === 'move' ? <Fragment><label htmlFor="dmw-tag-dim">移到维度</label><select id="dmw-tag-dim" value={dim} onChange={(e) => setDim(e.target.value)}>{dims.map((d) => <option key={d.dim}>{d.dim}</option>)}</select></Fragment> : null}
        {op === 'delete' ? <div className="full">从标签字典删除「{tag}」，所有切片上的这个标签也会去掉。</div> : null}
      </div>
      <div className="dmw-banner info" style={{ marginTop: 12, marginBottom: 0 }} aria-live="polite">
        {error ? <span className="dmw-bad">{error}</span> : impact ? `${impact.summary}：影响 ${impact.clips} 条切片${impact.eagle ? `，其中 ${impact.eagle} 条会标记为待同步 Eagle` : ''}。字典旧版本自动留档，可在「查看字典文件与历史版本」里回滚。` : ready ? '计算影响范围…' : '填写后显示影响范围'}
      </div>
    </Modal>
  )
}

function BulkConfirm({ projectId, ops, label, notify, onClose }) {
  return (
    <Confirm title="批量处理待审标签" confirmLabel="确认" impact={`${label}。转正后这些词才会用于打标和匹配；字典旧版本自动留档。`}
      onConfirm={async () => { const r = await post('/tags/op', { project: projectId, ops }); notify(`${r.summary}${r.clips ? `，更新 ${r.clips} 条切片` : ''}`) }}
      onClose={onClose} />
  )
}

function NewDimDialog({ onClose, onSubmit }) {
  const [name, setName] = useState('')
  return (
    <Modal title="新增维度" onClose={onClose} footer={<Fragment>
      <button type="button" className="dmw-btn" onClick={onClose}>取消</button>
      <button type="button" className="dmw-btn pri" disabled={!name.trim()} onClick={() => onSubmit(name.trim())}>新增</button>
    </Fragment>}>
      <div className="dmw-form">
        <label htmlFor="dmw-dim-name">维度名称</label>
        <input id="dmw-dim-name" value={name} maxLength={20} onChange={(e) => setName(e.target.value)} placeholder="例如：产品部件、光线、色调" onKeyDown={(e) => { if (e.key === 'Enter' && name.trim()) onSubmit(name.trim()) }} />
        <div className="full dmw-muted">维度用来给标签分组，比如产品广告可以加「产品部件」「光线」「色调」。只加在本项目；想让以后的项目也有，用「另存为模板」或在「编辑模板」里加。</div>
      </div>
    </Modal>
  )
}

function SaveAsDialog({ projectId, notify, onClose }) {
  const [label, setLabel] = useState('')
  const [use, setUse] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const submit = async () => {
    setBusy(true)
    try {
      const r = await post('/templates/create', { label: label.trim(), fromProject: projectId, use })
      notify(`已保存模板「${r.template.label}」${r.switched ? '，本项目改用它' : ''}`)
      onClose()
    } catch (e) { setError(e.message); setBusy(false) }
  }
  return (
    <Modal title="另存为标签模板" onClose={onClose} busy={busy} footer={<Fragment>
      <button type="button" className="dmw-btn" onClick={onClose} disabled={busy}>取消</button>
      <button type="button" className="dmw-btn pri" disabled={busy || !label.trim()} onClick={submit}>保存模板</button>
    </Fragment>}>
      <div className="dmw-form">
        <label htmlFor="dmw-tpl-name">模板名称</label>
        <input id="dmw-tpl-name" value={label} maxLength={40} onChange={(e) => setLabel(e.target.value)} placeholder="例如：家电广告、美妆产品" />
        <span />
        <label className="dmw-check"><input type="checkbox" checked={use} onChange={(e) => setUse(e.target.checked)} /> 本项目改用这个新模板</label>
        <div className="full dmw-muted">把本项目现在的全部标签（模板 + 项目自己的，不含待审）存成一个新模板。以后新建项目时可以直接选它，也能在「编辑模板」里继续改。</div>
      </div>
      {error ? <div className="dmw-banner bad" role="alert" style={{ marginTop: 10, marginBottom: 0 }}>{error}</div> : null}
    </Modal>
  )
}

/** Edit a global template: label, dimensions and tags. Delete (custom) or reset (built-in). */
function TemplateEditor({ initialKey, focus, currentKey, notify, onClose }) {
  const [list, setList] = useState(null)
  const [key, setKey] = useState(initialKey)
  const [draft, setDraft] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [confirm, setConfirm] = useState(null)
  const [newDim, setNewDim] = useState('')
  const load = async (k = key) => {
    try {
      const { templates } = await get('/templates')
      setList(templates)
      const t = templates.find((x) => x.key === k) || templates[0]
      setKey(t.key)
      setDraft({ label: t.label, dims: Object.entries(t.dims).map(([dim, tags]) => ({ dim, tags: [...tags] })) })
      setError(null)
    } catch (e) { setError(e.message) }
  }
  useEffect(() => { load(initialKey) }, [])
  const template = list?.find((t) => t.key === key)
  const original = template ? JSON.stringify({ label: template.label, dims: template.dims }) : ''
  const dimsObject = draft ? Object.fromEntries(draft.dims.map((d) => [d.dim, d.tags])) : {}
  const dirty = draft && JSON.stringify({ label: draft.label, dims: dimsObject }) !== original
  const removed = template && draft ? Object.values(template.dims).flat().filter((t) => !Object.values(dimsObject).flat().includes(t)) : []
  const update = (fn) => setDraft((d) => { const next = { label: d.label, dims: d.dims.map((x) => ({ dim: x.dim, tags: [...x.tags] })) }; fn(next); return next })
  const allDraftTags = new Set(draft ? draft.dims.flatMap((d) => d.tags) : [])
  const save = async () => {
    setBusy(true)
    try {
      const r = await post('/templates/save', { key, label: draft.label, dims: dimsObject })
      const kept = r.preserved || []
      notify(`模板「${r.template.label}」已保存${kept.length ? `；${kept.map((p) => `「${p.project}」保留了 ${p.tags.length} 个切片在用的标签`).join('，')}` : ''}`)
      await load(key)
    } catch (e) { setError(e.message) }
    setBusy(false)
  }
  const switchTo = (k) => {
    if (dirty && !window.confirm?.('当前模板的修改还没保存，要放弃吗？')) return
    load(k)
  }
  return (
    <Modal title="编辑标签模板" wide onClose={onClose} busy={busy} footer={<Fragment>
      {template && !template.builtin ? <button type="button" className="dmw-btn danger" style={{ marginRight: 'auto' }} disabled={busy} onClick={() => setConfirm('remove')}>删除模板</button> : null}
      {template?.builtin && template.edited ? <button type="button" className="dmw-btn" style={{ marginRight: 'auto' }} disabled={busy} onClick={() => setConfirm('reset')}>恢复默认</button> : null}
      <button type="button" className="dmw-btn" onClick={onClose} disabled={busy}>关闭</button>
      <button type="button" className="dmw-btn pri" disabled={busy || !dirty || !draft?.label.trim()} onClick={save}>保存模板</button>
    </Fragment>}>
      {!draft ? (error ? <div className="dmw-banner bad">{error}</div> : <div className="dmw-muted">读取模板…</div>) : (
        <div className="dmw-tpleditor">
          <div className="dmw-form">
            <label htmlFor="dmw-tpl-pick">模板</label>
            <select id="dmw-tpl-pick" value={key} onChange={(e) => switchTo(e.target.value)}>
              {list.map((t) => <option key={t.key} value={t.key}>{t.label}{t.builtin ? '（内置）' : ''}{t.key === currentKey ? ' · 本项目在用' : ''}</option>)}
            </select>
            <label htmlFor="dmw-tpl-label">名称</label>
            <input id="dmw-tpl-label" value={draft.label} maxLength={40} onChange={(e) => update((d) => { d.label = e.target.value })} />
          </div>
          <div className="dmw-muted" style={{ margin: '10px 0' }}>改模板会影响所有使用「{template?.label}」的项目和以后新建的项目。删掉的标签如果有项目的切片在用，会自动保留为那个项目自己的标签，不会从切片上消失。</div>
          {draft.dims.map((d, i) => (
            <div key={d.dim} className="dmw-tagdim dmw-dimrow">
              <div className="dn">{d.dim}{!BASE_DIMS.includes(d.dim) ? <button type="button" className="dmw-link" onClick={() => update((x) => { x.dims.splice(i, 1) })}>删除维度</button> : null}</div>
              <div>
                {d.tags.map((t, j) => (
                  <span key={t} className={`dmw-tag static${focus === t ? ' focus' : ''}`}>{t}
                    <button type="button" className="x" aria-label={`从模板删除「${t}」`} onClick={() => update((x) => { x.dims[i].tags.splice(j, 1) })}>×</button></span>
                ))}
                <TemplateTagInput dim={d.dim} exists={(t) => allDraftTags.has(t)} onAdd={(t) => update((x) => { x.dims[i].tags.push(t) })} />
              </div>
            </div>
          ))}
          <div className="dmw-actions" style={{ marginTop: 6 }}>
            <input aria-label="新维度名称" value={newDim} maxLength={20} placeholder="新维度名称，如 光线" onChange={(e) => setNewDim(e.target.value)} />
            <button type="button" className="dmw-btn sm" disabled={!newDim.trim() || draft.dims.some((d) => d.dim === newDim.trim()) || ['继承', '待审'].includes(newDim.trim())}
              onClick={() => { update((x) => { x.dims.push({ dim: newDim.trim(), tags: [] }) }); setNewDim('') }}>＋ 新增维度</button>
          </div>
          {removed.length ? <div className="dmw-banner warn" style={{ marginTop: 10, marginBottom: 0 }}>将从模板删除：{removed.join('、')}</div> : null}
          {error ? <div className="dmw-banner bad" role="alert" style={{ marginTop: 10, marginBottom: 0 }}>{error}</div> : null}
        </div>
      )}
      {confirm === 'remove' ? <Confirm title="删除模板" danger confirmLabel="删除" impact={`删除模板「${template.label}」。只有没有项目在用时才能删除。`}
        onConfirm={async () => { await post('/templates/remove', { key }); notify(`已删除模板「${template.label}」`); await load(currentKey) }} onClose={() => setConfirm(null)} /> : null}
      {confirm === 'reset' ? <Confirm title="恢复默认" confirmLabel="恢复默认" impact={`把内置模板「${template.label}」恢复成出厂内容，你对它的修改会丢弃（切片在用的标签会保留在各自项目里）。`}
        onConfirm={async () => { await post('/templates/reset', { key }); notify('已恢复默认'); await load(key) }} onClose={() => setConfirm(null)} /> : null}
    </Modal>
  )
}

function TemplateTagInput({ dim, exists, onAdd }) {
  const [value, setValue] = useState('')
  const [warn, setWarn] = useState(null)
  const add = () => {
    const tag = value.trim()
    if (!tag) return
    if (exists(tag)) { setWarn(`「${tag}」已在模板里`); return }
    onAdd(tag)
    setValue('')
    setWarn(null)
  }
  return (
    <span className="dmw-tagadd">
      <input value={value} maxLength={30} aria-label={`给模板的【${dim}】新增标签`} placeholder="＋ 标签，回车" onChange={(e) => { setValue(e.target.value); setWarn(null) }}
        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add() } }} />
      {warn ? <span className="dmw-warn" style={{ marginLeft: 6 }}>{warn}</span> : null}
    </span>
  )
}
