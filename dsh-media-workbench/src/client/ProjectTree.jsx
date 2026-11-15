import { h, Fragment, useState, useEffect, useCallback, useRef } from './react.js'
import { get, storage, fmtSize } from './api.js'

const ICON = { dir: '📁', md: '📄', yaml: '🏷️', yml: '🏷️', json: '🧾', srt: '💬', txt: '📄', mp4: '🎞️', mov: '🎞️', m4v: '🎞️', mts: '🎞️', jpg: '🖼️', jpeg: '🖼️', png: '🖼️', webp: '🖼️', mp3: '🎵', wav: '🎵' }
const extOf = (name) => (name.match(/\.([^.]+)$/)?.[1] || '').toLowerCase()

/**
 * The real project folder as a lazily expanded tree. Top-level libraries are
 * listed first; clicking a library also moves the AI conversation into it.
 * Versioned documents that do not exist yet appear greyed so they can be
 * generated from here.
 */
export function ProjectTree({ projectId, revision, docs, libraries, selectedPath, workingLibrary, switching, onSelect, onLibrary }) {
  const [children, setChildren] = useState({})
  const [expanded, setExpanded] = useState(() => new Set(storage.get(`tree:${projectId}`, ['创意剪辑'])))
  const [error, setError] = useState(null)
  const loading = useRef(new Set())

  const load = useCallback(async (path) => {
    if (loading.current.has(path)) return
    loading.current.add(path)
    try {
      const data = await get('/tree', { project: projectId, path })
      setChildren((prev) => ({ ...prev, [path]: data.items }))
      setError(null)
    } catch (e) {
      if (path === '') setError(e.message)
      else setChildren((prev) => ({ ...prev, [path]: [] }))
    } finally { loading.current.delete(path) }
  }, [projectId])

  // Initial load, and refresh every open folder when files change on disk.
  useEffect(() => { setChildren({}) }, [projectId])
  useEffect(() => {
    load('')
    for (const path of expanded) load(path)
  }, [projectId, revision])
  useEffect(() => { storage.set(`tree:${projectId}`, [...expanded]) }, [expanded, projectId])

  const toggle = (path) => {
    const next = new Set(expanded)
    if (next.has(path)) next.delete(path)
    else { next.add(path); load(path) }
    setExpanded(next)
  }

  const withVirtualDocs = (path, items) => {
    const present = new Set(items.map((i) => i.path))
    const missing = docs.filter((d) => !d.exists && d.path.slice(0, d.path.lastIndexOf('/')) === path && !present.has(d.path))
      .map((d) => ({ name: d.path.split('/').pop(), path: d.path, type: 'file', doc: d.key, missing: true }))
    return [...items, ...missing]
  }

  const docByKey = new Map(docs.map((d) => [d.key, d]))
  const libraryHint = new Map(libraries.map((l) => [l.dir, l.hint]))

  const renderItems = (path, depth) => {
    const items = children[path]
    if (!items) return <div className="dmw-tree-row muted" style={{ paddingLeft: 10 + depth * 14 }}>读取中…</div>
    const list = withVirtualDocs(path, items)
    if (!list.length) return <div className="dmw-tree-row muted" style={{ paddingLeft: 10 + depth * 14 }}>（空）</div>
    return list.map((item) => {
      const pad = { paddingLeft: 8 + depth * 14 }
      if (item.type === 'dir') {
        const open = expanded.has(item.path)
        const isLibrary = Boolean(item.library)
        const active = isLibrary && workingLibrary === item.library
        return (
          <Fragment key={item.path}>
            <button type="button" className={`dmw-tree-row dir${isLibrary ? ' lib' : ''}${active ? ' active' : ''}`} style={pad} aria-expanded={open}
              title={isLibrary ? `${libraryHint.get(item.library)} · 点击后右侧对话切换到这个文件夹` : item.path}
              onClick={() => { toggle(item.path); if (isLibrary && !open) onLibrary(item.library) }}>
              <span className="caret" aria-hidden="true">{open ? '▾' : '▸'}</span>
              <span aria-hidden="true">{ICON.dir}</span>
              <span className="n">{item.name}</span>
              {isLibrary ? (active ? <span className="dmw-ver use">{switching === item.library ? '切换中…' : '对话中'}</span> : switching === item.library ? <span className="dmw-ver">切换中…</span> : null) : null}
            </button>
            {isLibrary && open && !active ? (
              <button type="button" className="dmw-tree-row talk" style={{ paddingLeft: 8 + (depth + 1) * 14 }} onClick={() => onLibrary(item.library)}>💬 在「{item.library}」里对话</button>
            ) : null}
            {open ? renderItems(item.path, depth + 1) : null}
          </Fragment>
        )
      }
      const doc = item.doc ? docByKey.get(item.doc) : null
      return (
        <button type="button" key={item.path} className={`dmw-tree-row file${item.missing ? ' missing' : ''}`} style={pad} aria-current={selectedPath === item.path}
          title={item.size !== null && item.size !== undefined ? `${item.path} · ${fmtSize(item.size)}` : item.path}
          onClick={() => onSelect(item)}>
          <span className="caret" aria-hidden="true" />
          <span aria-hidden="true">{ICON[extOf(item.name)] || '📄'}</span>
          <span className="n">{item.name}</span>
          {doc ? (doc.exists ? <span className={`dmw-ver${doc.editUse ? ' use' : ''}`}>v{doc.version}{doc.editUse ? ' ✓' : ''}</span> : <span className="dmw-ver">未生成</span>) : null}
        </button>
      )
    })
  }

  return (
    <nav className="dmw-tree" aria-label="项目文件">
      {error ? <div className="dmw-banner bad" role="alert">{error}</div> : renderItems('', 0)}
    </nav>
  )
}
