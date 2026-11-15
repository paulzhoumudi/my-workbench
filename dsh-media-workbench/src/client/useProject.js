import { useEffect, useRef, useState, useCallback } from './react.js'
import { get } from './api.js'

/**
 * Overview for one project with ≤1 s refresh (P2): poll the cheap revision
 * counter every second while visible; refetch the overview only on change.
 */
export function useOverview(projectId, active) {
  const [state, setState] = useState({ data: null, error: null, loading: false })
  const [running, setRunning] = useState(null)
  const revision = useRef(-1)
  const seq = useRef(0)

  const load = useCallback(async () => {
    if (!projectId) return
    const mine = ++seq.current
    setState((s) => ({ ...s, loading: !s.data }))
    try {
      const data = await get('/overview', { project: projectId })
      if (mine !== seq.current) return
      revision.current = data.revision
      setRunning(data.jobs?.running || null)
      setState({ data, error: null, loading: false })
    } catch (error) {
      if (mine !== seq.current) return
      setState((s) => ({ data: error.code === 'PATH_MISSING' || error.code === 'NO_PROJECT' ? null : s.data, error, loading: false }))
    }
  }, [projectId])

  useEffect(() => {
    revision.current = -1
    setState({ data: null, error: null, loading: Boolean(projectId) })
    setRunning(null)
    if (projectId) load()
  }, [projectId, load])

  useEffect(() => {
    if (!projectId || !active) return
    let stopped = false
    let timer
    const controller = new AbortController()
    const tick = async () => {
      if (stopped) return
      if (document.visibilityState !== 'hidden') {
        try {
          const r = await get('/revision', { project: projectId }, controller.signal)
          setRunning(r.running || null)
          if (r.revision !== revision.current) await load()
        } catch { /* transient: next tick retries */ }
      }
      if (!stopped) timer = setTimeout(tick, 1000)
    }
    timer = setTimeout(tick, 1000)
    return () => { stopped = true; clearTimeout(timer); controller.abort() }
  }, [projectId, active, load])

  return { ...state, running, reload: load }
}
