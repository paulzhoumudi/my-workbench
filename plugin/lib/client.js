// Footage Culler workbench client (素材清洗台). Single-file module loaded by
// DSH Desktop's module loader; React comes from the shared baseline.
window.__ModuleLoader__.load({
  id: 'dsh-footage-culler',
  factory: (require) => {
    const React = require('react')
    const h = React.createElement
    const { useState, useEffect, useRef, useCallback } = React
    const NS = 'footageCuller'
    // Placeholder identity for local use. Replace with the real public GitHub
    // repository before submitting to the workbench market.
    const REPOSITORY = 'https://github.com/your-org/dsh-footage-culler'
    const API = '/api/footage-culler'

    const zh = {
      title: '素材清洗台', subtitle: '本地技术检测 · 可选 AI 画面复审 · 人工改判',
      addFolder: '添加素材文件夹', settings: '设置', ai: 'AI 协助', aiClose: '收起 AI 协助', aiStarting: '正在打开对话…',
      folders: '素材文件夹', noFolders: '还没有素材文件夹。点击「添加素材文件夹」选择当天的素材目录，原始素材只读、不会被修改。',
      scan: '开始清洗', remove: '移除', jobs: '清洗记录', noJobs: '暂无清洗记录',
      ffmpegMissing: '未检测到 ffmpeg。请安装（macOS：brew install ffmpeg），或在设置中填写 ffmpeg 所在目录。',
      pickJob: '选择左侧的素材文件夹开始清洗，或打开一条清洗记录查看结果。',
      status_queued: '排队中', status_running: '进行中', status_done: '已完成', status_failed: '失败', status_cancelled: '已取消', status_interrupted: '已中断',
      phase_discover: '查找素材', phase_measure: '技术检测', phase_thumbs: '生成缩略图', phase_review: 'AI 审片', phase_done: '完成', phase_queued: '排队',
      cancel: '取消任务', footage: '素材总时长', usableA: 'A 优先候选', reviewB: 'B 需复核', archiveC: 'C 问题片段', rejected: '其中技术废片', elapsed: '用时',
      clips: '条', seconds: '秒', all: '全部', export: '导出时间线', exportTitle: '导出选片', exportGrades: '导出等级', exportFormats: '导出格式',
      fcpxml: 'FCPXML（Final Cut / 达芬奇）', xmeml: 'XML（Premiere / 达芬奇）', csv: 'CSV 场记表（Excel）', json: 'JSON 数据',
      chooseDest: '选择保存位置并导出', exporting: '正在导出…', exported: '已导出', close: '关闭',
      grade: '等级', reason: '理由', tech: '技术分', focusRel: '清晰度', shake: '抖动', aesthetic: '审美', composition: '构图',
      preview: '预览片段', previewPreparing: '首次打开会在本地生成预览，原片不会改变。', previewError: '预览加载失败，请检查原片与 ffmpeg。',
      technicalOnlyNote: '当前仅做技术检测：A 表示技术优先候选，画面内容和动作仍需人工确认。',
      failedFiles: '无法分析的文件', empty: '这个等级下没有片段', override: '已人工改判', aiReview: 'AI 复审', aiOff: '仅技术检测',
      timelineHint: '时间轴：绿=可用，黄=提示，红=废片',
      s_general: '检测', s_ffmpeg: 'ffmpeg 所在目录（留空自动查找）', s_strict: '严格度', loose: '宽松', standard: '标准', strict: '严格',
      s_min: '最短可用片段（秒）', s_log: '素材为 LOG / 灰片（不判欠曝）', s_lut: '分析用 LUT 文件路径（.cube，可选，仅用于分析，不改原片）',
      s_hw: '使用硬件解码（macOS）', s_rec: '包含子文件夹', s_vlm: 'AI 复审（多模态大模型）', s_vlmOn: '启用 AI 复审主体、构图与审美',
      s_base: 'API 地址（OpenAI 兼容，例如 http://127.0.0.1:8000/v1）', s_model: '模型名（例如 Qwen3-VL）', s_key: 'API Key',
      s_keySet: '已保存，输入新 Key 可替换', s_keyClear: '清除已保存的 Key', s_rubric: '团队审美标准（留空用内置标准）',
      s_conc: '并发数', s_max: '最多复审片段数（0 不限）', s_frames: '每段抽帧数', s_weight: '技术分权重（0–1）',
      save: '保存', saving: '正在保存…', saved: '已保存', test: '测试连接', testing: '正在测试…', testOk: '连接正常',
      privacy: '提示：启用 AI 复审时，片段的几张静帧会发送到你配置的模型服务。客户素材请优先使用本地或私有部署的模型。',
      rubricPh: '例如：我们拍的是高端食品广告。主体必须是食物或产品；要有食欲感（色泽、热气、拉丝）；构图干净；手部动作完整；不能有场记板和工作人员入画。',
      errorGeneric: '操作失败', retry: '重试', loading: '正在加载…',
    }
    const en = {
      title: 'Footage Culler', subtitle: 'Local technical checks · optional AI frame review · human decisions',
      addFolder: 'Add footage folder', settings: 'Settings', ai: 'AI assist', aiClose: 'Hide AI assist', aiStarting: 'Opening conversation…',
      folders: 'Footage folders', noFolders: 'No footage folders yet. Click "Add footage folder" to choose today\'s rushes. Source media is read-only.',
      scan: 'Start culling', remove: 'Remove', jobs: 'Culling runs', noJobs: 'No runs yet',
      ffmpegMissing: 'ffmpeg not found. Install it (macOS: brew install ffmpeg) or set its folder in Settings.',
      pickJob: 'Pick a footage folder to start culling, or open a previous run.',
      status_queued: 'Queued', status_running: 'Running', status_done: 'Done', status_failed: 'Failed', status_cancelled: 'Cancelled', status_interrupted: 'Interrupted',
      phase_discover: 'Finding clips', phase_measure: 'Technical check', phase_thumbs: 'Thumbnails', phase_review: 'AI review', phase_done: 'Done', phase_queued: 'Queued',
      cancel: 'Cancel run', footage: 'Footage', usableA: 'A priority', reviewB: 'B review', archiveC: 'C issues', rejected: 'technical rejects', elapsed: 'Took',
      clips: 'clips', seconds: 's', all: 'All', export: 'Export timeline', exportTitle: 'Export selects', exportGrades: 'Grades', exportFormats: 'Formats',
      fcpxml: 'FCPXML (Final Cut / Resolve)', xmeml: 'XML (Premiere / Resolve)', csv: 'CSV shot log (Excel)', json: 'JSON data',
      chooseDest: 'Choose folder and export', exporting: 'Exporting…', exported: 'Exported', close: 'Close',
      grade: 'Grade', reason: 'Reason', tech: 'Tech', focusRel: 'Focus', shake: 'Shake', aesthetic: 'Aesthetic', composition: 'Composition',
      preview: 'Preview clip', previewPreparing: 'The first opening creates a local preview. Source media stays untouched.', previewError: 'Preview failed to load. Check the source and ffmpeg.',
      technicalOnlyNote: 'Technical checks only: A is a priority candidate. Review the content and action before using it.',
      failedFiles: 'Files that could not be analyzed', empty: 'No segments in this grade', override: 'Overridden', aiReview: 'AI review', aiOff: 'Technical only',
      timelineHint: 'Timeline: green usable, amber warning, red reject',
      s_general: 'Checks', s_ffmpeg: 'ffmpeg folder (blank = auto)', s_strict: 'Strictness', loose: 'Loose', standard: 'Standard', strict: 'Strict',
      s_min: 'Shortest usable segment (s)', s_log: 'Footage is LOG / flat (skip underexposure)', s_lut: 'Analysis LUT path (.cube, optional; source untouched)',
      s_hw: 'Hardware decoding (macOS)', s_rec: 'Include sub-folders', s_vlm: 'AI review (multimodal model)', s_vlmOn: 'Review subject, composition and aesthetics with AI',
      s_base: 'API URL (OpenAI compatible, e.g. http://127.0.0.1:8000/v1)', s_model: 'Model (e.g. Qwen3-VL)', s_key: 'API key',
      s_keySet: 'Saved. Enter a new key to replace it', s_keyClear: 'Clear saved key', s_rubric: 'Team aesthetic standard (blank = built-in)',
      s_conc: 'Concurrency', s_max: 'Max segments to review (0 = all)', s_frames: 'Frames per segment', s_weight: 'Technical weight (0–1)',
      save: 'Save', saving: 'Saving…', saved: 'Saved', test: 'Test connection', testing: 'Testing…', testOk: 'Connection OK',
      privacy: 'With AI review on, a few stills per segment are sent to the model service you configure. Prefer a local or private model for client footage.',
      rubricPh: 'e.g. Premium food commercials. The subject must be food or product; appetite appeal (gloss, steam, cheese pull); clean composition; complete hand moves; no slates or crew in frame.',
      errorGeneric: 'Something went wrong', retry: 'Retry', loading: 'Loading…',
    }

    const css = `
.fcw{display:flex;flex-direction:column;flex:1;min-height:0;min-width:0;width:100%;box-sizing:border-box;color:var(--dsw-alias-label-primary);font-size:13px;line-height:1.5;background:var(--dsw-alias-bg-layer-1)}
.fcw *{box-sizing:border-box}
.fcw-bar{display:flex;align-items:center;gap:10px;padding:8px 16px;min-height:48px;border-bottom:.5px solid var(--dsw-alias-border-l2);flex-wrap:wrap}
.fcw-bar h1{margin:0;font-size:15px;font-weight:600}
.fcw-sub{color:var(--dsw-alias-label-tertiary);font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0;flex:1}
.fcw-btn{appearance:none;font:inherit;font-size:13px;border:.5px solid var(--dsw-alias-border-l4);background:var(--dsw-alias-bg-layer-3);color:var(--dsw-alias-label-primary);border-radius:8px;padding:4px 12px;cursor:pointer;white-space:nowrap}
.fcw-btn:hover{background:var(--dsw-alias-interactive-bg-hover)}
.fcw-btn:disabled{opacity:.45;cursor:default}
.fcw-btn:focus-visible,.fcw-tab:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:1px}
.fcw-primary{background:var(--dsw-alias-button-primary-fill);color:var(--dsw-alias-label-primary-foreground);border-color:transparent}
.fcw-primary:hover{background:var(--dsw-alias-button-primary-hover)}
.fcw-body{display:flex;flex:1;min-height:0;min-width:0}
.fcw-nav{width:268px;flex:none;border-right:.5px solid var(--dsw-alias-border-l2);overflow:auto;padding:12px;display:flex;flex-direction:column;gap:16px}
.fcw-main{flex:1;min-width:0;overflow:auto;padding:16px}
.fcw-chat{width:380px;flex:none;border-left:.5px solid var(--dsw-alias-border-l2);display:flex;flex-direction:column;min-height:0}
.fcw[data-narrow] .fcw-body{flex-direction:column;overflow:auto}
.fcw[data-narrow] .fcw-nav{width:auto;border-right:0;border-bottom:.5px solid var(--dsw-alias-border-l2);overflow:visible}
.fcw[data-narrow] .fcw-main{overflow:visible}
.fcw[data-narrow] .fcw-chat{width:auto;min-height:420px;border-left:0;border-top:.5px solid var(--dsw-alias-border-l2)}
.fcw h2{font-size:13px;font-weight:600;margin:0 0 8px;color:var(--dsw-alias-label-secondary)}
.fcw-muted{color:var(--dsw-alias-label-tertiary);font-size:12px;margin:0}
.fcw-item{border:.5px solid var(--dsw-alias-border-l2);border-radius:10px;padding:8px 10px;margin-bottom:8px;background:var(--dsw-alias-bg-layer-2)}
.fcw-item[aria-current=true]{border-color:var(--dsw-alias-brand-primary)}
.fcw-path{word-break:break-all;font-size:12px}
.fcw-row{display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin-top:6px}
.fcw-link{appearance:none;background:none;border:0;padding:0;font:inherit;text-align:left;color:inherit;cursor:pointer;width:100%}
.fcw-warn{border:.5px solid var(--dsw-alias-state-error-primary);color:var(--dsw-alias-state-error-primary);border-radius:8px;padding:8px 10px;margin-bottom:12px}
.fcw-cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px;margin:12px 0}
.fcw-card{border:.5px solid var(--dsw-alias-border-l2);border-radius:12px;padding:10px 12px;background:var(--dsw-alias-bg-layer-2)}
.fcw-card b{display:block;font-size:18px;font-weight:600}
.fcw-progress{height:6px;border-radius:3px;background:var(--dsw-alias-border-l2);overflow:hidden;margin:8px 0}
.fcw-progress i{display:block;height:100%;background:var(--dsw-alias-brand-primary)}
.fcw-tabs{display:flex;gap:6px;flex-wrap:wrap;margin:8px 0 12px;align-items:center}
.fcw-tab{appearance:none;font:inherit;border:.5px solid var(--dsw-alias-border-l4);background:transparent;color:var(--dsw-alias-label-secondary);border-radius:999px;padding:2px 12px;cursor:pointer}
.fcw-tab[aria-pressed=true]{background:var(--dsw-alias-label-primary);color:var(--dsw-alias-bg-layer-1);border-color:transparent}
.fcw-file{margin-bottom:18px}
.fcw-file h3{font-size:13px;font-weight:600;margin:0 0 4px;word-break:break-all}
.fcw-strip{display:flex;height:8px;border-radius:4px;overflow:hidden;margin:4px 0 8px;gap:1px}
.fcw-strip span{flex:1;min-width:1px}
.fcw-good{background:var(--dsw-alias-state-success-primary)}
.fcw-mid{background:var(--dsw-alias-state-business-primary)}
.fcw-bad{background:var(--dsw-alias-state-error-primary)}
.fcw-segs{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:10px}
.fcw-seg{border:.5px solid var(--dsw-alias-border-l2);border-radius:12px;overflow:hidden;background:var(--dsw-alias-bg-layer-2);display:flex;flex-direction:column}
.fcw-thumb{aspect-ratio:16/9;background:var(--dsw-alias-bg-base);display:block;width:100%;object-fit:cover}
.fcw-thumb-button{appearance:none;border:0;padding:0;background:transparent;cursor:pointer;width:100%;position:relative}
.fcw-thumb-button:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:-2px}
.fcw-thumb-button::after{content:'▶';position:absolute;right:10px;bottom:10px;background:rgba(0,0,0,.7);color:white;border-radius:6px;padding:2px 8px}
.fcw-video{width:100%;max-height:65vh;background:#000;border-radius:8px}
.fcw-segb{padding:8px 10px;display:flex;flex-direction:column;gap:4px}
.fcw-badge{display:inline-flex;align-items:center;justify-content:center;min-width:22px;height:20px;border-radius:6px;font-weight:600;font-size:12px;padding:0 6px;color:var(--dsw-alias-label-primary-foreground)}
.fcw-badge[data-g=A]{background:var(--dsw-alias-state-success-primary)}
.fcw-badge[data-g=B]{background:var(--dsw-alias-state-business-primary)}
.fcw-badge[data-g=C]{background:var(--dsw-alias-label-tertiary)}
.fcw-chip{display:inline-block;border:.5px solid var(--dsw-alias-border-l4);border-radius:6px;padding:0 6px;font-size:11px;color:var(--dsw-alias-label-secondary);margin:0 4px 4px 0}
.fcw-select{font:inherit;font-size:12px;border:.5px solid var(--dsw-alias-border-l4);border-radius:6px;background:var(--dsw-alias-bg-layer-3);color:var(--dsw-alias-label-primary);padding:1px 4px}
.fcw-mask{position:absolute;inset:0;background:rgba(0,0,0,.28);display:flex;align-items:center;justify-content:center;z-index:5;padding:16px}
.fcw-dialog{background:var(--dsw-alias-bg-layer-1);border:.5px solid var(--dsw-alias-border-l4);border-radius:14px;width:min(620px,100%);max-height:100%;overflow:auto;padding:16px 18px}
.fcw-dialog h2{font-size:15px;color:var(--dsw-alias-label-primary)}
.fcw-field{display:flex;flex-direction:column;gap:4px;margin:10px 0}
.fcw-field input[type=text],.fcw-field input[type=password],.fcw-field input[type=number],.fcw-field select,.fcw-field textarea{font:inherit;border:.5px solid var(--dsw-alias-border-l4);border-radius:8px;background:var(--dsw-alias-bg-layer-3);color:var(--dsw-alias-label-primary);padding:5px 10px;width:100%}
.fcw-field textarea{min-height:110px;resize:vertical}
.fcw-check{display:flex;gap:8px;align-items:center;margin:8px 0}
.fcw-grid2{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:0 12px}
.fcw-actions{display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap;margin-top:12px;align-items:center}
.fcw-live{font-size:12px;color:var(--dsw-alias-label-secondary)}
@media (prefers-reduced-motion:no-preference){.fcw-progress i{transition:width .4s}}
`

    async function call(path, { method = 'GET', body, signal } = {}) {
      const res = await fetch(`${API}${path}`, {
        method, credentials: 'same-origin', cache: 'no-store', signal,
        ...(body !== undefined ? { headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) } : {}),
      })
      const text = await res.text()
      let data = {}
      try { data = text ? JSON.parse(text) : {} } catch { data = { error: text.slice(0, 200) } }
      if (!res.ok) { const e = new Error(data.error || `HTTP ${res.status}`); e.code = data.code; throw e }
      return data
    }

    const fmtSec = (s) => {
      if (s == null || !Number.isFinite(s)) return '-'
      if (s < 60) return `${s.toFixed(1)}s`
      const m = Math.floor(s / 60), r = Math.round(s - m * 60)
      return m < 60 ? `${m}m${String(r).padStart(2, '0')}s` : `${Math.floor(m / 60)}h${String(m % 60).padStart(2, '0')}m`
    }
    const fmtTc = (s) => { const m = Math.floor(s / 60); return `${String(m).padStart(2, '0')}:${(s - m * 60).toFixed(1).padStart(4, '0')}` }
    const FLAG = { black: ['黑场', 'Black'], blank: ['纯色/遮挡', 'Blank'], no_detail: ['缺少细节', 'No detail'], blur: ['虚焦', 'Out of focus'], soft: ['略软', 'Soft'], shake: ['抖动', 'Shaky'], jitter: ['轻微晃动', 'Jitter'], overexposed: ['过曝', 'Overexposed'], highlights_clipped: ['高光溢出', 'Clipped highlights'], underexposed: ['欠曝', 'Underexposed'], dark: ['偏暗', 'Dark'] }

    function Dialog({ title, onClose, busy, children }) {
      const ref = useRef(null)
      useEffect(() => {
        const el = ref.current
        const first = el?.querySelector('input,select,textarea,button')
        first?.focus()
        const onKey = (e) => {
          if (e.key === 'Escape' && !busy) { e.stopPropagation(); onClose() }
          if (e.key === 'Tab' && el) {
            const items = [...el.querySelectorAll('input,select,textarea,button,[href]')].filter((x) => !x.disabled)
            if (!items.length) return
            const a = items[0], z = items[items.length - 1]
            if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus() }
            else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus() }
          }
        }
        el?.addEventListener('keydown', onKey)
        return () => el?.removeEventListener('keydown', onKey)
      }, [busy, onClose])
      return h('div', { className: 'fcw-mask', 'data-dsh-no-drag': '', onMouseDown: (e) => { if (e.target === e.currentTarget && !busy) onClose() } },
        h('div', { className: 'fcw-dialog', role: 'dialog', 'aria-modal': 'true', 'aria-label': title, ref }, h('h2', null, title), children))
    }

    function SettingsDialog({ t, onClose }) {
      const [s, setS] = useState(null)
      const [key, setKey] = useState('')
      const [clearKey, setClearKey] = useState(false)
      const [busy, setBusy] = useState(false)
      const [msg, setMsg] = useState('')
      useEffect(() => { const c = new AbortController(); call('/settings', { signal: c.signal }).then(setS, (e) => setMsg(e.message)); return () => c.abort() }, [])
      if (!s) return h(Dialog, { title: t('settings'), onClose }, h('p', { className: 'fcw-live', role: 'status' }, msg || t('loading')))
      const set = (patch) => setS((prev) => ({ ...prev, ...patch }))
      const setV = (patch) => setS((prev) => ({ ...prev, vlm: { ...prev.vlm, ...patch } }))
      const text = (label, value, onChange, type = 'text', extra = {}) => h('label', { className: 'fcw-field' }, label, h('input', { type, value: value ?? '', onChange: (e) => onChange(e.target.value), ...extra }))
      const check = (label, value, onChange) => h('label', { className: 'fcw-check' }, h('input', { type: 'checkbox', checked: !!value, onChange: (e) => onChange(e.target.checked) }), label)
      const save = async () => {
        setBusy(true); setMsg(t('saving'))
        try {
          const next = await call('/settings/save', { method: 'POST', body: { ...s, vlm: { ...s.vlm, apiKey: key, clearApiKey: clearKey } } })
          setS(next); setKey(''); setClearKey(false); setMsg(t('saved'))
        } catch (e) { setMsg(e.message) } finally { setBusy(false) }
      }
      const test = async () => {
        setBusy(true); setMsg(t('testing'))
        try { const r = await call('/settings/test', { method: 'POST', body: {} }); setMsg(`${t('testOk')} · ${r.model} · ${r.ms}ms`) } catch (e) { setMsg(e.message) } finally { setBusy(false) }
      }
      return h(Dialog, { title: t('settings'), onClose, busy },
        h('h2', null, t('s_general')),
        h('div', { className: 'fcw-grid2' },
          h('label', { className: 'fcw-field' }, t('s_strict'), h('select', { value: s.strictness, onChange: (e) => set({ strictness: e.target.value }) }, ['loose', 'standard', 'strict'].map((k) => h('option', { key: k, value: k }, t(k))))),
          text(t('s_min'), s.minSegment, (v) => set({ minSegment: v }), 'number', { min: 0.5, step: 0.5 })),
        check(t('s_log'), s.log, (v) => set({ log: v })),
        check(t('s_rec'), s.recursive, (v) => set({ recursive: v })),
        check(t('s_hw'), s.hwaccel, (v) => set({ hwaccel: v })),
        text(t('s_lut'), s.lutPath, (v) => set({ lutPath: v })),
        text(t('s_ffmpeg'), s.ffmpegDir, (v) => set({ ffmpegDir: v })),
        h('h2', { style: { marginTop: 16 } }, t('s_vlm')),
        check(t('s_vlmOn'), s.vlm.enabled, (v) => setV({ enabled: v })),
        text(t('s_base'), s.vlm.baseUrl, (v) => setV({ baseUrl: v })),
        text(t('s_model'), s.vlm.model, (v) => setV({ model: v })),
        text(t('s_key'), key, setKey, 'password', { placeholder: s.vlm.apiKeyConfigured ? t('s_keySet') : '', autoComplete: 'off' }),
        s.vlm.apiKeyConfigured && check(t('s_keyClear'), clearKey, setClearKey),
        h('label', { className: 'fcw-field' }, t('s_rubric'), h('textarea', { value: s.vlm.rubric || '', placeholder: t('rubricPh'), onChange: (e) => setV({ rubric: e.target.value }) })),
        h('div', { className: 'fcw-grid2' },
          text(t('s_conc'), s.vlm.concurrency, (v) => setV({ concurrency: v }), 'number', { min: 1, max: 8 }),
          text(t('s_max'), s.vlm.maxSegments, (v) => setV({ maxSegments: v }), 'number', { min: 0 }),
          text(t('s_frames'), s.vlm.frames, (v) => setV({ frames: v }), 'number', { min: 1, max: 8 }),
          text(t('s_weight'), s.grading?.techWeight, (v) => set({ grading: { ...s.grading, techWeight: v } }), 'number', { min: 0, max: 1, step: 0.1 })),
        h('p', { className: 'fcw-muted' }, t('privacy')),
        h('div', { className: 'fcw-actions' },
          h('span', { className: 'fcw-live', role: 'status', 'aria-live': 'polite' }, msg),
          h('button', { type: 'button', className: 'fcw-btn', disabled: busy, onClick: test }, t('test')),
          h('button', { type: 'button', className: 'fcw-btn', disabled: busy, onClick: onClose }, t('close')),
          h('button', { type: 'button', className: 'fcw-btn fcw-primary', disabled: busy, onClick: save }, t('save'))))
    }

    function ExportDialog({ t, job, pickDirectory, onClose }) {
      const [grades, setGrades] = useState({ A: true, B: false, C: false })
      const [formats, setFormats] = useState({ fcpxml: true, xmeml: true, csv: true, json: false })
      const [busy, setBusy] = useState(false)
      const [msg, setMsg] = useState('')
      const [written, setWritten] = useState([])
      const run = async () => {
        const dest = await pickDirectory()
        if (!dest) return
        setBusy(true); setMsg(t('exporting'))
        try {
          const r = await call('/export', { method: 'POST', body: { id: job.id, dest, grades: Object.keys(grades).filter((k) => grades[k]), formats: Object.keys(formats).filter((k) => formats[k]) } })
          setWritten(r.written); setMsg(t('exported'))
        } catch (e) { setMsg(e.message) } finally { setBusy(false) }
      }
      const box = (state, setState, k, label) => h('label', { key: k, className: 'fcw-check' }, h('input', { type: 'checkbox', checked: state[k], onChange: (e) => setState({ ...state, [k]: e.target.checked }) }), label)
      return h(Dialog, { title: t('exportTitle'), onClose, busy },
        h('h2', null, t('exportGrades')), box(grades, setGrades, 'A', t('usableA')), box(grades, setGrades, 'B', t('reviewB')), box(grades, setGrades, 'C', t('archiveC')),
        h('h2', null, t('exportFormats')), ...['fcpxml', 'xmeml', 'csv', 'json'].map((k) => box(formats, setFormats, k, t(k))),
        written.length > 0 && h('ul', null, written.map((w) => h('li', { key: w.path, className: 'fcw-path' }, `${w.path}（${w.count}）`))),
        h('div', { className: 'fcw-actions' },
          h('span', { className: 'fcw-live', role: 'status', 'aria-live': 'polite' }, msg),
          h('button', { type: 'button', className: 'fcw-btn', disabled: busy, onClick: onClose }, t('close')),
          h('button', { type: 'button', className: 'fcw-btn fcw-primary', disabled: busy || !Object.values(grades).some(Boolean) || !Object.values(formats).some(Boolean), onClick: run }, t('chooseDest'))))
    }

    function Strip({ timeline }) {
      if (!timeline?.length) return null
      const max = 240
      const step = Math.max(1, Math.ceil(timeline.length / max))
      const cells = []
      for (let i = 0; i < timeline.length; i += step) {
        const chunk = timeline.slice(i, i + step)
        const worst = Math.min(...chunk.map((w) => w[1]))
        const warn = chunk.some((w) => w[2].length)
        cells.push(h('span', { key: i, className: worst === 0 ? 'fcw-bad' : warn || worst < 70 ? 'fcw-mid' : 'fcw-good', title: `${fmtTc(chunk[0][0])} · ${worst}` }))
      }
      return h('div', { className: 'fcw-strip', 'aria-hidden': true }, cells)
    }

    function PreviewDialog({ t, job, seg, onClose }) {
      const [failed, setFailed] = useState(false)
      const src = `${API}/preview?id=${encodeURIComponent(job.id)}&segment=${encodeURIComponent(seg.id)}`
      return h(Dialog, { title: t('preview'), onClose },
        h('video', { className: 'fcw-video', src, controls: true, autoPlay: true, playsInline: true, preload: 'metadata', onError: () => setFailed(true) }),
        h('p', { className: failed ? 'fcw-warn' : 'fcw-muted', role: 'status' }, failed ? t('previewError') : t('previewPreparing')),
        h('p', { className: 'fcw-muted' }, `${fmtTc(seg.start)} – ${fmtTc(seg.end)}`),
        h('div', { className: 'fcw-actions' }, h('button', { type: 'button', className: 'fcw-btn', onClick: onClose }, t('close'))))
    }

    function Segment({ t, lang, job, seg, onGrade, onPreview, disabled }) {
      const g = job.overrides?.[seg.id] || seg.grade
      const r = seg.review && !seg.review.error ? seg.review : null
      const chips = [...seg.flags.map((f) => (FLAG[f] ? FLAG[f][lang === 'en' ? 1 : 0] : f)), r?.shotType, r?.cameraMove, ...(r?.tags || []).slice(0, 4)].filter(Boolean)
      return h('article', { className: 'fcw-seg' },
        h('button', { type: 'button', className: 'fcw-thumb-button', 'aria-label': `${t('preview')} ${fmtTc(seg.start)}–${fmtTc(seg.end)}`, onClick: () => onPreview(seg) },
          seg.thumb ? h('img', { className: 'fcw-thumb', loading: 'lazy', alt: '', src: `${API}/thumb?id=${job.id}&name=${encodeURIComponent(seg.thumb)}` }) : h('div', { className: 'fcw-thumb' })),
        h('div', { className: 'fcw-segb' },
          h('div', { className: 'fcw-row', style: { marginTop: 0 } },
            h('span', { className: 'fcw-badge', 'data-g': g }, g),
            h('span', null, `${fmtTc(seg.start)} – ${fmtTc(seg.end)} · ${fmtSec(seg.duration)}`),
            h('select', { className: 'fcw-select', 'aria-label': t('grade'), value: g, disabled, onChange: (e) => onGrade(seg, e.target.value) }, ['A', 'B', 'C'].map((x) => h('option', { key: x, value: x }, x))),
            job.overrides?.[seg.id] && h('span', { className: 'fcw-muted' }, t('override'))),
          r?.subject && h('div', null, r.subject),
          h('div', { className: 'fcw-muted' }, seg.gradeReason),
          h('div', { className: 'fcw-muted' }, `${t('tech')} ${seg.tech.score} · ${t('focusRel')} ${seg.tech.focusRel ?? seg.tech.focus} · ${t('shake')} ${seg.tech.shake}%${r ? ` · ${t('aesthetic')} ${r.aesthetic} · ${t('composition')} ${r.composition}` : ''}`),
          chips.length > 0 && h('div', null, chips.map((c, i) => h('span', { key: i, className: 'fcw-chip' }, c)))))
    }

    function JobView({ t, lang, jobId, pickDirectory, onChanged }) {
      const [job, setJob] = useState(null)
      const [error, setError] = useState('')
      const [filter, setFilter] = useState('A')
      const [exporting, setExporting] = useState(false)
      const [previewSegment, setPreviewSegment] = useState(null)
      const [saving, setSaving] = useState(false)
      const load = useCallback(async (signal) => {
        try { const j = await call(`/job?id=${jobId}`, { signal }); setJob(j); setError('') } catch (e) { if (!signal?.aborted) setError(e.message) }
      }, [jobId])
      useEffect(() => {
        const c = new AbortController()
        setJob(null)
        load(c.signal)
        return () => c.abort()
      }, [load])
      const live = job && (job.status === 'running' || job.status === 'queued')
      useEffect(() => {
        if (!live) return
        const c = new AbortController()
        const timer = setInterval(() => load(c.signal), 1500)
        return () => { clearInterval(timer); c.abort() }
      }, [live, load])
      useEffect(() => { if (job && !live) onChanged?.() }, [job?.status])
      if (error && !job) return h('div', { className: 'fcw-warn', role: 'alert' }, error, ' ', h('button', { type: 'button', className: 'fcw-btn', onClick: () => load() }, t('retry')))
      if (!job) return h('p', { className: 'fcw-live', role: 'status' }, t('loading'))
      const s = job.summary
      const p = job.progress || {}
      const pct = p.total ? Math.round((p.done / p.total) * 100) : 0
      const grade = async (seg, g) => {
        setSaving(true)
        try { await call('/override', { method: 'POST', body: { id: job.id, segment: seg.id, grade: g } }); await load() } catch (e) { setError(e.message) } finally { setSaving(false) }
      }
      const files = (job.files || []).filter((f) => f.segments)
      const failed = (job.files || []).filter((f) => f.status === 'failed')
      const segsOf = (f) => [...f.segments, ...f.rejected].filter((x) => filter === 'all' || (job.overrides?.[x.id] || x.grade) === filter).sort((a, b) => a.start - b.start)
      const shown = files.map((f) => [f, segsOf(f)]).filter(([, list]) => list.length)
      return h('div', null,
        h('div', { className: 'fcw-row', style: { marginTop: 0, justifyContent: 'space-between' } },
          h('div', { style: { minWidth: 0 } }, h('div', { className: 'fcw-path' }, job.request?.inputs?.[0]), h('div', { className: 'fcw-muted' }, `${t(`status_${job.status}`)} · ${job.request?.vlm?.enabled ? t('aiReview') : t('aiOff')}${job.elapsedSeconds ? ` · ${t('elapsed')} ${fmtSec(job.elapsedSeconds)}` : ''}`)),
          h('div', { className: 'fcw-row', style: { marginTop: 0 } },
            live && h('button', { type: 'button', className: 'fcw-btn', onClick: async () => { try { await call('/cancel', { method: 'POST', body: { id: job.id } }) } catch (e) { setError(e.message) } } }, t('cancel')),
            job.status === 'done' && h('button', { type: 'button', className: 'fcw-btn fcw-primary', onClick: () => setExporting(true) }, t('export')))),
        live && h('div', null,
          h('div', { className: 'fcw-progress', role: 'progressbar', 'aria-valuemin': 0, 'aria-valuemax': 100, 'aria-valuenow': pct }, h('i', { style: { width: `${pct}%` } })),
          h('p', { className: 'fcw-live', 'aria-live': 'polite' }, `${t(`phase_${job.phase}`) || job.phase} ${p.done || 0}/${p.total || 0} ${p.current || ''}`)),
        job.error && h('div', { className: 'fcw-warn', role: 'alert' }, job.error),
        error && job && h('div', { className: 'fcw-warn', role: 'alert' }, error),
        !job.request?.vlm?.enabled && h('p', { className: 'fcw-muted' }, t('technicalOnlyNote')),
        s && h('div', { className: 'fcw-cards' },
          h('div', { className: 'fcw-card' }, t('footage'), h('b', null, fmtSec(s.footageSeconds)), h('span', { className: 'fcw-muted' }, `${s.analyzed}/${s.files} ${t('clips')}`)),
          h('div', { className: 'fcw-card' }, t('usableA'), h('b', null, fmtSec(s.A.seconds)), h('span', { className: 'fcw-muted' }, `${s.A.count} ${t('clips')}`)),
          h('div', { className: 'fcw-card' }, t('reviewB'), h('b', null, fmtSec(s.B.seconds)), h('span', { className: 'fcw-muted' }, `${s.B.count} ${t('clips')}`)),
          h('div', { className: 'fcw-card' }, t('archiveC'), h('b', null, fmtSec(s.C.seconds)), h('span', { className: 'fcw-muted' }, `${t('rejected')} ${fmtSec(s.rejectedSeconds)}`))),
        failed.length > 0 && h('details', { className: 'fcw-item' }, h('summary', null, `${t('failedFiles')}（${failed.length}）`), failed.map((f) => h('div', { key: f.index, className: 'fcw-muted fcw-path' }, `${f.name}: ${f.error}`))),
        files.length > 0 && h('div', { className: 'fcw-tabs', role: 'group' },
          ['A', 'B', 'C', 'all'].map((k) => h('button', { key: k, type: 'button', className: 'fcw-tab', 'aria-pressed': filter === k, onClick: () => setFilter(k) }, k === 'all' ? t('all') : k === 'A' ? t('usableA') : k === 'B' ? t('reviewB') : t('archiveC'))),
          h('span', { className: 'fcw-muted' }, t('timelineHint'))),
        files.length > 0 && shown.length === 0 && h('p', { className: 'fcw-muted' }, t('empty')),
        shown.map(([f, list]) => h('section', { key: f.index, className: 'fcw-file' },
          h('h3', null, `${f.name} · ${fmtSec(f.duration)}${f.meta ? ` · ${f.meta.width}×${f.meta.height} ${Math.round(f.meta.fps * 100) / 100}fps` : ''}`),
          h(Strip, { timeline: f.timeline }),
          h('div', { className: 'fcw-segs' }, list.map((seg) => h(Segment, { key: seg.id, t, lang, job, seg, onGrade: grade, onPreview: setPreviewSegment, disabled: saving || live }))))),
        exporting && h(ExportDialog, { t, job, pickDirectory, onClose: () => setExporting(false) }),
        previewSegment && h(PreviewDialog, { t, job, seg: previewSegment, onClose: () => setPreviewSegment(null) }))
    }

    function makePanel(ctx) {
      const t = ctx.locale.bind(NS)
      const pickDirectory = async () => {
        try { return await ctx.uiWorkspace.pickDirectory() } catch { return null }
      }
      return function FootageCullerPanel({ service, conversation }) {
        const lang = (typeof document !== 'undefined' && /^en/i.test(document.documentElement.lang || '')) ? 'en' : 'zh'
        const rootRef = useRef(null)
        const [narrow, setNarrow] = useState(false)
        const [state, setState] = useState(null)
        const [error, setError] = useState('')
        const [jobId, setJobId] = useState(null)
        const [showSettings, setShowSettings] = useState(false)
        const [aiOpen, setAiOpen] = useState(false)
        const [aiBusy, setAiBusy] = useState(false)
        const [busy, setBusy] = useState(false)
        const refresh = useCallback(async (signal) => {
          try { const s = await call('/state', { signal }); setState(s); setError('') } catch (e) { if (!signal?.aborted) setError(e.message) }
        }, [])
        useEffect(() => { const c = new AbortController(); refresh(c.signal); return () => c.abort() }, [refresh])
        useEffect(() => {
          const el = rootRef.current
          if (!el || typeof ResizeObserver === 'undefined') return
          const ro = new ResizeObserver(([e]) => setNarrow(e.contentRect.width < 860))
          ro.observe(el)
          return () => ro.disconnect()
        }, [])
        const running = state?.jobs?.some((j) => j.status === 'running' || j.status === 'queued')
        useEffect(() => {
          if (!running) return
          const c = new AbortController()
          const timer = setInterval(() => refresh(c.signal), 3000)
          return () => { clearInterval(timer); c.abort() }
        }, [running, refresh])
        const act = async (fn) => { setBusy(true); try { await fn() } catch (e) { setError(e.message) } finally { setBusy(false) } }
        const addFolder = () => act(async () => {
          const path = await pickDirectory()
          if (!path) return
          await call('/folders/add', { method: 'POST', body: { path } }); await refresh()
        })
        const removeFolder = (path) => act(async () => { await call('/folders/remove', { method: 'POST', body: { path } }); await refresh() })
        const scan = (folder) => act(async () => { const r = await call('/scan', { method: 'POST', body: { folder } }); setJobId(r.id); await refresh() })
        const toggleAi = async () => {
          if (aiOpen) { setAiOpen(false); return }
          setAiOpen(true)
          // Create or restore this workbench's conversation only when asked.
          if (service && !service.ownsSession?.(service.currentSession?.())) {
            setAiBusy(true)
            try { await service.newSession() } catch (e) { setError(e.message); setAiOpen(false) } finally { setAiBusy(false) }
          }
        }
        const nav = h('nav', { className: 'fcw-nav', 'aria-label': t('folders') },
          h('section', null, h('h2', null, t('folders')),
            !state?.folders?.length && h('p', { className: 'fcw-muted' }, t('noFolders')),
            (state?.folders || []).map((f) => h('div', { key: f.path, className: 'fcw-item' },
              h('div', { className: 'fcw-path' }, f.path),
              h('div', { className: 'fcw-row' },
                h('button', { type: 'button', className: 'fcw-btn fcw-primary', disabled: busy || running || !state?.ffmpeg?.found, onClick: () => scan(f.path) }, t('scan')),
                h('button', { type: 'button', className: 'fcw-btn', disabled: busy, onClick: () => removeFolder(f.path) }, t('remove')))))),
          h('section', null, h('h2', null, t('jobs')),
            !state?.jobs?.length && h('p', { className: 'fcw-muted' }, t('noJobs')),
            (state?.jobs || []).map((j) => h('div', { key: j.id, className: 'fcw-item', 'aria-current': j.id === jobId },
              h('button', { type: 'button', className: 'fcw-link', onClick: () => setJobId(j.id) },
                h('div', { className: 'fcw-path' }, j.folder?.split(/[\\/]/).filter(Boolean).pop() || j.folder),
                h('div', { className: 'fcw-muted' }, `${new Date(j.createdAt).toLocaleString()} · ${t(`status_${j.status}`)}`),
                j.summary && h('div', { className: 'fcw-muted' }, `A ${j.summary.A.count} · B ${j.summary.B.count} · C ${j.summary.C.count}`))))))
        return h('div', { className: 'fcw', ref: rootRef, 'data-narrow': narrow ? '' : undefined, style: { position: 'relative' } },
          h('header', { className: 'fcw-bar', 'data-dsh-workbench-toolbar': '' },
            h('h1', null, t('title')), h('span', { className: 'fcw-sub' }, t('subtitle')),
            h('button', { type: 'button', className: 'fcw-btn fcw-primary', disabled: busy, onClick: addFolder }, t('addFolder')),
            h('button', { type: 'button', className: 'fcw-btn', onClick: () => setShowSettings(true) }, t('settings')),
            h('button', { type: 'button', className: 'fcw-btn', 'aria-pressed': aiOpen, disabled: aiBusy, onClick: toggleAi }, aiBusy ? t('aiStarting') : aiOpen ? t('aiClose') : t('ai'))),
          h('div', { className: 'fcw-body' },
            nav,
            h('main', { className: 'fcw-main' },
              error && h('div', { className: 'fcw-warn', role: 'alert' }, error),
              state && !state.ffmpeg?.found && h('div', { className: 'fcw-warn', role: 'alert' }, t('ffmpegMissing')),
              !state && !error && h('p', { className: 'fcw-live', role: 'status' }, t('loading')),
              jobId ? h(JobView, { key: jobId, t, lang, jobId, pickDirectory, onChanged: () => refresh() }) : state && h('p', { className: 'fcw-muted' }, t('pickJob'))),
            aiOpen && h('aside', { className: 'fcw-chat', 'aria-label': t('ai') }, conversation)),
          showSettings && h(SettingsDialog, { t, onClose: () => { setShowSettings(false); refresh() } }))
      }
    }

    function apply(ctx) {
      ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'footage-culler locale')
      ctx.effect(() => {
        if (document.getElementById('dsh-footage-culler-css')) return () => {}
        const style = document.createElement('style')
        style.id = 'dsh-footage-culler-css'
        style.dataset.pluginCss = 'dsh-footage-culler'
        style.textContent = css
        document.head.appendChild(style)
        return () => style.remove()
      }, 'footage-culler styles')
      const Panel = makePanel(ctx)
      ctx.effect(() => ctx.desktopWorkbenches.register({
        title: '素材清洗台',
        repository: REPOSITORY,
        description: '本地检测技术问题，可选 AI 静帧复审；按 A/B/C 标注片段，支持人工改判和剪辑时间线导出。',
        panelTitle: '素材清洗台',
        audience: '广告导演、剪辑师、制片',
        customFrame: true,
        headerLayout: 'compact',
      }, Panel), 'footage-culler workbench')
    }

    return { apply, inject: ['desktopWorkbenches', 'locale', 'uiWorkspace'] }
  },
})
