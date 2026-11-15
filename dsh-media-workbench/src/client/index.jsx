import { h } from './react.js'
import { App } from './App.jsx'
import { ensureStyles } from './styles.js'

// The canonical GitHub identity Desktop uses for cards, navigation and session
// ownership. Change it to the real repository before publishing to the market.
export const REPOSITORY = 'https://github.com/dsh-local/dsh-media-workbench'

class PanelBoundary extends (require('react').Component) {
  constructor(props) { super(props); this.state = { error: null } }
  static getDerivedStateFromError(error) { return { error } }
  render() {
    if (this.state.error) {
      return h('div', { className: 'dmw-root' }, h('div', { className: 'dmw-banner bad', role: 'alert', style: { margin: 16 } },
        h('span', { className: 'grow' }, `工作台界面出错：${this.state.error.message || this.state.error}`),
        h('button', { type: 'button', className: 'dmw-btn sm', onClick: () => this.setState({ error: null }) }, '重新加载面板')))
    }
    return this.props.children
  }
}

// Desktop attributes session ownership to the *calling* client package, which
// it reads from the Cordis context the service is accessed through. The
// `service` prop handed to the panel is the host's own instance, so calls that
// need our identity (ensureSession, ownsSession, isActive) must go through the
// handle obtained from this plugin's ctx. Set in apply().
let ownWorkbenches = null

/** customFrame panel: Desktop passes its service, our entry, whether we are the foreground workbench, and the native conversation node. */
function MediaWorkbench({ service, active, conversation }) {
  return h(PanelBoundary, null, h(App, { service, workbenches: ownWorkbenches || service, active: active !== false, conversation }))
}

export function apply(ctx) {
  ensureStyles()
  const handle = ctx.desktopWorkbenches
  ownWorkbenches = handle
  ctx.effect(() => () => { if (ownWorkbenches === handle) ownWorkbenches = null }, 'media-workbench: identity handle')
  ctx.effect(() => ctx.desktopWorkbenches.register({
    title: '媒体剪辑工作台',
    panelTitle: '媒体剪辑',
    repository: REPOSITORY,
    description: '创意文案、素材清洗打标、分镜匹配与 FFmpeg 出片：左边看结果，右边跟 AI 说。',
    audience: '拍 Vlog、产品广告等短视频的创作者与导演',
    requirements: '需要本机安装 FFmpeg；可选 Eagle、本地 Whisper',
    category: '内容创作',
    icon: '🎬',
    customFrame: true,
    headerLayout: 'compact'
  }, MediaWorkbench), 'media-workbench: register')
}

export const inject = ['desktopWorkbenches']
