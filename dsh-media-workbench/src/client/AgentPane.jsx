import { h, Fragment, useRef } from './react.js'
import { JobBar } from './ui.jsx'
import { TAG_PROMPTS } from './TagTab.jsx'

/** Quick prompts per tab: a label, or [label, the full text put into the composer]. */
export const QUICK = {
  creative: ['完善主题简报', '给我 3 个创意方向', '生成文案', '根据文案出分镜'],
  tags: [['根据素材建议标签', TAG_PROMPTS.footage], ['根据文案和分镜补标签', TAG_PROMPTS.script], ['整理相近的标签', TAG_PROMPTS.tidy], ['给切片打标', TAG_PROMPTS.tagClips]],
  material: ['导入并清洗素材', '自动切片打标', '同步到 Eagle', '解释为什么丢弃这些素材'],
  edit: ['按分镜匹配素材', '写剪辑思路', '生成时间线并出粗剪预览', '导出缺口清单']
}
export const TAB_NAMES = { creative: '创意', tags: '标签', material: '素材', edit: '剪辑' }

/** ④ Agent pane: context bar + tab-specific quick prompts + DSH's native conversation. */
export function AgentPane({ project, tab, overview, conversation, sessionReady, otherProjectSession, legacySession = false, starting, onStart, onQuick, running, onCancelJob, width, onResize, onClose, libraries = [], workingLibrary = null, switching = null, onLibrary }) {
  const docs = overview?.creative?.docs || []
  const script = docs.find((d) => d.key === '02_文案.md')
  const board = docs.find((d) => d.key === '03_分镜脚本.md')
  const drag = useRef(null)
  const startDrag = (event) => {
    event.preventDefault()
    drag.current = { x: event.clientX, w: width }
    const move = (e) => onResize(Math.max(320, Math.min(620, drag.current.w + (drag.current.x - e.clientX))))
    const up = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up) }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }
  const onKeyResize = (e) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); onResize(Math.min(620, width + 20)) }
    if (e.key === 'ArrowRight') { e.preventDefault(); onResize(Math.max(320, width - 20)) }
  }
  return (
    <aside className="dmw-chat" aria-label="AI 对话" style={{ '--dmw-chat-w': `${width}px` }}>
      <div className="dmw-chat-resize" role="separator" aria-orientation="vertical" aria-label="调整对话栏宽度" tabIndex={0} onPointerDown={startDrag} onKeyDown={onKeyResize} data-dsh-no-drag="" />
      <div className="dmw-chat-h">
        <div style={{ display: 'flex', alignItems: 'center' }}><b>DSH Agent</b><button type="button" className="dmw-iconbtn" style={{ marginLeft: 'auto', width: 26, height: 26 }} aria-label="收起 AI 对话" title="收起" onClick={onClose}>⟩</button></div>
        <div className="dmw-ctx">上下文：
          {project ? <span title={project.path}>{project.name}</span> : <span>未选择项目</span>}
          {sessionReady ? <span title="对话的工作目录">📂 {workingLibrary || '项目根目录'}</span> : null}
          <span>{TAB_NAMES[tab] || ''}</span>
          {script?.exists ? <span>文案 v{script.version}</span> : null}
          {board?.exists ? <span>分镜 v{board.version}</span> : null}
        </div>
      </div>
      {running ? <div style={{ padding: '8px 14px 0' }}><JobBar job={running} onCancel={onCancelJob} /></div> : null}
      {project && libraries.length ? (
        <div className="dmw-libs" role="group" aria-label="对话工作目录">
          <span className="dmw-muted">工作目录</span>
          {libraries.map((l) => (
            <button type="button" key={l.dir} aria-pressed={sessionReady && workingLibrary === l.dir} title={`${l.hint} · 点击后对话在这个文件夹里进行`} disabled={Boolean(switching)}
              onClick={() => onLibrary(l.dir)}>{switching === l.dir ? '切换中…' : l.label}</button>
          ))}
        </div>
      ) : null}
      {project ? <div className="dmw-quick" aria-label="快捷指令">
        {(QUICK[tab] || QUICK.creative).map((q) => {
          const [label, text] = Array.isArray(q) ? q : [q, q]
          return <button type="button" key={label} title={text !== label ? text : undefined} onClick={() => onQuick(text)}>{label}</button>
        })}
      </div> : null}
      <div className="dmw-conv">
        {!project ? (
          <div className="dmw-start"><h4>先选择或新建一个项目</h4><div className="dmw-muted">AI 对话会关联到项目文件夹，Agent 写的文件会实时显示在左侧面板。</div></div>
        ) : !sessionReady ? (
          <div className="dmw-start">
            <h4>需要 AI 协助时，开始对话</h4>
            <div className="dmw-muted">
              会以项目文件夹「{project.path}」作为工作区开始一个属于本工作台的会话。左侧面板不依赖对话，也可以先自己操作。
              {otherProjectSession ? <Fragment><br />当前打开的对话属于其他项目，切换后会保留它。</Fragment> : null}
              {legacySession ? <Fragment><br />原来「标签管理」文件夹里的对话已停用：标签改到左侧「标签」页管理。点下面的按钮在项目里继续对话，或在上方选一个工作目录。</Fragment> : null}
            </div>
            <button type="button" className="dmw-btn pri" disabled={starting} onClick={() => onStart()}>{starting ? '正在打开对话…' : project.sessionId ? '继续这个项目的对话' : '为这个项目开始对话'}</button>
          </div>
        ) : null}
        <div style={{ display: project && sessionReady ? 'flex' : 'none', flexDirection: 'column', flex: 1, minHeight: 0 }}>{conversation}</div>
      </div>
      <div className="dmw-note">写文件、改标签、恢复素材、同步 Eagle、正式渲染前都会先让你确认；所有改动记录在 .dsh/log 中可追溯</div>
    </aside>
  )
}
