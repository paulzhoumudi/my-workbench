import { h, Fragment, useState, useEffect, useCallback } from './react.js'
import { get, post, pct, clock, fileUrl, fmtDuration } from './api.js'
import { Confirm, Modal, Empty, JobBar } from './ui.jsx'

const REASON_LABEL = { blur: '画面模糊/失焦', shake: '剧烈抖动', short: '时长过短', black: '黑屏/误触拍摄', duplicate: '重复镜头' }

export function MaterialTab({ overview, projectId, notify, ask, running, onCancelJob }) {
  const report = overview.material.report
  const tags = overview.material.tags
  const status = overview.status
  const [confirm, setConfirm] = useState(null)
  const [showAll, setShowAll] = useState(false)
  const [filter, setFilter] = useState({ kind: 'all', tag: null })

  const run = async (step, extra = {}) => {
    try {
      const { job, joined } = await post('/media/run', { project: projectId, step, ...extra })
      notify(joined ? `${job.label}已在进行中` : `已开始：${job.label}`)
    } catch (e) { notify(e.message) }
  }
  const confirmRun = (step, impact, label, extra) => setConfirm({ impact, label, run: () => post('/media/run', { project: projectId, step, ...extra }).then(({ job }) => notify(`已开始：${job.label}`)) })
  const ffOk = status.ffmpeg.ok
  const eagleOk = status.eagle.connected
  const pendingCount = report.pending
  const untagged = report.tagging.untagged
  const maxReason = Math.max(1, ...Object.values(report.reasons))
  const details = showAll ? report.details : report.details.slice(0, 6)
  const restore = (d) => setConfirm({ impact: `恢复 ${d.rawId}（${d.reason}：${d.evidence}）。恢复后会保留它，并需要重新切片。`, label: '恢复', run: async () => { await post('/media/restore', { project: projectId, rawIds: [d.rawId] }); notify(`已恢复 ${d.rawId}，记得重新切片`) } })
  const ttl = (t) => (t === 'eagle' ? 'Eagle 未连接：请先打开 Eagle' : !ffOk ? '未检测到 FFmpeg，请在设置里配置' : undefined)

  return (
    <Fragment>
      {!ffOk ? <div className="dmw-banner bad" role="alert"><span className="grow">未检测到 FFmpeg / ffprobe，导入、清洗、切片和出片都需要它。Windows 可运行 <code>winget install Gyan.FFmpeg</code> 安装，然后重启 DSH Desktop；或在右上角 ⚙ 设置里填写 ffmpeg.exe 路径。</span></div> : null}
      <div className="dmw-sec dmw-actions">
        <button type="button" className="dmw-btn pri" disabled={!ffOk} title={ttl()} onClick={() => run('import')}>导入素材</button>
        <button type="button" className="dmw-btn" disabled={!ffOk || (!pendingCount && !report.imported)} title={ttl()} onClick={() => pendingCount
          ? confirmRun('clean', `清洗 ${pendingCount} 条待处理原片。判定丢弃的只做登记，原片不移动、不删除，可一键恢复。`, '开始清洗')
          : confirmRun('clean', `按当前规则重新评估全部 ${report.imported} 条原片（你手动恢复过的不会再被丢弃）。`, '重新清洗', { force: true })}>{pendingCount ? `清洗（${pendingCount} 条待处理）` : '重新清洗'}</button>
        <button type="button" className="dmw-btn" disabled={!ffOk || !report.kept} title={ttl()} onClick={() => run('split')}>镜头切片</button>
        <button type="button" className="dmw-btn" disabled={!report.clips} onClick={() => ask(untagged ? `给 ${untagged} 条未打标切片打标：先抽关键帧，看图后只从标签字典里选` : '检查待复核的切片，给出修改建议')}>{untagged ? `AI 打标（${untagged} 条）` : 'AI 复核建议'}</button>
        <button type="button" className="dmw-btn" disabled={!eagleOk || !report.clips} title={ttl(eagleOk ? null : 'eagle')} onClick={() => confirmRun('eagle-push', `同步 Eagle：新增 ${report.clips - report.eagleSynced} 条代理切片（会复制进 Eagle 资料库），更新 ${report.eagleDirty} 条已改标签。`, '同步')}>同步到 Eagle</button>
        <button type="button" className="dmw-btn ghost" disabled={!eagleOk || !overview.project.eagle.folderId} title={ttl(eagleOk ? null : 'eagle')} onClick={() => confirmRun('eagle-pull', `从 Eagle 拉取标签，会改写本地 ${report.eagleSynced} 条已入库切片中被你在 Eagle 里改过的标签。`, '拉取')}>从 Eagle 拉取</button>
      </div>
      {running ? <div className="dmw-sec"><JobBar job={running} onCancel={onCancelJob} /></div> : null}

      <div className="dmw-sec">
        <h3 className="dmw-h3">清洗报告 <span className="sub">· {report.lastCleanAt ? `最近一次运行 ${clock(report.lastCleanAt)}` : '还没有运行清洗'} · 规则版本 {report.rulesVersion}</span></h3>
        {!report.balanced ? <div className="dmw-banner bad" role="alert">统计不平：保留 + 丢弃 + 待清洗 ≠ 导入，请重新导入。</div> : null}
        <div className="dmw-stats">
          <div className="dmw-stat"><div className="n">{report.imported}</div><div className="l">导入原片（条）{report.pending ? ` · 待清洗 ${report.pending}` : ''}</div></div>
          <div className="dmw-stat g"><div className="n">{report.kept}</div><div className="l">保留（{pct(report.kept, report.imported)}）</div></div>
          <div className="dmw-stat r"><div className="n">{report.rejected}</div><div className="l">丢弃（{pct(report.rejected, report.imported)}）</div></div>
          <div className="dmw-stat"><div className="n">{report.clips}</div><div className="l">镜头切片（条）</div></div>
          <div className="dmw-stat"><div className="n">{report.eagleSynced}</div><div className="l">已入 Eagle{report.eagleMissing ? ` · 缺失 ${report.eagleMissing}` : ''}</div></div>
        </div>
        {report.unsupported?.length ? <details style={{ marginTop: 8 }}><summary className="dmw-muted" style={{ cursor: 'pointer' }}>无法识别 {report.unsupported.length} 个文件（不计入丢弃）</summary>
          <ul className="dmw-muted">{report.unsupported.map((u) => <li key={u.path}>{u.path} — {u.reason}</li>)}</ul></details> : null}
        {report.missing ? <div className="dmw-muted" style={{ marginTop: 6 }}>{report.missing} 条原片已不在磁盘上（未计入统计）</div> : null}
      </div>

      <div className="dmw-grid2 dmw-sec">
        <div className="dmw-box">
          <h3 className="dmw-h3">丢弃原因分布 <span className="sub">（{report.rejected} 条）</span></h3>
          {Object.entries(REASON_LABEL).map(([code, label]) => (
            <div className="dmw-reason" key={code}>
              <span>{label}</span>
              <span className="track"><span className="fill" style={{ display: 'block', width: `${(report.reasons[code] / maxReason) * 100}%` }} /></span>
              <span className="v">{report.reasons[code] || 0}</span>
            </div>
          ))}
          <div className="dmw-muted" style={{ marginTop: 8 }}>丢弃 ≠ 删除：只做登记，原片留在原处，可随时恢复</div>
        </div>
        <div className="dmw-box">
          <h3 className="dmw-h3">丢弃明细 {report.details.length > 6 ? <span className="right"><button type="button" className="dmw-link" onClick={() => setShowAll(!showAll)}>{showAll ? '收起' : `全部 ${report.details.length} 条`}</button></span> : null}</h3>
          {report.details.length ? (
            <div className="dmw-tablewrap"><table className="dmw-table">
              <thead><tr><th>文件</th><th>原因</th><th>依据</th><th /></tr></thead>
              <tbody>{details.map((d) => (
                <tr key={d.rawId}><td className="nowrap" title={d.file}>{d.file.split('/').pop()}</td><td className="nowrap">{d.reason}</td><td>{d.evidence}</td>
                  <td><button type="button" className="dmw-btn sm" onClick={() => restore(d)}>恢复</button></td></tr>
              ))}</tbody>
            </table></div>
          ) : <div className="dmw-muted">没有丢弃的原片</div>}
        </div>
      </div>

      <div className="dmw-sec dmw-muted">
        打标质量：AI 标签 {report.tagging.aiTags.toLocaleString()} 个，切片 {report.clips} 条中已打标 {report.tagging.tagged}、待复核 {report.tagging.needsReview}、人工已复核 {report.tagging.reviewed}
        {report.tagging.adoption !== null ? `，采纳率 ${Math.round(report.tagging.adoption * 100)}%（${report.tagging.adoptionSample} 条复核样本口径）` : '，复核后显示采纳率'}
        。标签字典在「标签」页管理{tags.pending.length ? `（有 ${tags.pending.length} 个待审标签）` : ''}。
      </div>

      <ClipGrid projectId={projectId} filter={filter} setFilter={setFilter} revision={overview.revision} dims={tags.dims} notify={notify} total={report.clips} />

      {confirm ? <Confirm impact={confirm.impact} confirmLabel={confirm.label} onConfirm={confirm.run} onClose={() => setConfirm(null)} /> : null}
    </Fragment>
  )
}

export function ClipGrid({ projectId, filter, setFilter, revision, dims, notify, total, embedded = false }) {
  const [data, setData] = useState(null)
  const [reviewing, setReviewing] = useState(null)
  useEffect(() => {
    let cancelled = false
    const params = { project: projectId, limit: 300 }
    if (filter.kind === 'tag') params.tag = filter.tag
    else if (filter.kind !== 'all') params.filter = filter.kind
    get('/clips', params).then((d) => { if (!cancelled) setData(d) }).catch(() => {})
    return () => { cancelled = true }
  }, [projectId, filter.kind, filter.tag, revision])
  if (!total) return <div className="dmw-sec dmw-box"><h3 className="dmw-h3">切片复核</h3><Empty title="还没有切片">导入 → 清洗 → 切片后，这里会显示切片缩略图，可以逐条复核标签。</Empty></div>
  const pills = [['all', '全部'], ['review', '待复核'], ['untagged', '未打标'], ['reviewed', '已复核']]
  const clips = data?.clips || []
  return (
    <div className={embedded ? 'dmw-clipgrid-embedded' : 'dmw-sec dmw-box'}>
      {embedded ? null : <h3 className="dmw-h3">切片复核 <span className="sub">· 点缩略图复核标签，键盘 ← → 切换，Enter 确认</span></h3>}
      {embedded ? null : <div className="dmw-pills">
        {pills.map(([kind, label]) => <button type="button" key={kind} className="dmw-pill" aria-pressed={filter.kind === kind} onClick={() => setFilter({ kind, tag: null })}>{label}</button>)}
        {filter.tag ? <button type="button" className="dmw-pill" aria-pressed="true" onClick={() => setFilter({ kind: 'all', tag: null })}>标签：{filter.tag} ✕</button> : null}
        <span className="dmw-muted" style={{ alignSelf: 'center' }}>{data ? `${data.total} 条` : ''}</span>
      </div>}
      {data && !clips.length ? <div className="dmw-muted">没有符合条件的切片</div> : null}
      <div className="dmw-grid">
        {clips.map((clip, i) => <ClipCard key={clip.id} clip={clip} projectId={projectId} onOpen={() => setReviewing(i)} />)}
      </div>
      {data && data.total > clips.length ? <div className="dmw-muted" style={{ marginTop: 8 }}>只显示前 {clips.length} 条，可用标签或状态筛选</div> : null}
      {reviewing !== null && clips[reviewing] ? (
        <ReviewDialog clip={clips[reviewing]} index={reviewing} count={clips.length} projectId={projectId} dims={dims} notify={notify}
          onMove={(delta) => setReviewing(Math.max(0, Math.min(clips.length - 1, reviewing + delta)))} onClose={() => setReviewing(null)} />
      ) : null}
    </div>
  )
}

function ClipCard({ clip, projectId, onOpen }) {
  const low = new Set((clip.aiTags || []).filter((t) => t.confidence < 0.6).map((t) => t.tag))
  const state = clip.reviewed ? ['ok', '已复核'] : clip.needsReview ? ['warn', '待复核'] : clip.tagStatus === 'tagged' ? ['', 'AI 已打标'] : ['bad', '未打标']
  return (
    <button type="button" className="dmw-clip" onClick={onOpen} aria-label={`${clip.id}，${state[1]}，${(clip.tags || []).join('、')}`}>
      {clip.thumb ? <img src={fileUrl(projectId, clip.thumb)} alt="" loading="lazy" /> : <div className="ph" />}
      <div className="meta">
        <div className="id"><span className={`dmw-dot ${state[0]}`} title={state[1]} /><span>{clip.id}</span><span className="dmw-muted" style={{ marginLeft: 'auto' }}>{fmtDuration(clip.duration)}</span></div>
        <div className="tags">
          {(clip.tags || []).map((t) => <span key={t} className={`dmw-mini${low.has(t) ? ' low' : ''}`}>{t}</span>)}
          {(clip.pendingTags || []).map((p) => <span key={`p-${p.tag}`} className="dmw-mini pend">{p.tag}?</span>)}
        </div>
      </div>
    </button>
  )
}

function ReviewDialog({ clip, index, count, projectId, dims, notify, onMove, onClose }) {
  const [selected, setSelected] = useState(new Set(clip.tags || []))
  const [busy, setBusy] = useState(false)
  useEffect(() => { setSelected(new Set(clip.tags || [])) }, [clip.id])
  const confidence = Object.fromEntries((clip.aiTags || []).map((t) => [t.tag, t.confidence]))
  const save = useCallback(async (advance) => {
    setBusy(true)
    try {
      await post('/clips/review', { project: projectId, clipId: clip.id, tags: [...selected] })
      notify(`${clip.id} 已复核`)
      if (advance && index < count - 1) onMove(1)
    } catch (e) { notify(e.message) }
    setBusy(false)
  }, [selected, clip.id, index, count])
  const onKey = (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'VIDEO') return
    if (e.key === 'ArrowRight') { e.preventDefault(); onMove(1) }
    if (e.key === 'ArrowLeft') { e.preventDefault(); onMove(-1) }
    if (e.key === 'Enter' && e.target.tagName !== 'BUTTON') { e.preventDefault(); save(true) }
  }
  const toggle = (tag) => { const next = new Set(selected); if (next.has(tag)) next.delete(tag); else next.add(tag); setSelected(next) }
  return (
    <Modal title={`复核 ${clip.id}（${index + 1}/${count}）`} wide onClose={onClose} busy={busy} footer={<Fragment>
      <button type="button" className="dmw-btn" onClick={() => onMove(-1)} disabled={index === 0 || busy}>← 上一条</button>
      <button type="button" className="dmw-btn" onClick={() => onMove(1)} disabled={index >= count - 1 || busy}>下一条 →</button>
      <button type="button" className="dmw-btn pri" onClick={() => save(true)} disabled={busy}>确认复核（Enter）</button>
    </Fragment>}>
      <div className="dmw-review" onKeyDown={onKey}>
        <div>
          <video key={clip.id} src={fileUrl(projectId, clip.proxy)} poster={clip.thumb ? fileUrl(projectId, clip.thumb) : undefined} controls muted playsInline />
          <div className="dmw-muted" style={{ marginTop: 6 }}>原片 {clip.raw} · 入点 {clip.start}s · 出点 {clip.end}s · {fmtDuration(clip.duration)}{clip.tagModel ? ` · 打标模型 ${clip.tagModel}` : ''}</div>
          {clip.transcript ? <div style={{ marginTop: 6 }}>转写：{clip.transcript}</div> : null}
        </div>
        <div>
          {dims.map((dim) => (
            <div className="dmw-tagdim" key={dim.dim}>
              <div className="dn">{dim.dim}</div>
              {dim.tags.map((t) => (
                <button type="button" key={t.tag} className={`dmw-tag${selected.has(t.tag) ? '' : ' tpl'}${confidence[t.tag] !== undefined && confidence[t.tag] < 0.6 ? ' low' : ''}`} aria-pressed={selected.has(t.tag)} onClick={() => toggle(t.tag)}>
                  {t.tag}{confidence[t.tag] !== undefined ? <i>{Math.round(confidence[t.tag] * 100)}%</i> : null}
                </button>
              ))}
            </div>
          ))}
          {clip.pendingTags?.length ? <div className="dmw-muted">AI 建议的字典外标签：{clip.pendingTags.map((p) => p.tag).join('、')}（到「待审」里转正后可选）</div> : null}
        </div>
      </div>
    </Modal>
  )
}
