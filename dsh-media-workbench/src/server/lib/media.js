import { readdir, stat, mkdir, rm } from 'node:fs/promises'
import path from 'node:path'
import { WorkbenchError, exists, inside, relTo, round, writeJson, appendLog, now, readJson } from './util.js'
import { RESERVED_DIRS, P } from './layout.js'
import { summarizeProbe } from './ffmpeg.js'
import { laplacianVariance, sharpnessScore, meanLuma, lumaStdDev, shakeVariance, dHash, fingerprintSimilarity, median } from './analyze.js'
import { effectiveDictionary, parseDictionary, tagIndex, serializeDictionary, DIMENSIONS } from './tags.js'
import { effectiveClipTags } from './store.js'

const SUPPORTED = new Set(['.mp4', '.mov', '.mts', '.m2ts', '.m4v'])
const VIDEO_LIKE = new Set([...SUPPORTED, '.avi', '.mkv', '.mxf', '.wmv', '.flv', '.3gp', '.webm', '.mpg', '.mpeg', '.r3d', '.braw', '.insv'])
const SKIP_DIRS = RESERVED_DIRS

export const REASONS = {
  short: '时长过短',
  black: '黑屏/误触拍摄',
  blur: '画面模糊/失焦',
  shake: '剧烈抖动',
  duplicate: '重复镜头'
}

const rejectedMarker = (root, rawId) => path.join(root, P.rejected, `${rawId}.json`)

async function walk(dir, depth, out) {
  if (depth < 0) return
  let entries
  try { entries = await readdir(dir, { withFileTypes: true }) } catch { return }
  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) { if (!SKIP_DIRS.has(entry.name)) await walk(full, depth - 1, out) }
    else if (entry.isFile() && VIDEO_LIKE.has(path.extname(entry.name).toLowerCase())) out.push(full)
  }
}

function rawIdFor(file, taken) {
  const base = path.basename(file, path.extname(file)).replace(/[^\p{L}\p{N}_-]+/gu, '_').slice(0, 60) || 'clip'
  let id = base
  let n = 2
  while (taken.has(id)) id = `${base}_${n++}`
  return id
}

export function createMedia({ ffmpeg, indexStore, creative, eagle, templates }) {
  /** Step 1 — scan 原始素材库 (and adopted source folders) and read metadata. Never touches the files. */
  async function importRaw({ root, project, signal, progress }) {
    const sources = [P.raw, ...project.rawSources.filter((s) => s !== P.raw)]
    const files = []
    for (const source of sources) {
      const dir = inside(root, source)
      if (source === '.') {
        // Root-level files only; sub-folders were registered as their own sources.
        let entries = []
        try { entries = await readdir(dir, { withFileTypes: true }) } catch { /* empty */ }
        for (const entry of entries) if (entry.isFile() && VIDEO_LIKE.has(path.extname(entry.name).toLowerCase())) files.push(path.join(dir, entry.name))
      } else await walk(dir, 6, files)
    }
    const unique = [...new Set(files)].sort((a, b) => a.localeCompare(b, 'zh'))
    progress(0, unique.length, '扫描中')
    const known = await indexStore.read(root)
    const byPath = new Map(Object.values(known.raws).map((raw) => [raw.path, raw]))
    let added = 0
    let updated = 0
    const unsupported = []
    for (let i = 0; i < unique.length; i++) {
      signal.throwIfAborted()
      const file = unique[i]
      const rel = relTo(root, file)
      progress(i, unique.length, rel)
      const info = await stat(file)
      const prior = byPath.get(rel)
      if (prior && prior.size === info.size && prior.mtimeMs === info.mtimeMs && prior.duration) continue
      const ext = path.extname(file).toLowerCase()
      const probe = SUPPORTED.has(ext) ? await ffmpeg.probe(file, signal) : null
      const summary = probe && summarizeProbe(probe)
      if (!summary) {
        unsupported.push({ path: rel, reason: SUPPORTED.has(ext) ? 'FFmpeg 无法读取视频流' : `不支持的格式 ${ext}` })
        continue
      }
      await indexStore.update(root, (index) => {
        const existing = Object.values(index.raws).find((raw) => raw.path === rel)
        if (existing) {
          Object.assign(existing, summary, { size: info.size, mtimeMs: info.mtimeMs, missing: false })
          updated++
        } else {
          const id = rawIdFor(file, new Set(Object.keys(index.raws)))
          index.raws[id] = { id, path: rel, size: info.size, mtimeMs: info.mtimeMs, ...summary, status: 'pending', importedAt: now() }
          added++
        }
      })
    }
    const result = await indexStore.update(root, (index) => {
      const present = new Set(unique.map((file) => relTo(root, file)))
      let missing = 0
      for (const raw of Object.values(index.raws)) {
        raw.missing = !present.has(raw.path)
        if (raw.missing) missing++
      }
      const supportedPaths = new Set(Object.values(index.raws).map((raw) => raw.path))
      index.unsupported = unsupported.filter((item) => !supportedPaths.has(item.path))
      return { scanned: unique.length, added, updated, missing, unsupported: index.unsupported.length, total: Object.keys(index.raws).length }
    })
    progress(unique.length, unique.length, null)
    await writeReport(root, project)
    return result
  }

  /** Analysis frames keep the source orientation. */
  const analysisSize = (raw, long) => (raw.height > raw.width ? { width: Math.round((long * 9) / 16), height: long } : { width: long, height: Math.round((long * 9) / 16) })

  async function analyzeRaw(root, raw, signal) {
    const file = inside(root, raw.path)
    const big = analysisSize(raw, 320)
    const count = Math.max(4, Math.min(16, Math.ceil(raw.duration)))
    const frames = await ffmpeg.grayFrames(file, { fps: round(count / Math.max(raw.duration, 0.1), 4), width: big.width, height: big.height, signal })
    if (!frames.length) throw new WorkbenchError(`无法解码 ${raw.path} 的画面。`, 500, 'DECODE_FAILED')
    const lumas = frames.map(meanLuma)
    const sharp = frames.map((f) => sharpnessScore(laplacianVariance(f, big.width, big.height)))
    const contrast = frames.map(lumaStdDev)
    const pick = (t) => frames[Math.min(frames.length - 1, Math.max(0, Math.round(t * (frames.length - 1))))]
    const fingerprint = [0.1, 0.5, 0.9].map((t) => dHash(pick(t), big.width, big.height).toString())
    const small = analysisSize(raw, 160)
    const window = Math.min(3, raw.duration)
    const start = Math.max(0, raw.duration / 2 - window / 2)
    const motion = await ffmpeg.grayFrames(file, { start, duration: window, fps: 10, width: small.width, height: small.height, signal })
    return {
      sharpness: Math.round(median(sharp.filter((_, i) => contrast[i] > 6)) || median(sharp)),
      lumaMean: round(median(lumas), 1),
      lumas,
      shakeVariance: round(shakeVariance(motion, small.width, small.height), 2),
      fingerprint
    }
  }

  /** Step 2 — keep/discard with quantified evidence (FR-20 / FR-21). Raw files are never moved. */
  async function clean({ root, project, signal, progress, force = false }) {
    const rules = project.cleanRules
    const index = await indexStore.read(root)
    const raws = Object.values(index.raws).filter((raw) => !raw.missing).sort((a, b) => String(a.shotAt || a.path).localeCompare(String(b.shotAt || b.path)) || a.path.localeCompare(b.path))
    const todo = raws.filter((raw) => force ? !raw.restored : raw.status === 'pending')
    progress(0, todo.length, null)
    let done = 0
    for (const raw of todo) {
      signal.throwIfAborted()
      progress(done, todo.length, raw.path)
      const reasons = []
      let metrics = null
      if (raw.duration < rules.minDuration) {
        reasons.push({ code: 'short', label: REASONS.short, evidence: `${round(raw.duration, 1)}s < ${rules.minDuration}s` })
      } else {
        metrics = await analyzeRaw(root, raw, signal)
        const blackRatio = metrics.lumas.filter((l) => l < rules.blackLuma).length / metrics.lumas.length
        metrics.blackRatio = round(blackRatio, 2)
        delete metrics.lumas
        if (blackRatio > rules.blackRatioMax) reasons.push({ code: 'black', label: REASONS.black, evidence: `暗帧占比 ${Math.round(blackRatio * 100)}% > ${Math.round(rules.blackRatioMax * 100)}%（亮度 < ${rules.blackLuma}）` })
        else {
          if (metrics.sharpness < rules.sharpnessMin) reasons.push({ code: 'blur', label: REASONS.blur, evidence: `清晰度 ${metrics.sharpness} < 阈值 ${rules.sharpnessMin}` })
          if (metrics.shakeVariance > rules.shakeVarianceMax) reasons.push({ code: 'shake', label: REASONS.shake, evidence: `位移方差 ${metrics.shakeVariance} > ${rules.shakeVarianceMax}` })
          if (!reasons.length) {
            const current = await indexStore.read(root)
            const earlier = Object.values(current.raws).filter((other) => other.id !== raw.id && other.status === 'kept' && other.clean?.fingerprint)
            let best = null
            for (const other of earlier) {
              const similarity = fingerprintSimilarity(metrics.fingerprint.map(BigInt), other.clean.fingerprint.map(BigInt))
              if (!best || similarity > best.similarity) best = { id: other.id, similarity }
            }
            if (best && best.similarity >= rules.duplicateSimilarity) {
              reasons.push({ code: 'duplicate', label: REASONS.duplicate, evidence: `与 ${best.id} 相似度 ${Math.round(best.similarity * 100)}% ≥ ${Math.round(rules.duplicateSimilarity * 100)}%`, of: best.id })
            }
          }
        }
      }
      const status = reasons.length ? 'rejected' : 'kept'
      await indexStore.update(root, (index) => {
        const entry = index.raws[raw.id]
        if (!entry) return
        entry.status = status
        entry.clean = { ...(metrics || {}), reasons, rulesVersion: rules.version, at: now() }
      })
      if (status === 'rejected') {
        await writeJson(rejectedMarker(root, raw.id), { rawId: raw.id, original: raw.path, reasons, rulesVersion: rules.version, at: now(), note: '原片未移动；在面板点「恢复」即可恢复。' })
      } else if (await exists(rejectedMarker(root, raw.id))) {
        await rm(rejectedMarker(root, raw.id), { force: true })
      }
      done++
    }
    progress(done, todo.length, null)
    const report = await writeReport(root, project)
    return { analyzed: done, kept: report.kept, rejected: report.rejected, pending: report.pending }
  }

  /** FR-22 — restore discarded raws; they need splitting again. */
  async function restore(root, project, rawIds) {
    const ids = Array.isArray(rawIds) ? rawIds : [rawIds]
    const restored = await indexStore.update(root, (index) => {
      const out = []
      for (const id of ids) {
        const raw = index.raws[id]
        if (!raw) throw new WorkbenchError(`找不到原片 ${id}。`, 404)
        if (raw.status !== 'rejected') continue
        raw.status = 'kept'
        raw.restored = true
        raw.restoredAt = now()
        out.push(id)
      }
      return out
    })
    for (const id of restored) await rm(rejectedMarker(root, id), { force: true })
    await appendLog(root, { action: 'media.restore', rawIds: restored })
    await writeReport(root, project)
    return { restored }
  }

  async function encoderArgs() {
    const caps = await ffmpeg.detect()
    const list = caps.encoders?.list || []
    if (list.includes('libx264')) return ['-c:v', 'libx264', '-preset', 'veryfast', '-crf', '23', '-pix_fmt', 'yuv420p']
    const hw = ['h264_nvenc', 'h264_qsv', 'h264_amf', 'h264_videotoolbox', 'h264_mf'].find((name) => list.includes(name))
    if (hw) return ['-c:v', hw, '-b:v', '8M', '-pix_fmt', 'yuv420p']
    return ['-c:v', 'mpeg4', '-q:v', '4']
  }

  /** Step 3 — scene-based clips with 1080p H.264 proxies and thumbnails. */
  async function split({ root, project, signal, progress, rawIds, threshold = 0.3, minClip = 1 }) {
    const index = await indexStore.read(root)
    const clipsByRaw = new Map()
    for (const clip of Object.values(index.clips)) clipsByRaw.set(clip.rawId, (clipsByRaw.get(clip.rawId) || 0) + 1)
    const targets = Object.values(index.raws).filter((raw) => raw.status === 'kept' && !raw.missing && (rawIds ? rawIds.includes(raw.id) : !clipsByRaw.get(raw.id)))
    const total = targets.reduce((sum, raw) => sum + raw.duration, 0) || 1
    let doneSeconds = 0
    const encoder = await encoderArgs()
    let created = 0
    progress(0, Math.round(total), null)
    for (const raw of targets) {
      signal.throwIfAborted()
      const file = inside(root, raw.path)
      progress(Math.round(doneSeconds), Math.round(total), `${raw.path} · 检测镜头`)
      const cuts = await ffmpeg.sceneCuts(file, threshold, signal, (t) => progress(Math.round(doneSeconds + t * 0.3), Math.round(total)))
      const points = [0, ...cuts.filter((t) => t > minClip && t < raw.duration - minClip), raw.duration]
      const segments = []
      for (let i = 0; i < points.length - 1; i++) {
        const start = points[i]
        const end = points[i + 1]
        if (segments.length && end - start < minClip) segments[segments.length - 1].end = end
        else segments.push({ start, end })
      }
      if (segments.length > 1 && segments[0].end - segments[0].start < minClip) { segments[1].start = 0; segments.shift() }
      const dir = path.join(root, P.clips, raw.id)
      await mkdir(dir, { recursive: true })
      await mkdir(path.join(root, '.dsh', 'cache', 'thumbs'), { recursive: true })
      // Remove clips from an earlier split of this raw (re-split after restore/force).
      await indexStore.update(root, (idx) => { for (const [id, clip] of Object.entries(idx.clips)) if (clip.rawId === raw.id) delete idx.clips[id] })
      for (let i = 0; i < segments.length; i++) {
        signal.throwIfAborted()
        const seg = segments[i]
        const id = `${raw.id}_s${String(i + 1).padStart(2, '0')}`
        const proxy = path.join(dir, `${id}.mp4`)
        const thumb = path.join(root, '.dsh', 'cache', 'thumbs', `${id}.jpg`)
        const duration = seg.end - seg.start
        progress(Math.round(doneSeconds + raw.duration * 0.3 + (seg.start / raw.duration) * raw.duration * 0.7), Math.round(total), `${id}`)
        const scale = "scale='trunc(iw*min(1,1080/min(iw,ih))/2)*2':'trunc(ih*min(1,1080/min(iw,ih))/2)*2'"
        await ffmpeg.ffmpeg(['-ss', seg.start.toFixed(3), '-i', file, '-t', duration.toFixed(3), '-map', '0:v:0', '-map', '0:a:0?', '-vf', scale, ...encoder, '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', proxy], { signal })
        await ffmpeg.ffmpeg(['-ss', (duration / 2).toFixed(3), '-i', proxy, '-frames:v', '1', '-vf', 'scale=480:-2', '-q:v', '4', thumb], { signal })
        await indexStore.update(root, (idx) => {
          idx.clips[id] = {
            id, rawId: raw.id, index: i + 1,
            start: round(seg.start, 3), end: round(seg.end, 3), duration: round(duration, 3),
            proxy: relTo(root, proxy), thumb: relTo(root, thumb),
            width: raw.width, height: raw.height,
            tags: [], aiTags: [], pendingTags: [], tagStatus: 'untagged', reviewed: false, needsReview: false,
            createdAt: now()
          }
        })
        created++
      }
      doneSeconds += raw.duration
    }
    progress(Math.round(total), Math.round(total), null)
    await writeReport(root, project)
    return { raws: targets.length, clips: created }
  }

  /** 3 frames (20%/50%/80%) side by side, for the Agent to look at. */
  async function contactSheet(src, { duration, width, height, start = 0 }, target, signal) {
    if (await exists(target)) return
    const t = [0.2, 0.5, 0.8].map((p) => (start + duration * p).toFixed(3))
    const cell = height > width ? '270:480' : '480:270'
    const [cw, ch] = cell.split(':')
    const chain = [0, 1, 2].map((i) => `[${i}:v]scale=${cw}:${ch}:force_original_aspect_ratio=decrease,pad=${cw}:${ch}:(ow-iw)/2:(oh-ih)/2[v${i}]`).join(';')
    await ffmpeg.ffmpeg(['-ss', t[0], '-i', src, '-ss', t[1], '-i', src, '-ss', t[2], '-i', src, '-filter_complex', `${chain};[v0][v1][v2]hstack=inputs=3`, '-frames:v', '1', '-q:v', '4', target], { signal })
  }

  /** 3-frame contact sheet per clip for the Agent's multimodal tagging. */
  async function keyframes({ root, clipIds, signal, progress }) {
    const index = await indexStore.read(root)
    const out = []
    const ids = clipIds?.length ? clipIds : Object.values(index.clips).filter((clip) => clip.tagStatus !== 'tagged').map((clip) => clip.id)
    progress?.(0, ids.length, null)
    await mkdir(path.join(root, '.dsh', 'cache', 'keyframes'), { recursive: true })
    for (let i = 0; i < ids.length; i++) {
      signal?.throwIfAborted()
      const clip = index.clips[ids[i]]
      if (!clip) throw new WorkbenchError(`找不到切片 ${ids[i]}。`, 404)
      const target = path.join(root, '.dsh', 'cache', 'keyframes', `${clip.id}.jpg`)
      await contactSheet(inside(root, clip.proxy), clip, target, signal)
      const raw = index.raws[clip.rawId]
      out.push({ clipId: clip.id, image: relTo(root, target), duration: clip.duration, raw: raw?.path, transcript: clip.transcript || null, currentTags: clip.tags })
      progress?.(i + 1, ids.length, clip.id)
    }
    return out
  }

  /**
   * Footage samples for tag suggestions: clips when the footage is split,
   * otherwise imported raw files (kept first). Spread evenly over the footage.
   */
  async function samples({ root, limit = 16, signal }) {
    const index = await indexStore.read(root)
    const max = Math.min(Math.max(Number(limit) || 16, 1), 40)
    const spread = (list) => list.length <= max ? list : Array.from({ length: max }, (_, i) => list[Math.floor((i * list.length) / max)])
    const kept = new Set(Object.values(index.raws).filter((raw) => raw.status === 'kept').map((raw) => raw.id))
    const clips = Object.values(index.clips).filter((clip) => kept.has(clip.rawId))
    if (clips.length) return { kind: 'clips', items: await keyframes({ root, clipIds: spread(clips).map((clip) => clip.id), signal }) }
    const raws = Object.values(index.raws).filter((raw) => !raw.missing && raw.status !== 'rejected' && raw.duration > 0)
      .sort((a, b) => Number(b.status === 'kept') - Number(a.status === 'kept') || a.id.localeCompare(b.id))
    if (!raws.length) return { kind: 'none', items: [] }
    await mkdir(path.join(root, '.dsh', 'cache', 'keyframes'), { recursive: true })
    const out = []
    for (const raw of spread(raws)) {
      signal?.throwIfAborted()
      const target = path.join(root, '.dsh', 'cache', 'keyframes', `raw_${raw.id}.jpg`)
      try {
        await contactSheet(inside(root, raw.path), raw, target, signal)
        out.push({ rawId: raw.id, image: relTo(root, target), duration: raw.duration, raw: raw.path })
      } catch (error) {
        if (signal?.aborted) throw error
        out.push({ rawId: raw.id, raw: raw.path, error: '无法抽帧' })
      }
    }
    return { kind: 'raws', items: out }
  }

  async function readDictionary(root) {
    const doc = await creative.read(root, '标签字典.yaml').catch(() => null)
    const dictionary = parseDictionary(doc?.exists ? doc.content : '')
    const all = templates ? await templates.all() : undefined
    return { dictionary, effective: effectiveDictionary(dictionary, all), exists: Boolean(doc?.exists), templates: all }
  }

  /**
   * Step 5 — apply tags chosen by the model. Only dictionary tags are accepted;
   * anything else goes to the 待审 area; confidence < 0.6 marks 待复核 (RK-03).
   */
  async function applyTags(root, items, { model, floor = 0.6 } = {}) {
    if (!Array.isArray(items) || !items.length) throw new WorkbenchError('请提供要打标的切片。')
    const { dictionary, effective, exists: hasDictionary } = await readDictionary(root)
    if (!hasDictionary) throw new WorkbenchError('还没有标签字典。请先在「标签」页选好标签模板（或让 AI 生成标签字典），打标只能从字典里选。', 409, 'NO_DICTIONARY')
    const known = tagIndex(effective)
    const newPending = new Set()
    const pendingHints = {}
    const summary = await indexStore.update(root, (index) => {
      const result = { tagged: 0, pending: 0, lowConfidence: 0, skipped: [] }
      for (const item of items) {
        const clip = index.clips[item?.clipId]
        if (!clip) { result.skipped.push({ clipId: item?.clipId, reason: '切片不存在' }); continue }
        const accepted = []
        const pending = []
        for (const raw of item.tags || []) {
          const tag = typeof raw === 'string' ? raw.trim() : String(raw?.tag || '').trim()
          if (!tag) continue
          const confidence = typeof raw === 'object' && Number.isFinite(Number(raw.confidence)) ? Math.max(0, Math.min(1, Number(raw.confidence))) : 0.8
          if (known.has(tag)) accepted.push({ tag, dim: known.get(tag), confidence })
          else {
            const hint = typeof raw === 'object' && raw.dim ? String(raw.dim) : null
            pending.push({ tag, dim: hint, confidence })
            if (!dictionary.pending.includes(tag)) { newPending.add(tag); if (hint && !pendingHints[tag]) pendingHints[tag] = hint }
          }
        }
        clip.aiTags = accepted
        clip.tags = [...new Set(accepted.map((t) => t.tag))]
        clip.pendingTags = pending
        clip.needsReview = accepted.some((t) => t.confidence < floor)
        clip.tagStatus = 'tagged'
        clip.taggedAt = now()
        clip.tagModel = model || null
        clip.reviewed = false
        if (clip.eagle?.id) clip.eagle.dirty = true
        if (typeof item.transcript === 'string') clip.transcript = item.transcript
        result.tagged++
        result.pending += pending.length
        if (clip.needsReview) result.lowConfidence++
      }
      return result
    })
    if (newPending.size) {
      const next = { ...dictionary, pending: [...dictionary.pending, ...newPending], pendingDims: { ...(dictionary.pendingDims || {}), ...pendingHints } }
      await creative.write(root, '标签字典.yaml', serializeDictionary(next), { source: 'system', note: 'AI 建议的新标签已加入待审区' })
    }
    await appendLog(root, { action: 'media.tag', count: summary.tagged, pending: [...newPending], model: model || null })
    return { ...summary, newPendingTags: [...newPending] }
  }

  /** Step 6 — human review: final tags for one clip, records adoption (FR-25). */
  async function review(root, clipId, tags, { reviewed = true } = {}) {
    const { effective } = await readDictionary(root)
    const known = tagIndex(effective)
    const bad = (tags || []).filter((tag) => !known.has(tag))
    if (bad.length) throw new WorkbenchError(`这些标签不在字典里：${bad.join('、')}。请先加入字典。`)
    return indexStore.update(root, (index) => {
      const clip = index.clips[clipId]
      if (!clip) throw new WorkbenchError(`找不到切片 ${clipId}。`, 404)
      clip.tags = [...new Set(tags)]
      clip.reviewed = Boolean(reviewed)
      clip.reviewedAt = now()
      clip.needsReview = false
      if (clip.tagStatus === 'untagged') clip.tagStatus = 'manual'
      if (clip.eagle?.id) clip.eagle.dirty = true
      return { clipId, tags: clip.tags, reviewed: clip.reviewed }
    })
  }

  /** FR-26 — push proxies + tags + notes into the project's Eagle folder. */
  async function eaglePush({ root, project, signal, progress, saveProject }) {
    const index = await indexStore.read(root)
    const status = await eagle.info()
    if (!status.connected) throw new WorkbenchError('Eagle 未连接：请先打开 Eagle，再重新同步。', 503, 'EAGLE_OFFLINE')
    const folderId = await eagle.ensureFolder(project.eagle.folderName || project.name, project.eagle.folderId)
    if (folderId !== project.eagle.folderId) await saveProject({ eagle: { ...project.eagle, folderId } })
    const kept = new Set(Object.values(index.raws).filter((raw) => raw.status === 'kept').map((raw) => raw.id))
    const clips = Object.values(index.clips).filter((clip) => kept.has(clip.rawId))
    const toAdd = clips.filter((clip) => !clip.eagle?.id || clip.eagle?.missing)
    const toUpdate = clips.filter((clip) => clip.eagle?.id && !clip.eagle?.missing && clip.eagle?.dirty)
    const total = toAdd.length + toUpdate.length
    progress(0, total, null)
    let done = 0
    const annotation = (clip) => {
      const raw = index.raws[clip.rawId]
      return [`原片：${raw?.path || ''}`, `入点：${clip.start}s  出点：${clip.end}s`, clip.transcript ? `转写：${clip.transcript}` : ''].filter(Boolean).join('\n')
    }
    for (let i = 0; i < toAdd.length; i += 200) {
      signal.throwIfAborted()
      const batch = toAdd.slice(i, i + 200)
      await eagle.addFromPaths(batch.map((clip) => ({ path: inside(root, clip.proxy), name: clip.id, tags: effectiveClipTags(clip), annotation: annotation(clip) })), folderId)
      done += batch.length
      progress(done, total, `入库 ${done}/${toAdd.length}`)
    }
    // addFromPaths does not return IDs; read them back by name (Eagle imports asynchronously).
    let mapped = 0
    if (toAdd.length) {
      for (let attempt = 0; attempt < 10; attempt++) {
        await new Promise((resolve) => setTimeout(resolve, attempt ? 1500 : 800))
        const items = await eagle.listFolder(folderId)
        const byName = new Map(items.map((item) => [item.name, item.id]))
        mapped = await indexStore.update(root, (idx) => {
          let n = 0
          for (const clip of toAdd) {
            const id = byName.get(clip.id)
            if (id && idx.clips[clip.id]) { idx.clips[clip.id].eagle = { id, syncedAt: now(), dirty: false, missing: false }; n++ }
          }
          return n
        })
        if (mapped >= toAdd.length) break
      }
    }
    for (const clip of toUpdate) {
      signal.throwIfAborted()
      await eagle.update(clip.eagle.id, { tags: effectiveClipTags(clip), annotation: annotation(clip) })
      await indexStore.update(root, (idx) => { if (idx.clips[clip.id]?.eagle) Object.assign(idx.clips[clip.id].eagle, { dirty: false, syncedAt: now() }) })
      done++
      progress(done, total, clip.id)
    }
    await writeReport(root, project)
    return { added: toAdd.length, mapped, updated: toUpdate.length, folderId }
  }

  /** FR-26 — pull tag edits made inside Eagle back into the index. */
  async function eaglePull({ root, project, signal, progress }) {
    if (!project.eagle.folderId) throw new WorkbenchError('这个项目还没有同步过 Eagle。', 409)
    const status = await eagle.info()
    if (!status.connected) throw new WorkbenchError('Eagle 未连接：请先打开 Eagle。', 503, 'EAGLE_OFFLINE')
    const { effective } = await readDictionary(root)
    const known = tagIndex(effective)
    const items = await eagle.listFolder(project.eagle.folderId)
    signal.throwIfAborted()
    const byId = new Map(items.map((item) => [item.id, item]))
    const result = await indexStore.update(root, (index) => {
      const out = { changed: 0, missing: 0, outsideDictionary: [] }
      for (const clip of Object.values(index.clips)) {
        if (!clip.eagle?.id) continue
        const item = byId.get(clip.eagle.id)
        if (!item) { clip.eagle.missing = true; out.missing++; continue }
        clip.eagle.missing = false
        const tags = (item.tags || []).filter((tag) => known.has(tag))
        const outside = (item.tags || []).filter((tag) => !known.has(tag))
        for (const tag of outside) if (!out.outsideDictionary.includes(tag)) out.outsideDictionary.push(tag)
        const before = JSON.stringify([...(clip.tags || [])].sort())
        if (before !== JSON.stringify([...tags].sort())) {
          clip.tags = tags
          clip.reviewed = true
          clip.reviewedAt = now()
          clip.eagle.pulledAt = now()
          out.changed++
        }
      }
      return out
    })
    progress(1, 1, null)
    await writeReport(root, project)
    return result
  }

  /** Clean report (FR-20): 保留 + 丢弃 + 待清洗 must equal 导入. */
  async function computeReport(root, project) {
    const index = await indexStore.read(root)
    const raws = Object.values(index.raws).filter((raw) => !raw.missing)
    const kept = raws.filter((raw) => raw.status === 'kept')
    const rejected = raws.filter((raw) => raw.status === 'rejected')
    const pending = raws.filter((raw) => raw.status === 'pending')
    const reasons = Object.fromEntries(Object.keys(REASONS).map((code) => [code, 0]))
    const details = []
    for (const raw of rejected) {
      const first = raw.clean?.reasons?.[0]
      if (first) reasons[first.code] = (reasons[first.code] || 0) + 1
      details.push({ rawId: raw.id, file: raw.path, reason: first?.label || '未知', code: first?.code || null, evidence: (raw.clean?.reasons || []).map((r) => r.evidence).join('；'), duration: raw.duration })
    }
    const keptIds = new Set(kept.map((raw) => raw.id))
    const clips = Object.values(index.clips).filter((clip) => keptIds.has(clip.rawId))
    const reviewedClips = clips.filter((clip) => clip.reviewed && clip.aiTags?.length)
    let aiTotal = 0
    let aiKept = 0
    for (const clip of reviewedClips) {
      aiTotal += clip.aiTags.length
      aiKept += clip.aiTags.filter((t) => clip.tags.includes(t.tag)).length
    }
    const lastRun = raws.map((raw) => raw.clean?.at).filter(Boolean).sort().pop() || null
    const balanced = kept.length + rejected.length + pending.length === raws.length
    return {
      generatedAt: now(), lastCleanAt: lastRun, rulesVersion: project.cleanRules.version, rules: project.cleanRules,
      imported: raws.length, kept: kept.length, rejected: rejected.length, pending: pending.length, balanced,
      missing: Object.values(index.raws).filter((raw) => raw.missing).length,
      unsupported: index.unsupported,
      reasons, details,
      clips: clips.length,
      eagleSynced: clips.filter((clip) => clip.eagle?.id && !clip.eagle?.missing).length,
      eagleMissing: clips.filter((clip) => clip.eagle?.missing).length,
      eagleDirty: clips.filter((clip) => clip.eagle?.dirty).length,
      tagging: {
        tagged: clips.filter((clip) => clip.tagStatus === 'tagged').length,
        untagged: clips.filter((clip) => clip.tagStatus === 'untagged').length,
        needsReview: clips.filter((clip) => clip.needsReview).length,
        reviewed: clips.filter((clip) => clip.reviewed).length,
        aiTags: clips.reduce((sum, clip) => sum + (clip.aiTags?.length || 0), 0),
        adoption: aiTotal ? round(aiKept / aiTotal, 3) : null,
        adoptionSample: reviewedClips.length
      }
    }
  }

  async function writeReport(root, project) {
    const report = await computeReport(root, project)
    await writeJson(path.join(root, P.cleanReport), report)
    return report
  }

  async function tagSummary(root) {
    const { dictionary, effective, exists: hasDictionary, templates: all } = await readDictionary(root)
    const index = await indexStore.read(root)
    const kept = new Set(Object.values(index.raws).filter((raw) => raw.status === 'kept').map((raw) => raw.id))
    const counts = new Map()
    const pendingCounts = new Map()
    for (const clip of Object.values(index.clips)) {
      if (!kept.has(clip.rawId)) continue
      for (const tag of clip.tags || []) counts.set(tag, (counts.get(tag) || 0) + 1)
      for (const item of clip.pendingTags || []) pendingCounts.set(item.tag, (pendingCounts.get(item.tag) || 0) + 1)
    }
    const projectTags = new Set(Object.values(dictionary.dims).flat())
    return {
      exists: hasDictionary,
      inherit: dictionary.inherit,
      inheritLabel: all?.[dictionary.inherit]?.label || dictionary.inherit,
      templateMissing: effective.templateMissing,
      dims: Object.entries(effective.dims).map(([dim, tags]) => ({ dim, base: DIMENSIONS.includes(dim), tags: tags.map((tag) => ({ tag, count: counts.get(tag) || 0, fromTemplate: !projectTags.has(tag) })) })),
      pending: dictionary.pending.map((tag) => ({ tag, count: pendingCounts.get(tag) || 0, suggestedDim: dictionary.pendingDims?.[tag] || suggestedDim(index, tag) })),
      totalTags: Object.values(effective.dims).reduce((n, list) => n + list.length, 0),
      clips: Object.values(index.clips).filter((clip) => kept.has(clip.rawId)).length
    }
  }

  function suggestedDim(index, tag) {
    const votes = new Map()
    for (const clip of Object.values(index.clips)) for (const item of clip.pendingTags || []) if (item.tag === tag && item.dim) votes.set(item.dim, (votes.get(item.dim) || 0) + 1)
    return [...votes.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || null
  }

  async function listClips(root, { tag, filter, rawId, limit = 500, offset = 0 } = {}) {
    const index = await indexStore.read(root)
    const kept = new Set(Object.values(index.raws).filter((raw) => raw.status === 'kept').map((raw) => raw.id))
    let clips = Object.values(index.clips).filter((clip) => kept.has(clip.rawId))
    if (rawId) clips = clips.filter((clip) => clip.rawId === rawId)
    if (tag) clips = clips.filter((clip) => clip.tags?.includes(tag) || clip.pendingTags?.some((p) => p.tag === tag))
    if (filter === 'review') clips = clips.filter((clip) => clip.needsReview || (!clip.reviewed && clip.tagStatus === 'tagged'))
    if (filter === 'untagged') clips = clips.filter((clip) => clip.tagStatus === 'untagged')
    if (filter === 'reviewed') clips = clips.filter((clip) => clip.reviewed)
    clips.sort((a, b) => a.id.localeCompare(b.id))
    return { total: clips.length, clips: clips.slice(offset, offset + limit).map((clip) => ({ ...clip, raw: index.raws[clip.rawId]?.path })) }
  }

  async function transcribeAvailable(runner) {
    try {
      const result = await runner('whisper', ['--help'], { timeoutMs: 15_000 })
      return result.code === 0
    } catch { return false }
  }

  /** Step 4 — optional local Whisper transcription (skips silent/no-audio clips). */
  async function transcribe({ root, signal, progress, clipIds, language = 'zh', model = 'small' }) {
    if (!(await transcribeAvailable(ffmpeg.run))) throw new WorkbenchError('未检测到本地 Whisper（命令 whisper）。可以用 pip install -U openai-whisper 安装后重试；不转写不影响打标。', 424, 'WHISPER_MISSING')
    const index = await indexStore.read(root)
    const targets = Object.values(index.clips).filter((clip) => (clipIds ? clipIds.includes(clip.id) : !clip.transcript) && index.raws[clip.rawId]?.hasAudio)
    const outDir = path.join(root, '.dsh', 'cache', 'transcripts')
    await mkdir(outDir, { recursive: true })
    progress(0, targets.length, null)
    let done = 0
    for (const clip of targets) {
      signal.throwIfAborted()
      progress(done, targets.length, clip.id)
      const result = await ffmpeg.run('whisper', [inside(root, clip.proxy), '--model', model, '--language', language, '--output_format', 'json', '--output_dir', outDir, '--fp16', 'False'], { signal })
      if (result.code === 0) {
        const json = await readJson(path.join(outDir, `${clip.id}.json`), null)
        const text = (json?.text || '').trim()
        const segments = (json?.segments || []).map((s) => ({ start: round(s.start, 2), end: round(s.end, 2), text: s.text.trim() }))
        await indexStore.update(root, (idx) => { if (idx.clips[clip.id]) { idx.clips[clip.id].transcript = text; idx.clips[clip.id].transcriptSegments = segments } })
      }
      done++
    }
    progress(done, targets.length, null)
    return { transcribed: done }
  }

  return { importRaw, clean, restore, split, keyframes, samples, applyTags, review, eaglePush, eaglePull, computeReport, writeReport, tagSummary, listClips, readDictionary, transcribe }
}
