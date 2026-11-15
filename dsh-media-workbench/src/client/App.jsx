import { h, Fragment, useState, useEffect, useRef, useCallback, useLayoutEffect } from './react.js'
import { get, post, storage, normPath } from './api.js'
import { ensureStyles } from './styles.js'
import { useOverview } from './useProject.js'
import { useHostSession, ensureProjectSession, setDraft, libraryOf, joinPath } from './host.js'
import { ProjectMenu, NewProjectDialog, SettingsDialog } from './ProjectBar.jsx'
import { CreativeTab } from './CreativeTab.jsx'
import { MaterialTab } from './MaterialTab.jsx'
import { EditTab } from './EditTab.jsx'
import { TagTab } from './TagTab.jsx'
import { AgentPane, TAB_NAMES } from './AgentPane.jsx'
import { useToast, Modal } from './ui.jsx'

/** Header chip from the output spec set in the 剪辑 tab. */
const LEGACY_TAGS_DIR = '标签管理'

const RES_LABEL = (edit) => {
  const spec = edit?.spec
  const res = spec && edit.options?.resolutions?.[spec.resolution]
  if (!res) return ''
  const long = Math.max(res.width, res.height)
  const tag = long >= 3840 ? '4K' : long >= 2560 ? '2.7K' : long >= 1920 ? '1080P' : `${res.width}×${res.height}`
  return `${res.aspect} · ${tag} · ${spec.fps}fps`
}

export function App({ service, workbenches, active = true, conversation }) {
  useLayoutEffect(ensureStyles)
  const [projects, setProjects] = useState([])
  const [loaded, setLoaded] = useState(false)
  const [listError, setListError] = useState(null)
  const [currentId, setCurrentId] = useState(() => storage.get('project', null))
  const [tab, setTab] = useState(() => { const saved = storage.get('tab', 'creative'); return TAB_NAMES[saved] ? saved : 'creative' })
  const [chatOpen, setChatOpen] = useState(() => storage.get('chat', true))
  const [chatWidth, setChatWidth] = useState(() => storage.get('chatWidth', 400))
  const [dialog, setDialog] = useState(null)
  const [info, setInfo] = useState(null)
  const [starting, setStarting] = useState(false)
  const [narrow, setNarrow] = useState(false)
  const [switching, setSwitching] = useState(null)
  const [drawer, setDrawer] = useState(false)
  const [toastNode, notify] = useToast()
  const rootRef = useRef(null)
  const host = useHostSession(service, workbenches)

  const refreshProjects = useCallback(async () => {
    try {
      const { projects: list } = await get('/projects')
      setProjects(list)
      setListError(null)
      return list
    } catch (e) { setListError(e.message); return null } finally { setLoaded(true) }
  }, [])
  useEffect(() => { refreshProjects() }, [])

  const visible = projects.filter((p) => !p.archived || p.id === currentId)
  const current = projects.find((p) => p.id === currentId) || null
  useEffect(() => {
    if (!loaded) return
    if (currentId && projects.some((p) => p.id === currentId)) return
    const first = projects.find((p) => !p.archived && !p.missing)
    setCurrentId(first ? first.id : null)
  }, [loaded, projects, currentId])
  useEffect(() => { storage.set('project', currentId) }, [currentId])
  useEffect(() => { storage.set('tab', tab) }, [tab])
  useEffect(() => { storage.set('chat', chatOpen) }, [chatOpen])
  useEffect(() => { storage.set('chatWidth', chatWidth) }, [chatWidth])

  // A workbench session opened from the sidebar selects its project (and library).
  useEffect(() => {
    if (!host.sessionId || !host.folder) return
    const match = projects.find((p) => libraryOf(p.path, host.folder) !== null)
    if (!match) return
    if (match.id !== currentId) setCurrentId(match.id)
    const library = libraryOf(match.path, host.folder)
    if (library === LEGACY_TAGS_DIR) return
    const saved = library ? match.sessions?.[library] : match.sessionId
    if (saved !== host.sessionId && host.owned) post('/projects/patch', { project: match.id, library, sessionId: host.sessionId }).then(refreshProjects).catch(() => {})
  }, [host.sessionId, host.folder, projects])

  useEffect(() => {
    const node = rootRef.current
    if (!node || typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(([entry]) => setNarrow(entry.contentRect.width < 980))
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  const { data: overview, error, running, reload } = useOverview(current && !current.missing ? current.id : null, active)
  useEffect(() => {
    if (current && active) post('/context', { project: current.id, tab, sessionId: host.sessionId }).catch(() => {})
  }, [current?.id, tab, active, host.sessionId])

  // Which library of the current project the open conversation works in:
  // '' = project root, '创意剪辑' etc. = a library, null = not this project.
  const rawLibrary = current && host.sessionId && host.folder ? libraryOf(current.path, host.folder) : null
  // A conversation left in the old 标签管理 folder (0.1.3) is retired: tags live in the 标签 tab now.
  const legacySession = rawLibrary === LEGACY_TAGS_DIR
  const workingLibrary = legacySession ? null : rawLibrary
  const sessionReady = workingLibrary !== null
  const otherProjectSession = Boolean(host.sessionId && host.folder && current && workingLibrary === null && !legacySession)

  /** Open (or create) the workbench conversation whose working directory is the project root or one library. */
  const openConversation = useCallback(async (library = '') => {
    if (!current) return null
    const folder = library ? joinPath(current.path, library) : current.path
    const saved = (library ? current.sessions?.[library] : current.sessionId) || null
    setStarting(true)
    setSwitching(library || null)
    const remember = async (sessionId) => {
      if (sessionId && sessionId !== saved) {
        await post('/projects/patch', { project: current.id, library, sessionId })
        refreshProjects()
      }
      return sessionId || null
    }
    try {
      const id = await remember(await ensureProjectSession(service, workbenches, folder, saved))
      if (library) notify(`右侧对话已切换到「${library}」`)
      return id
    } catch (e) {
      // A deleted session id is stale: retry once with a fresh session.
      if (saved) {
        try { return await remember(await ensureProjectSession(service, workbenches, folder, null)) } catch (e2) { notify(e2.message) }
      } else notify(e.message)
      return null
    } finally { setStarting(false); setSwitching(null) }
  }, [service, workbenches, current])
  const start = useCallback(() => openConversation(''), [openConversation])
  const switchLibrary = useCallback((library) => {
    if (narrow) setDrawer(true); else setChatOpen(true)
    if (workingLibrary === library) return
    openConversation(library)
  }, [openConversation, workingLibrary, narrow])

  const ask = useCallback(async (text) => {
    if (!current) return
    if (narrow) setDrawer(true); else setChatOpen(true)
    let sessionId = sessionReady ? host.sessionId : await start()
    if (!sessionId) return
    const result = await setDraft(service, sessionId, text)
    if (result === 'clipboard') notify('已复制指令，粘贴到对话框发送即可')
    else if (result === 'none') notify(`请在对话框输入：${text}`)
  }, [current, sessionReady, host.sessionId, start, service])

  const selectProject = (p) => {
    setCurrentId(p.id)
    post('/projects/patch', { project: p.id }).catch(() => {})
    // Bring the project's own conversation forward when it has one.
    if (p.sessionId && libraryOf(p.path, host.folder) === null) ensureProjectSession(service, workbenches, p.path, p.sessionId).catch(() => {})
  }
  const cancelJob = (job) => current && post('/jobs/cancel', { project: current.id, jobId: job.id }).then(() => notify('已请求取消')).catch((e) => notify(e.message))
  const reveal = (path) => current && post('/reveal', { project: current.id, path }).catch((e) => notify(e.message))
  const onCreated = async (project, created) => {
    setDialog(null)
    const list = await refreshProjects()
    const entry = list?.find((p) => p.id === project.id) || project
    setCurrentId(entry.id)
    notify(created ? `已创建项目「${entry.name}」` : `已打开项目「${entry.name}」`)
  }

  const st = overview?.status
  const docs = overview?.creative?.docs || []
  const scriptDoc = docs.find((d) => d.key === '02_文案.md')
  const report = overview?.material?.report
  const match = overview?.edit?.match
  const tagInfo = overview?.material?.tags
  const progress = {
    tags: tagInfo ? [`${tagInfo.inheritLabel || '无模板'} · ${tagInfo.totalTags} 个标签`, tagInfo.pending.length ? `待审 ${tagInfo.pending.length}` : null].filter(Boolean).join(' · ') : '',
    creative: overview ? [scriptDoc?.exists ? `文案 v${scriptDoc.version}` : '文案未生成', overview.storyboard && !overview.storyboard.missing ? `分镜 ${overview.storyboard.count} 镜` : '分镜未生成'].join(' · ') : '',
    material: report ? (report.imported ? `保留 ${report.kept} / 丢弃 ${report.rejected} · 切片 ${report.clips}` : '还没有导入素材') : '',
    edit: overview ? `${match ? `匹配 ${match.matched}/${match.total}` : '未匹配'} · ${overview.edit.exports.some((e) => e.manifest?.kind === 'final') ? '已出成片' : overview.edit.exports.length ? '已出粗剪' : overview.edit.timeline ? '时间线已生成' : '未出片'}` : ''
  }
  // Wide: docked pane the user can collapse. Narrow: an overlay drawer opened on demand.
  const showChat = narrow ? drawer : chatOpen
  const toggleChat = () => (narrow ? setDrawer(!drawer) : setChatOpen(!chatOpen))

  return (
    <div className="dmw-root" ref={rootRef} data-dsh-media-workbench="">
      <div className="dmw-toolwrap">
        <header className="dmw-toolbar" data-dsh-workbench-toolbar="">
          <span className="dmw-logo">DSH<span className="full"> 剪辑</span></span>
          <ProjectMenu projects={visible} current={current} service={service} notify={notify} onChanged={refreshProjects}
            onSelect={selectProject} onNew={() => setDialog({ type: 'new' })} onOpenFolder={() => setDialog({ type: 'open' })} />
          <div className="dmw-chips" aria-label="项目状态">
            {overview ? <Fragment>
              <button type="button" className="dmw-chip dmw-chip-btn" title="输出规格在「剪辑」页设置" onClick={() => setTab('edit')}>{RES_LABEL(overview.edit)}</button>
              <button type="button" className="dmw-chip opt dmw-chip-btn" title="目标时长在「剪辑」页设置" onClick={() => setTab('edit')}>{overview.edit.spec.targetDuration ? `目标 ${overview.edit.spec.targetDuration}s` : '目标时长未设'}</button>
              <span className={`dmw-chip ${st.ffmpeg.ok ? 'ok' : 'bad'}`} title={st.ffmpeg.path}>{st.ffmpeg.ok ? 'FFmpeg ✓' : 'FFmpeg 未找到'}</span>
              <span className={`dmw-chip ${st.eagle.connected ? 'ok' : 'bad'}`}>{st.eagle.connected ? 'Eagle 已连接' : 'Eagle 未连接'}</span>
              <span className={`dmw-chip opt ${st.jianying.ok ? 'ok' : 'warn'}`} title={st.jianying.dir || st.jianying.reason}>{st.jianying.ok ? '剪映草稿目录 ✓' : '剪映未找到'}</span>
            </Fragment> : null}
          </div>
          <span className="dmw-spacer" />
          <button type="button" className="dmw-iconbtn" aria-label="设置" title="设置" onClick={() => setDialog({ type: 'settings' })}>⚙</button>
          <button type="button" className="dmw-iconbtn" aria-label="AI 对话栏" title={chatOpen ? '收起 AI 对话' : '打开 AI 对话'} aria-pressed={showChat} onClick={toggleChat}>💬</button>
        </header>
      </div>
      <div className="dmw-body">
        <main className="dmw-main">
          {!loaded ? <div className="dmw-muted" style={{ padding: 20 }}>加载中…</div>
            : listError ? <div className="dmw-banner bad" role="alert">工作台服务未就绪：{listError}。请确认插件已启用并重启 DSH Desktop。</div>
            : !current ? <Welcome onNew={() => setDialog({ type: 'new' })} onOpen={() => setDialog({ type: 'open' })} />
            : current.missing || error?.code === 'PATH_MISSING' ? <div className="dmw-banner bad" role="alert"><span className="grow">项目文件夹找不到了：{current.path}。可能被移动或删除。</span><button type="button" className="dmw-btn sm" onClick={() => document.querySelector('.dmw-dd-btn')?.click()}>在项目列表里重新定位</button></div>
            : (
              <Fragment>
                <div className="dmw-tabs" role="tablist" aria-label="模块">
                  {Object.entries(TAB_NAMES).map(([key, label]) => (
                    <button type="button" key={key} role="tab" id={`dmw-tab-${key}`} aria-controls="dmw-panel" aria-selected={tab === key} className="dmw-tab" onClick={() => setTab(key)}>
                      {label}<small>{progress[key] || '…'}</small>
                    </button>
                  ))}
                </div>
                <section key={tab} className="dmw-card dmw-panel" id="dmw-panel" role="tabpanel" aria-labelledby={`dmw-tab-${tab}`}>
                  {error && error.code !== 'PATH_MISSING' ? <div className="dmw-banner bad" role="alert"><span className="grow">{error.message}</span><button type="button" className="dmw-btn sm" onClick={reload}>重试</button></div> : null}
                  {!overview ? <div className="dmw-muted">读取项目…</div>
                    : tab === 'creative' ? <CreativeTab overview={overview} projectId={current.id} notify={notify} ask={ask} onReveal={reveal} workingLibrary={workingLibrary} switching={switching} onLibrary={switchLibrary} />
                    : tab === 'tags' ? <TagTab overview={overview} projectId={current.id} notify={notify} ask={ask} onReveal={reveal} />
                    : tab === 'material' ? <MaterialTab overview={overview} projectId={current.id} notify={notify} ask={ask} running={running} onCancelJob={cancelJob} />
                    : <EditTab overview={overview} projectId={current.id} notify={notify} ask={ask} running={running} onCancelJob={cancelJob} onReveal={reveal} onInfo={setInfo} />}
                </section>
              </Fragment>
            )}
        </main>
        {showChat ? (
          <div style={narrow ? { position: 'absolute', right: 0, top: 49, bottom: 0, zIndex: 20, display: 'flex', boxShadow: '-8px 0 24px rgba(0,0,0,.12)' } : { display: 'flex', minHeight: 0 }} onKeyDown={narrow ? (e) => { if (e.key === 'Escape') setDrawer(false) } : undefined}>
            <AgentPane project={current && !current.missing ? current : null} tab={tab} overview={overview} conversation={conversation} sessionReady={sessionReady}
              otherProjectSession={otherProjectSession} legacySession={legacySession} starting={starting} onStart={start} onQuick={ask}
              libraries={overview?.libraries || []} workingLibrary={workingLibrary} switching={switching} onLibrary={switchLibrary} running={running} onCancelJob={cancelJob}
              width={narrow ? Math.min(chatWidth, 380) : chatWidth} onResize={setChatWidth} onClose={narrow ? () => setDrawer(false) : () => setChatOpen(false)} />
          </div>
        ) : <div style={{ display: 'none' }}>{conversation}</div>}
      </div>
      {dialog?.type === 'new' || dialog?.type === 'open' ? <NewProjectDialog service={service} mode={dialog.type} onClose={() => setDialog(null)} onCreated={onCreated} /> : null}
      {dialog?.type === 'settings' ? <SettingsDialog overview={overview} onClose={() => setDialog(null)} onSaved={() => { reload(); notify('设置已保存') }} /> : null}
      {info ? <Modal title={info.title} onClose={() => setInfo(null)} footer={<button type="button" className="dmw-btn pri" onClick={() => setInfo(null)}>知道了</button>}><div style={{ lineHeight: 1.75 }}>{info.text}</div></Modal> : null}
      {toastNode}
    </div>
  )
}

function Welcome({ onNew, onOpen }) {
  return (
    <div className="dmw-card dmw-welcome">
      <h2>媒体自动化剪辑工作台</h2>
      <div className="dmw-muted" style={{ fontSize: 13 }}>左边看结果，右边跟 AI 说。每个项目就是一个本地文件夹，所有产出都是文件：换电脑、不开软件，数据依然完整。</div>
      <div className="dmw-steps">
        <div><b>① 创意</b><span className="dmw-muted">简报 → 创意方向 → 文案 → 分镜，自动留版本</span></div>
        <div><b>② 标签</b><span className="dmw-muted">选标签模板 → AI 看素材建议标签 → 你转正 → 可另存为自己的模板</span></div>
        <div><b>③ 素材</b><span className="dmw-muted">导入 → 清洗（带量化依据）→ 切片 → AI 打标 → 复核 → Eagle</span></div>
        <div><b>④ 剪辑</b><span className="dmw-muted">输出规格 → 分镜匹配素材 → 缺口清单 → 时间线 → FFmpeg 出片</span></div>
      </div>
      <div className="dmw-actions">
        <button type="button" className="dmw-btn pri" onClick={onNew}>＋ 新建项目</button>
        <button type="button" className="dmw-btn" onClick={onOpen}>📂 打开已有文件夹</button>
      </div>
      <div className="dmw-muted">需要本机安装 FFmpeg（导入、清洗、切片、出片）；Eagle 打开时可同步素材库。</div>
    </div>
  )
}
