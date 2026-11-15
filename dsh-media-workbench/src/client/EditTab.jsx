import { h, Fragment, useState, useEffect } from './react.js'
import { post, fileUrl, clock, fmtDuration, fmtSize, get } from './api.js'
import { Markdown } from './markdown.jsx'
import { Confirm, Empty, JobBar, Modal } from './ui.jsx'

const SUBS = { 'burn+srt': '烧录 + 导出 SRT', srt: '只导出 SRT', burn: '只烧录', none: '不要字幕' }
const ENGINES = { ffmpeg: 'FFmpeg 直出 MP4', jianying: '剪映草稿（可精修）', both: '两者都要' }
const ASPECTS = [['16:9', '横屏 16:9'], ['9:16', '竖屏 9:16'], ['1:1', '方形 1:1']]

/** Number input that saves on blur / Enter; empty means "not set". */
function TargetInput({ value, onCommit }) {
  const [text, setText] = useState(value ? String(value) : '')
  useEffect(() => { setText(value ? String(value) : '') }, [value])
  const commit = () => {
    const n = Number(text)
    const next = text.trim() === '' ? null : Number.isFinite(n) && n > 0 ? Math.round(n) : value
    if (next !== (value || null)) onCommit(next)
    else setText(value ? String(value) : '')
  }
  return <input aria-label="目标时长" type="number" min="1" max="7200" placeholder="未设置" value={text} onChange={(e) => setText(e.target.value)} onBlur={commit} onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur() }} style={{ width: 80 }} />
}

export function EditTab({ overview, projectId, notify, ask, running, onCancelJob, onReveal, onInfo }) {
  const { spec, options, match, staleMatch, timeline, exports: outputs, idea } = overview.edit
  const docs = overview.creative.docs
  const script = docs.find((d) => d.key === '02_文案.md')
  const board = overview.storyboard
  const [confirm, setConfirm] = useState(null)
  const [expanded, setExpanded] = useState(null)
  const [player, setPlayer] = useState(null)
  const [busy, setBusy] = useState(null)
  const ffOk = overview.status.ffmpeg.ok

  const setSpec = async (patch) => {
    try { await post('/edit/spec', { project: projectId, spec: { ...spec, ...patch } }) } catch (e) { notify(e.message) }
  }
  const act = async (name, path, body = {}, message) => {
    setBusy(name)
    try {
      const r = await post(path, { project: projectId, ...body })
      if (message) notify(typeof message === 'function' ? message(r) : message)
      return r
    } catch (e) { notify(e.message) } finally { setBusy(null) }
  }
  const render = (kind) => post('/media/run', { project: projectId, step: kind === 'final' ? 'render-final' : 'render-preview' }).then(({ job }) => notify(`已开始：${job.label}`)).catch((e) => notify(e.message))
  const res = options.resolutions[spec.resolution]
  const total = board?.total || 0

  return (
    <Fragment>
      {staleMatch ? <div className="dmw-banner warn" role="status"><span className="grow">分镜已更新为 v{board.version}（匹配结果基于 v{match.storyboardVersion}），需要重新匹配。</span>
        <button type="button" className="dmw-btn sm" onClick={() => act('match', '/edit/match', {}, (r) => r && `已重新匹配：${r.matched}/${r.total} 镜`)}>重新匹配</button></div> : null}
      {board && !board.missing && board.editUse && board.currentVersion !== board.editUse ? <div className="dmw-banner info" role="status">分镜当前是 v{board.currentVersion}，剪辑仍在用「剪辑使用版本」v{board.editUse}。需要换版本请到创意模块点「设为剪辑使用版本」。</div> : null}
      <div className="dmw-grid2 dmw-sec">
        <div className="dmw-box">
          <h3 className="dmw-h3">输出规格 <span className="sub">· 创意剪辑/剪辑数据/edit_spec.json</span></h3>
          <div className="dmw-kv">
            <span>画幅</span><span><span className="dmw-seg" role="group" aria-label="画幅">{ASPECTS.map(([a, label]) => (
              <button type="button" key={a} aria-pressed={res?.aspect === a} onClick={() => { if (res?.aspect !== a) setSpec({ resolution: Object.keys(options.resolutions).find((k) => options.resolutions[k].aspect === a) }) }}>{label}</button>
            ))}</span></span>
            <span>分辨率</span><span><select aria-label="分辨率" value={spec.resolution} onChange={(e) => setSpec({ resolution: e.target.value })}>{Object.entries(options.resolutions).filter(([, v]) => v.aspect === res?.aspect).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select></span>
            <span>帧率</span><span><select aria-label="帧率" value={spec.fps} onChange={(e) => setSpec({ fps: Number(e.target.value) })}>{options.fps.map((f) => <option key={f} value={f}>{f} fps</option>)}</select></span>
            <span>编码 / 码率</span><span style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
              <select aria-label="编码" value={spec.codec} onChange={(e) => setSpec({ codec: e.target.value })}><option value="h265">H.265</option><option value="h264">H.264</option></select>
              <input aria-label="码率" type="number" min="1" max="400" value={spec.bitrateMbps} onChange={(e) => setSpec({ bitrateMbps: Number(e.target.value) })} /> Mbps
              {spec.codec === 'h265' && !overview.status.ffmpeg.h265 && ffOk ? <span className="dmw-warn">本机 FFmpeg 无 H.265，会改用 H.264</span> : null}
            </span>
            <span>目标时长</span><span><TargetInput value={spec.targetDuration} onCommit={(v) => setSpec({ targetDuration: v })} /> 秒 {total ? <span className={spec.targetDuration && Math.abs(total - spec.targetDuration) > spec.targetDuration * 0.1 ? 'dmw-warn' : 'dmw-muted'}>（分镜合计 {total}s）</span> : null}
              {!spec.targetDuration ? <span className="dmw-muted" style={{ display: 'block', marginTop: 4 }}>未设置时，AI 写文案会按简报里的时长，或先问你</span> : null}</span>
            <span>字幕</span><span><select aria-label="字幕" value={spec.subtitles} onChange={(e) => setSpec({ subtitles: e.target.value })}>{Object.entries(SUBS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></span>
            <span>转场</span><span><select aria-label="转场" value={spec.transition} onChange={(e) => setSpec({ transition: e.target.value })}><option value="cut">硬切</option><option value="dissolve">场景切换处 0.5s 叠化</option></select></span>
            <span>输出引擎</span><span><select aria-label="输出引擎" value={spec.engine} onChange={(e) => setSpec({ engine: e.target.value })}>{Object.entries(ENGINES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></span>
          </div>
        </div>
        <div className="dmw-box">
          <h3 className="dmw-h3">剪辑思路 <span className="sub">· 关联 文案 {script?.exists ? `v${script.editUse || script.version}${script.editUse ? '（剪辑使用）' : ''}` : '—'} / 分镜 {board && !board.missing ? `v${board.version}${board.editUse ? '（剪辑使用）' : ''}` : '—'}</span></h3>
          {idea ? <div style={{ maxHeight: 260, overflow: 'auto' }}><Markdown text={idea.content.replace(/^#.*\n/, '')} /></div>
            : <Empty title="还没有剪辑思路" action={<button type="button" className="dmw-btn pri" onClick={() => ask('根据文案和分镜写剪辑思路：节奏、BGM 与 BPM、转场、配音方案')}>让 AI 写剪辑思路</button>}>节奏安排、BGM 与 BPM、转场策略、配音方案，保存在 创意剪辑/剪辑思路.md，可在创意模块里编辑。</Empty>}
        </div>
      </div>

      <div className="dmw-box dmw-sec">
        <h3 className="dmw-h3">分镜 × 素材匹配 <span className="sub">{match ? `· 已匹配 ${match.matched} / ${match.total} 镜${match.total - match.matched ? `，缺 ${match.total - match.matched} 镜` : ''} · ${clock(match.at)}` : ''}</span></h3>
        {!board || board.missing ? <Empty title="还没有分镜脚本" action={<button type="button" className="dmw-btn pri" onClick={() => ask('根据文案出分镜脚本，每镜都要写所需标签')}>让 AI 出分镜</button>}>匹配按分镜里每一镜的「所需标签」去素材库检索切片。</Empty>
          : !match ? <Empty title="还没有匹配" action={<button type="button" className="dmw-btn pri" disabled={!!busy} onClick={() => act('match', '/edit/match', {}, (r) => r && `匹配完成：${r.matched}/${r.total} 镜`)}>按分镜匹配素材</button>}>分镜 v{board.version} 共 {board.count} 镜，合计 {board.total}s。</Empty>
          : (
            <div className="dmw-tablewrap"><table className="dmw-table">
              <thead><tr><th>镜号</th><th>时长</th><th>画面 / 台词</th><th>所需标签</th><th>匹配素材（Top1）</th><th>状态</th></tr></thead>
              <tbody>{match.shots.map((shot) => {
                const top1 = shot.top.find((t) => t.clipId === shot.selected)
                return (
                  <tr key={shot.no} className={shot.warnings?.length ? 'warn' : undefined}>
                    <td className="nowrap">{shot.no}</td>
                    <td className="nowrap">{shot.duration}s</td>
                    <td style={{ minWidth: 160 }}>{shot.desc}{shot.line ? <span className="dmw-muted"> ·「{shot.line}」</span> : ''}</td>
                    <td style={{ minWidth: 100 }}>{shot.required.join(' ') || <span className="dmw-warn">缺所需标签</span>}</td>
                    <td style={{ minWidth: 170 }}>
                      {shot.selected ? <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}><img className="dmw-match-thumb" alt="" src={fileUrl(projectId, `.dsh/cache/thumbs/${shot.selected}.jpg`)} /> {shot.selected}<span className="dmw-muted">（{top1?.score ?? '手选'}）</span></span> : '—'}
                      {shot.top.length ? <div><button type="button" className="dmw-link" aria-expanded={expanded === shot.no} onClick={() => setExpanded(expanded === shot.no ? null : shot.no)}>{expanded === shot.no ? '收起' : `Top${Math.min(3, shot.top.length)} 替换`}</button></div> : null}
                      {expanded === shot.no ? <div className="dmw-top3">
                        {shot.top.map((t) => <button type="button" key={t.clipId} aria-pressed={t.clipId === shot.selected} onClick={() => act('select', '/edit/select', { no: shot.no, clipId: t.clipId }, `镜 ${shot.no} 改用 ${t.clipId}`)}>
                          <img className="dmw-match-thumb" alt="" src={fileUrl(projectId, `.dsh/cache/thumbs/${t.clipId}.jpg`)} />
                          <span>{t.clipId}<br /><span className="dmw-muted">{t.score ?? '手选'} · {fmtDuration(t.duration)}{t.short ? ' · 时长不足' : ''}{t.missing?.length ? ` · 缺 ${t.missing.join(' ')}` : ''}</span></span>
                        </button>)}
                        {shot.selected ? <button type="button" onClick={() => act('select', '/edit/select', { no: shot.no, clipId: '' }, `已清空镜 ${shot.no}`)}>不使用素材（列入缺口）</button> : null}
                      </div> : null}
                    </td>
                    <td className={shot.status === 'matched' ? 'dmw-ok nowrap' : shot.status === 'short' ? 'dmw-warn nowrap' : 'dmw-bad'}>{shot.status === 'matched' ? (shot.manual ? '已匹配（手选）' : '已匹配') : shot.status === 'short' ? '时长不足' : `缺素材${shot.note ? ` · ${shot.note}` : ''}`}</td>
                  </tr>
                )
              })}</tbody>
            </table></div>
          )}
        {board && !board.missing ? <div className="dmw-actions" style={{ marginTop: 10 }}>
          {match ? <button type="button" className="dmw-btn" disabled={!!busy} onClick={() => act('match', '/edit/match', {}, (r) => r && `已重新匹配：${r.matched}/${r.total} 镜`)}>重新匹配</button> : null}
          <button type="button" className="dmw-btn" disabled={!match || !!busy} onClick={() => act('gaps', '/edit/gaps', {}, (r) => r && `缺口清单已导出：${r.count} 镜 → ${r.file}`)}>导出缺口清单</button>
          <button type="button" className="dmw-btn" disabled={!match?.matched || !!busy} onClick={() => act('timeline', '/edit/timeline', {}, (r) => r && `时间线已生成：${r.segments} 段，${r.duration}s`)}>生成时间线</button>
          <button type="button" className="dmw-btn" disabled={!timeline || !ffOk} onClick={() => render('preview')}>FFmpeg 粗剪预览</button>
          <button type="button" className="dmw-btn pri" disabled={!timeline || !ffOk} onClick={() => setConfirm({ impact: `正式渲染：${res?.label} · ${spec.fps}fps · ${spec.codec.toUpperCase()} ${spec.bitrateMbps}Mbps · 字幕${SUBS[spec.subtitles]}，时长约 ${timeline?.duration}s（${timeline?.segments} 段），用原片输出到「输出素材库/成片」，并写入 manifest.json。`, label: '开始渲染', run: () => render('final') })}>FFmpeg 直出</button>
          <button type="button" className="dmw-btn" title="剪映草稿适配器待验证接入" disabled={!timeline} onClick={() => post('/edit/capcut', { project: projectId }).catch((e) => onInfo({ title: '剪映草稿', text: e.message }))}>生成剪映草稿（待接入）</button>
          {timeline ? <span className="dmw-muted">时间线 {timeline.segments} 段 · {timeline.duration}s · {clock(timeline.at)}{timeline.warnings?.length ? ` · ${timeline.warnings.length} 条提示` : ''}</span> : null}
        </div> : null}
        {timeline?.warnings?.length ? <ul className="dmw-muted" style={{ margin: '8px 0 0', paddingLeft: 18 }}>{timeline.warnings.map((w) => <li key={w}>{w}</li>)}</ul> : null}
      </div>

      {running && running.kind?.startsWith('render') ? <div className="dmw-sec"><JobBar job={running} onCancel={onCancelJob} /></div> : null}

      <div className="dmw-box dmw-sec">
        <h3 className="dmw-h3">成片 <span className="sub">· 输出素材库/成片</span></h3>
        {outputs.length ? <div className="dmw-tablewrap"><table className="dmw-table">
          <thead><tr><th>文件</th><th>规格</th><th>时长</th><th>版本</th><th /></tr></thead>
          <tbody>{outputs.map((o) => (
            <tr key={o.name}>
              <td style={{ minWidth: 180 }}>{o.name}<div className="dmw-muted">{clock(o.at)} · {fmtSize(o.size)}{o.manifest?.kind === 'preview' ? ' · 粗剪预览' : ''}</div></td>
              <td className="nowrap">{o.manifest ? `${o.manifest.width}×${o.manifest.height} · ${o.manifest.fps}fps` : '—'}</td>
              <td className="nowrap">{o.manifest ? `${fmtDuration(o.manifest.duration)}${o.manifest.durationError !== undefined ? `（误差 ${o.manifest.durationError}s）` : ''}` : '—'}</td>
              <td className="nowrap">{o.manifest?.versions ? `文案 v${o.manifest.versions.scriptEditUse ?? o.manifest.versions.script ?? '—'} / 分镜 v${o.manifest.versions.storyboard}` : '—'}</td>
              <td className="nowrap"><button type="button" className="dmw-btn sm" onClick={() => setPlayer(o)}>播放</button> <button type="button" className="dmw-btn sm" onClick={() => onReveal(o.path)}>在文件夹中显示</button></td>
            </tr>
          ))}</tbody>
        </table></div> : <div className="dmw-muted">还没有成片。生成时间线后可以先出一版粗剪预览。</div>}
      </div>

      {confirm ? <Confirm impact={confirm.impact} confirmLabel={confirm.label} onConfirm={confirm.run} onClose={() => setConfirm(null)} /> : null}
      {player ? <Modal title={player.name} wide onClose={() => setPlayer(null)}>
        <video src={fileUrl(projectId, player.path)} controls autoPlay style={{ width: '100%', maxHeight: '65vh', background: '#000', borderRadius: 8 }} />
        {player.manifest?.notes?.length ? <ul className="dmw-muted">{player.manifest.notes.map((n) => <li key={n}>{n}</li>)}</ul> : null}
      </Modal> : null}
    </Fragment>
  )
}
