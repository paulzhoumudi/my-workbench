import { h, Fragment, useEffect, useRef, useState, useCallback } from './react.js'

/** Accessible modal: focus trap, Esc, backdrop click; cannot close while busy. */
export function Modal({ title, onClose, busy = false, wide = false, children, footer, labelledBy }) {
  const ref = useRef(null)
  const previous = useRef(null)
  useEffect(() => {
    previous.current = document.activeElement
    const node = ref.current
    const first = node?.querySelector('input,select,textarea,button:not(.x),[tabindex]:not([tabindex="-1"])')
    ;(first || node)?.focus()
    return () => { try { previous.current?.focus?.() } catch { /* element gone */ } }
  }, [])
  const onKey = (event) => {
    if (event.key === 'Escape' && !busy) { event.stopPropagation(); onClose?.() }
    if (event.key === 'Tab') {
      const items = [...ref.current.querySelectorAll('a[href],button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),[tabindex]:not([tabindex="-1"])')].filter((el) => el.offsetParent !== null)
      if (!items.length) return
      const first = items[0]
      const last = items[items.length - 1]
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
    }
  }
  const id = labelledBy || `dmw-modal-${title}`
  return (
    <div className="dmw-overlay" data-dsh-no-drag="" onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) onClose?.() }}>
      <div className={`dmw-modal${wide ? ' wide' : ''}`} role="dialog" aria-modal="true" aria-labelledby={id} ref={ref} tabIndex={-1} onKeyDown={onKey}>
        <header><span id={id}>{title}</span><button type="button" className="dmw-iconbtn x" aria-label="关闭" disabled={busy} onClick={onClose}>✕</button></header>
        <div className="content">{children}</div>
        {footer ? <footer>{footer}</footer> : null}
      </div>
    </div>
  )
}

/** Confirmation card for risky actions — states the impact (P3 / FR-42). */
export function Confirm({ title = '需要确认', impact, confirmLabel = '确认执行', danger = false, onConfirm, onClose }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const run = async () => {
    setBusy(true)
    setError(null)
    try { await onConfirm(); onClose() } catch (e) { setError(e.message); setBusy(false) }
  }
  return (
    <Modal title={title} onClose={onClose} busy={busy} footer={<Fragment>
      <button type="button" className="dmw-btn" onClick={onClose} disabled={busy}>取消</button>
      <button type="button" className={`dmw-btn pri${danger ? ' danger' : ''}`} onClick={run} disabled={busy}>{busy ? '执行中…' : confirmLabel}</button>
    </Fragment>}>
      <div style={{ lineHeight: 1.7 }}>{impact}</div>
      {error ? <div className="dmw-banner bad" role="alert" style={{ marginTop: 10, marginBottom: 0 }}>{error}</div> : null}
    </Modal>
  )
}

export function Progress({ value, total, label }) {
  const ratio = total ? Math.max(0, Math.min(1, value / total)) : 0
  return <div className="dmw-progress" role="progressbar" aria-valuemin={0} aria-valuemax={total || 100} aria-valuenow={value || 0} aria-label={label}><div style={{ width: `${Math.round(ratio * 100)}%` }} /></div>
}

export function useToast() {
  const [toast, setToast] = useState(null)
  const timer = useRef(null)
  const show = useCallback((text, ms = 3200) => {
    clearTimeout(timer.current)
    setToast(text)
    timer.current = setTimeout(() => setToast(null), ms)
  }, [])
  useEffect(() => () => clearTimeout(timer.current), [])
  const node = toast ? <div className="dmw-toast" role="status" aria-live="polite">{toast}</div> : null
  return [node, show]
}

/** Close a popover on outside click / Esc. */
export function useDismiss(open, setOpen, ref) {
  useEffect(() => {
    if (!open) return
    const onDown = (event) => { if (ref.current && !ref.current.contains(event.target)) setOpen(false) }
    const onKey = (event) => { if (event.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey) }
  }, [open, setOpen, ref])
}

export function Empty({ title, children, action }) {
  return <div className="dmw-empty"><b>{title}</b>{children ? <div>{children}</div> : null}{action || null}</div>
}

export function JobBar({ job, onCancel }) {
  if (!job) return null
  const eta = job.etaSeconds ? `预计剩余 ${job.etaSeconds < 60 ? `${job.etaSeconds} 秒` : `${Math.round(job.etaSeconds / 60)} 分钟`}` : ''
  const unit = job.kind?.startsWith('render') || job.kind === 'split' ? '秒' : '条'
  return (
    <div className="dmw-job" aria-live="polite">
      <b>{job.label}</b>
      <span className="dmw-muted">{job.status === 'queued' ? '排队中' : `${job.done ?? 0}/${job.total ?? 0} ${unit}`}{eta ? ` · ${eta}` : ''}</span>
      <Progress value={job.done} total={job.total} label={job.label} />
      {job.current ? <span className="dmw-muted" style={{ maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{job.current}</span> : null}
      {onCancel ? <button type="button" className="dmw-btn sm" onClick={() => onCancel(job)}>取消</button> : null}
    </div>
  )
}
