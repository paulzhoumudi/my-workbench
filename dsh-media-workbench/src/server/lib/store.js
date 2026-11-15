import path from 'node:path'
import { readJson, writeJson, now } from './util.js'

/**
 * `.dsh/index.json` — the footage index (原片表、切片表、清洗结果). JSON instead
 * of SQLite keeps the package free of native modules and the data readable
 * without the app (P1 文件即真相).
 */
export function createIndexStore({ lock }) {
  const file = (root) => path.join(root, '.dsh', 'index.json')
  const empty = () => ({ schema: 1, raws: {}, clips: {}, unsupported: [], updatedAt: null })
  const read = async (root) => {
    const data = await readJson(file(root), null)
    if (!data) return empty()
    data.raws ||= {}
    data.clips ||= {}
    data.unsupported ||= []
    return data
  }
  return {
    read,
    /** Serialized read-modify-write. `fn` may mutate the index and return a result. */
    update(root, fn) {
      return lock(`index:${root}`, async () => {
        const index = await read(root)
        const result = await fn(index)
        index.updatedAt = now()
        await writeJson(file(root), index)
        return result
      })
    }
  }
}

/** Clip tags that count for matching: reviewed tags, or AI tags at/above the confidence floor. */
export function effectiveClipTags(clip, floor = 0.6) {
  if (clip.reviewed) return clip.tags || []
  const low = new Set((clip.aiTags || []).filter((item) => (item.confidence ?? 1) < floor).map((item) => item.tag))
  return (clip.tags || []).filter((tag) => !low.has(tag))
}
