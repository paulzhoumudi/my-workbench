import { useSyncExternalStore, useCallback } from './react.js'
import { normPath } from './api.js'

/**
 * Thin, defensive adapter over the Desktop workbench service handed to the
 * panel. Desktop owns session identity and ownership; the panel only asks it
 * to create/restore the session for a project folder (spec §5–6).
 */
const noop = () => () => {}

export function useHostSession(service, workbenches = service) {
  const ctx = service?.ctx
  const subscribe = useCallback((listener) => {
    const offs = [
      ctx?.sessions?.list?.subscribe?.(listener),
      ctx?.workspaces?.list?.subscribe?.(listener),
      service?.subscribe?.(listener)
    ].filter(Boolean)
    return () => offs.forEach((off) => off())
  }, [ctx, service])
  // Each lookup is isolated so one failing host call cannot hide the others.
  const attempt = (fn) => { try { return fn() } catch { return null } }
  const read = () => {
    const sessionId = attempt(() => service?.currentSession?.()) || null
    const workspace = sessionId ? attempt(() => service?.workspaceFor?.(sessionId)) : null
    const owned = sessionId ? attempt(() => workbenches?.ownsSession?.(sessionId)) : null
    return `${sessionId || ''}|${workspace?.path || ''}|${owned}`
  }
  const key = useSyncExternalStore(ctx || service ? subscribe : noop, read, read)
  const [sessionId, folder, owned] = key.split('|')
  return { sessionId: sessionId || null, folder: folder || null, owned: owned === 'true' }
}

export async function pickDirectory(service) {
  const ui = service?.ctx?.uiWorkspace
  if (!ui?.pickDirectory) throw new Error('当前 DSH 版本不支持文件夹选择器。')
  return ui.pickDirectory()
}

/** Create or restore the workbench session for a project folder. */
export async function ensureProjectSession(service, workbenches, folder, sessionId) {
  // Must be called through this plugin's own handle so Desktop can attribute ownership.
  if (typeof workbenches?.ensureSession === 'function') return workbenches.ensureSession({ folder, sessionId: sessionId || undefined })
  // Older Desktop builds: create the workspace, then a workbench-owned session in it.
  const workspaces = service?.ctx?.workspaces
  if (!workspaces?.create || typeof service?.newSession !== 'function') throw new Error('当前 DSH 版本不支持从工作台创建会话，请升级 DSH Desktop。')
  const workspace = await workspaces.create({ path: folder })
  if (typeof service.showWorkspace === 'function') await service.showWorkspace(workspace.workspaceId)
  return service.newSession(workspace.workspaceId)
}

export const samePath = (a, b) => Boolean(a && b && normPath(a) === normPath(b))

/** '' when folder is the project root, the top-level folder name when inside it, else null. */
export function libraryOf(projectPath, folder) {
  if (!projectPath || !folder) return null
  const root = normPath(projectPath)
  const f = normPath(folder)
  if (f === root) return ''
  if (!f.startsWith(root + '/')) return null
  // Return the original-case segment from the folder path.
  const original = String(folder).replace(/\\/g, '/').replace(/\/+$/, '')
  return original.slice(original.length - (f.length - root.length - 1)).split('/')[0]
}

export function joinPath(base, name) {
  const sep = String(base).includes('\\') ? '\\' : '/'
  return String(base).replace(/[\\/]+$/, '') + sep + name
}

/**
 * Put text into the native composer of the session (user still presses send).
 * Falls back to the clipboard when the conversation input service is absent.
 */
export async function setDraft(service, sessionId, text) {
  const ctx = service?.ctx
  for (let attempt = 0; attempt < 8; attempt++) {
    try {
      const conversation = ctx?.get?.('conversation') || ctx?.conversation
      const shell = conversation?.input?.shell?.(sessionId)
      if (shell?.setDraft) {
        shell.setDraft(text)
        try { shell.focus?.() } catch { /* focus is best effort */ }
        return 'draft'
      }
    } catch { /* binding may not exist yet right after creation */ }
    await new Promise((resolve) => setTimeout(resolve, 150))
  }
  try {
    await navigator.clipboard.writeText(text)
    return 'clipboard'
  } catch {
    return 'none'
  }
}
