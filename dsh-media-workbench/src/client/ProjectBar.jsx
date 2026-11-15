import { h, Fragment, useState, useRef, useEffect } from './react.js'
import { post, get, timeAgo } from './api.js'
import { Modal, useDismiss } from './ui.jsx'
import { pickDirectory } from './host.js'

export function ProjectMenu({ projects, current, onSelect, onNew, onOpenFolder, onChanged, service, notify }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const ref = useRef(null)
  useDismiss(open, setOpen, ref)
  const list = projects.filter((p) => !query || p.name.toLowerCase().includes(query.toLowerCase()) || p.path.toLowerCase().includes(query.toLowerCase()))
  const relocate = async (p) => {
    try {
      const dir = await pickDirectory(service)
      if (!dir) return
      await post('/projects/relocate', { project: p.id, path: dir })
      onChanged()
      notify('已重新定位项目文件夹')
    } catch (error) { notify(error.message) }
  }
  const archive = async (p, archived) => {
    await post('/projects/patch', { project: p.id, archived }).catch((error) => notify(error.message))
    onChanged()
  }
  const remove = async (p) => {
    await post('/projects/remove', { project: p.id }).catch((error) => notify(error.message))
    onChanged()
    notify(`已把「${p.name}」移出列表（磁盘文件未删除）`)
  }
  return (
    <div className="dmw-dd" ref={ref} data-dsh-no-drag="">
      <button type="button" className="dmw-dd-btn" aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen(!open)}>
        <b>{current ? current.name : '选择项目'}</b>
        <span className="path" title={current?.path}>{current ? current.path : '新建或打开一个项目文件夹'}</span>
        <span aria-hidden="true">▾</span>
      </button>
      {open ? (
        <div className="dmw-menu" role="listbox" aria-label="项目">
          {projects.length > 4 ? <input className="search" aria-label="搜索项目" placeholder="搜索项目…" value={query} onChange={(e) => setQuery(e.target.value)} /> : null}
          {list.map((p) => (
            <div key={p.id} className={`dmw-mi${current?.id === p.id ? ' sel' : ''}`} role="option" aria-selected={current?.id === p.id} tabIndex={0}
              onClick={() => { if (!p.missing) { onSelect(p); setOpen(false) } }}
              onKeyDown={(e) => { if (e.key === 'Enter' && !p.missing) { onSelect(p); setOpen(false) } }}>
              <span className="name" title={p.path}>{p.name}</span>
              {p.missing
                ? <Fragment><small className="dmw-bad">路径失效</small><button type="button" className="dmw-link" onClick={(e) => { e.stopPropagation(); relocate(p) }}>重新定位</button></Fragment>
                : <small>{p.archived ? '已归档' : `素材 ${p.counts?.raws ?? 0} · 切片 ${p.counts?.clips ?? 0} · ${timeAgo(p.updatedAt || p.openedAt)}`}</small>}
              <ItemMenu items={[
                p.archived ? { label: '取消归档', run: () => archive(p, false) } : { label: '归档', run: () => archive(p, true) },
                { label: '移出列表（不删文件）', run: () => remove(p) }
              ]} />
            </div>
          ))}
          {!projects.length ? <div className="dmw-muted" style={{ padding: '6px 9px' }}>还没有项目</div> : null}
          <div className="dmw-sep" />
          <div className="dmw-mi act" role="option" aria-selected="false" tabIndex={0} onClick={() => { setOpen(false); onNew() }} onKeyDown={(e) => e.key === 'Enter' && (setOpen(false), onNew())}>＋ 新建项目（绑定本地文件夹）</div>
          <div className="dmw-mi act" role="option" aria-selected="false" tabIndex={0} onClick={() => { setOpen(false); onOpenFolder() }} onKeyDown={(e) => e.key === 'Enter' && (setOpen(false), onOpenFolder())}>📂 打开已有文件夹为项目</div>
        </div>
      ) : null}
    </div>
  )
}

function ItemMenu({ items }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useDismiss(open, setOpen, ref)
  return (
    <span ref={ref} style={{ position: 'relative' }} onClick={(e) => e.stopPropagation()}>
      <button type="button" className="dmw-iconbtn" aria-label="更多操作" aria-expanded={open} onClick={() => setOpen(!open)} style={{ width: 24, height: 24 }}>⋯</button>
      {open ? <div className="dmw-menu" style={{ left: 'auto', right: 0, width: 190 }}>{items.map((item) => <div key={item.label} className="dmw-mi" tabIndex={0} onClick={() => { setOpen(false); item.run() }} onKeyDown={(e) => e.key === 'Enter' && (setOpen(false), item.run())}>{item.label}</div>)}</div> : null}
    </span>
  )
}

/** FR-02 新建项目 / FR-03 打开已有文件夹. The folder always comes from the system picker. */
export function NewProjectDialog({ service, mode = 'new', onClose, onCreated }) {
  const [folder, setFolder] = useState('')
  const [name, setName] = useState('')
  const [template, setTemplate] = useState('vlog-base')
  const [templates, setTemplates] = useState(null)
  useEffect(() => { get('/templates').then((d) => setTemplates(d.templates)).catch(() => setTemplates([])) }, [])
  const chosen = templates?.find((t) => t.key === template)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const choose = async () => {
    setError(null)
    try {
      const dir = await pickDirectory(service)
      if (dir) {
        setFolder(dir)
        if (!name) setName(dir.split(/[\\/]/).filter(Boolean).pop() || '')
      }
    } catch (e) { setError(e.message) }
  }
  useEffect(() => { if (mode === 'open') choose() }, [])
  const create = async () => {
    setBusy(true)
    setError(null)
    try {
      const result = await post('/projects/create', { path: folder, name, template })
      onCreated(result.project, result.created)
    } catch (e) { setError(e.message); setBusy(false) }
  }
  return (
    <Modal title={mode === 'open' ? '打开已有文件夹为项目' : '新建项目'} onClose={onClose} busy={busy} footer={<Fragment>
      <button type="button" className="dmw-btn" onClick={onClose} disabled={busy}>取消</button>
      <button type="button" className="dmw-btn pri" disabled={!folder || busy} onClick={create}>{busy ? '创建中…' : mode === 'open' ? '打开' : '创建项目'}</button>
    </Fragment>}>
      <div className="dmw-form">
        <label>项目文件夹</label>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', minWidth: 0 }}>
          <button type="button" className="dmw-btn" onClick={choose}>{folder ? '重新选择…' : '选择文件夹…'}</button>
          <span className="dmw-muted" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={folder}>{folder || '可在系统窗口里新建文件夹'}</span>
        </div>
        <label htmlFor="dmw-np-name">项目名</label>
        <input id="dmw-np-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="例如：东湖秋日 Vlog" />
        <label htmlFor="dmw-np-tpl">标签模板</label>
        <select id="dmw-np-tpl" value={template} onChange={(e) => setTemplate(e.target.value)}>
          {(templates || [{ key: 'vlog-base', label: 'Vlog 基础', builtin: true }, { key: 'product-ad', label: '产品广告', builtin: true }]).map((t) => <option key={t.key} value={t.key}>{t.label}{t.builtin ? '' : '（我的模板）'}</option>)}
        </select>
        {chosen ? <div className="full dmw-tplpeek" aria-label="模板预览">
          {Object.entries(chosen.dims).filter(([, list]) => list.length).map(([dim, list]) => <div key={dim}><span className="dmw-muted">{dim}</span>{list.slice(0, 10).join('、')}{list.length > 10 ? ` 等 ${list.length} 个` : ''}</div>)}
          {!Object.values(chosen.dims).some((list) => list.length) ? <div className="dmw-muted">这个模板还是空的，可以创建后在「标签」页让 AI 根据素材建议标签。</div> : null}
        </div> : null}
        <div className="full dmw-muted">会在文件夹里建好「原始素材库」「输出素材库」「创意剪辑」三个文件夹和隐藏的 .dsh 配置（标签存在这里，在「标签」页管理）；已有文件不会被移动或改名，原有视频会作为原片来源。画幅、分辨率、帧率和目标时长到「剪辑」页再设置；标签模板创建后也可以在「标签」页更换或编辑。</div>
      </div>
      {error ? <div className="dmw-banner bad" role="alert" style={{ marginTop: 10, marginBottom: 0 }}>{error}</div> : null}
    </Modal>
  )
}

/** Project + tool settings: clean thresholds, JianYing dir, FFmpeg path, Eagle port. */
export function SettingsDialog({ overview, onClose, onSaved }) {
  const project = overview?.project
  const [rules, setRules] = useState({ ...(project?.cleanRules || {}) })
  const [jy, setJy] = useState(project?.jianyingDraftDir || '')
  const [tools, setTools] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  useEffect(() => { get('/settings').then(setTools).catch((e) => setError(e.message)) }, [])
  const save = async () => {
    setBusy(true)
    setError(null)
    try {
      if (tools) await post('/settings', { ffmpegPath: tools.settings.ffmpegPath, ffprobePath: tools.settings.ffprobePath, eaglePort: Number(tools.settings.eaglePort) || 41595 })
      if (project) await post('/projects/patch', { project: project.id, jianyingDraftDir: jy, cleanRules: Object.fromEntries(Object.entries(rules).filter(([k]) => k !== 'version').map(([k, v]) => [k, Number(v)])) })
      onSaved()
      onClose()
    } catch (e) { setError(e.message); setBusy(false) }
  }
  const rule = (key, label, step, suffix) => (
    <Fragment key={key}>
      <label htmlFor={`dmw-r-${key}`}>{label}</label>
      <span><input id={`dmw-r-${key}`} type="number" step={step} value={rules[key] ?? ''} onChange={(e) => setRules({ ...rules, [key]: e.target.value })} /> {suffix}</span>
    </Fragment>
  )
  const setTool = (key, value) => setTools({ ...tools, settings: { ...tools.settings, [key]: value } })
  return (
    <Modal title="设置" onClose={onClose} busy={busy} footer={<Fragment>
      <button type="button" className="dmw-btn" onClick={onClose} disabled={busy}>取消</button>
      <button type="button" className="dmw-btn pri" onClick={save} disabled={busy}>保存</button>
    </Fragment>}>
      {project ? <Fragment>
        <h3 className="dmw-h3">清洗规则 <span className="sub">· {project.name} · 改动后需重新清洗才生效</span></h3>
        <div className="dmw-form" style={{ marginBottom: 16 }}>
          {rule('sharpnessMin', '清晰度下限', 1, '分（0–100）')}
          {rule('shakeVarianceMax', '抖动上限', 0.1, '位移方差')}
          {rule('minDuration', '最短时长', 0.1, '秒')}
          {rule('blackLuma', '黑帧亮度', 1, '（0–255）')}
          {rule('blackRatioMax', '黑帧占比', 0.05, '（0–1）')}
          {rule('duplicateSimilarity', '重复相似度', 0.01, '（0.5–1）')}
          <label htmlFor="dmw-jy">剪映草稿目录</label>
          <input id="dmw-jy" value={jy} onChange={(e) => setJy(e.target.value)} placeholder={overview?.status?.jianying?.dir || '留空使用默认位置'} />
        </div>
      </Fragment> : null}
      <h3 className="dmw-h3">外部工具</h3>
      {tools ? (
        <div className="dmw-form">
          <label htmlFor="dmw-ff">FFmpeg 路径</label>
          <input id="dmw-ff" value={tools.settings.ffmpegPath} onChange={(e) => setTool('ffmpegPath', e.target.value)} placeholder={`自动检测：${tools.ffmpeg?.paths?.ffmpeg || 'ffmpeg'}`} />
          <label htmlFor="dmw-fp">ffprobe 路径</label>
          <input id="dmw-fp" value={tools.settings.ffprobePath} onChange={(e) => setTool('ffprobePath', e.target.value)} placeholder="留空则与 FFmpeg 同目录" />
          <label htmlFor="dmw-ep">Eagle 端口</label>
          <input id="dmw-ep" type="number" value={tools.settings.eaglePort} onChange={(e) => setTool('eaglePort', e.target.value)} />
          <div className="full dmw-muted">
            FFmpeg：{tools.ffmpeg?.ffmpeg ? <span className="dmw-ok">已就绪 {tools.ffmpeg.version}</span> : <span className="dmw-bad">未找到</span>}
            {tools.ffmpeg?.ffmpeg ? `（H.264 ${tools.ffmpeg.encoders?.h264 ? '✓' : '✗'} · H.265 ${tools.ffmpeg.encoders?.h265 ? '✓' : '✗'}）` : '。Windows 可用 winget install Gyan.FFmpeg 安装，装好后重启 DSH Desktop。'}
            <br />Eagle：{tools.eagle?.connected ? <span className="dmw-ok">已连接</span> : <span className="dmw-bad">未连接（请打开 Eagle）</span>}
          </div>
        </div>
      ) : <div className="dmw-muted">读取中…</div>}
      {error ? <div className="dmw-banner bad" role="alert" style={{ marginTop: 10, marginBottom: 0 }}>{error}</div> : null}
    </Modal>
  )
}
