import { mkdir, rm, writeFile, access, constants } from 'node:fs/promises'
import path from 'node:path'
import os from 'node:os'
import { P } from './layout.js'
import { WorkbenchError, inside, readJson, writeJson, writeAtomic, now, round, relTo, appendLog, exists } from './util.js'
import { parseStoryboard } from './storyboard.js'
import { effectiveClipTags } from './store.js'

export const RESOLUTIONS = {
  '3840x2160': { width: 3840, height: 2160, label: '3840×2160（4K）', aspect: '16:9' },
  '1920x1080': { width: 1920, height: 1080, label: '1920×1080（1080P）', aspect: '16:9' },
  '1080x1920': { width: 1080, height: 1920, label: '1080×1920（竖屏）', aspect: '9:16' },
  '2160x3840': { width: 2160, height: 3840, label: '2160×3840（竖屏 4K）', aspect: '9:16' },
  '1080x1080': { width: 1080, height: 1080, label: '1080×1080（方形）', aspect: '1:1' }
}
export const FPS_OPTIONS = [24, 25, 30, 50, 60]

export function defaultSpec(project) {
  const key = `${project.spec.width}x${project.spec.height}`
  return {
    resolution: RESOLUTIONS[key] ? key : project.spec.aspect === '9:16' ? '1080x1920' : '3840x2160',
    fps: FPS_OPTIONS.includes(project.spec.fps) ? project.spec.fps : 25,
    codec: 'h265',
    bitrateMbps: 40,
    targetDuration: Number(project.spec.targetDuration) > 0 ? Number(project.spec.targetDuration) : null,
    subtitles: 'burn+srt',
    engine: 'ffmpeg',
    transition: 'cut'
  }
}

export function sanitizeEditSpec(input, base) {
  const spec = { ...base }
  if (!input || typeof input !== 'object') return spec
  if (RESOLUTIONS[input.resolution]) spec.resolution = input.resolution
  if (FPS_OPTIONS.includes(Number(input.fps))) spec.fps = Number(input.fps)
  if (['h264', 'h265'].includes(input.codec)) spec.codec = input.codec
  if (Number.isFinite(Number(input.bitrateMbps)) && input.bitrateMbps >= 1 && input.bitrateMbps <= 400) spec.bitrateMbps = Number(input.bitrateMbps)
  if (input.targetDuration === null || input.targetDuration === '' || input.targetDuration === 0) spec.targetDuration = null
  else if (Number.isFinite(Number(input.targetDuration)) && input.targetDuration > 0 && input.targetDuration <= 7200) spec.targetDuration = Number(input.targetDuration)
  if (['burn+srt', 'srt', 'burn', 'none'].includes(input.subtitles)) spec.subtitles = input.subtitles
  if (['jianying', 'ffmpeg', 'both'].includes(input.engine)) spec.engine = input.engine
  if (['cut', 'dissolve'].includes(input.transition)) spec.transition = input.transition
  return spec
}

export function jianyingDefaultDir() {
  if (process.platform === 'win32') return path.join(process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local'), 'JianyingPro', 'User Data', 'Projects', 'com.lveditor.draft')
  if (process.platform === 'darwin') return path.join(os.homedir(), 'Movies', 'JianyingPro', 'User Data', 'Projects', 'com.lveditor.draft')
  return ''
}

export async function jianyingStatus(dir) {
  const target = dir || jianyingDefaultDir()
  if (!target) return { ok: false, dir: null, reason: '当前系统没有剪映专业版' }
  try {
    await access(target, constants.W_OK)
    return { ok: true, dir: target }
  } catch {
    return { ok: false, dir: target, reason: '没找到剪映草稿目录（未安装剪映专业版或路径不同，可在项目设置里修改）' }
  }
}

const SRT_TIME = (t) => {
  const ms = Math.round(t * 1000)
  const h = Math.floor(ms / 3_600_000)
  const m = Math.floor((ms % 3_600_000) / 60_000)
  const s = Math.floor((ms % 60_000) / 1000)
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')},${String(ms % 1000).padStart(3, '0')}`
}

export function toSrt(entries) {
  return entries.map((entry, i) => `${i + 1}\n${SRT_TIME(entry.start)} --> ${SRT_TIME(entry.end)}\n${entry.text}\n`).join('\n')
}

export function createEdit({ creative, indexStore, ffmpeg }) {
  const specFile = (root) => path.join(root, P.editData, 'edit_spec.json')
  const matchFile = (root) => path.join(root, P.editData, 'match.json')
  const timelineFile = (root) => path.join(root, P.editData, 'timeline.json')

  async function getSpec(root, project) {
    const saved = await readJson(specFile(root), null)
    return sanitizeEditSpec(saved, defaultSpec(project))
  }

  async function setSpec(root, project, input) {
    const spec = sanitizeEditSpec(input, await getSpec(root, project))
    await writeJson(specFile(root), { ...spec, updatedAt: now() })
    await appendLog(root, { action: 'edit.spec.set', spec })
    return spec
  }

  /** Storyboard in use: the 剪辑使用版本 when set (FR-13), else the current file. */
  async function storyboardInUse(root) {
    const meta = await creative.readMeta(root)
    const use = meta.editUse['03_分镜脚本.md']
    const current = await creative.read(root, '03_分镜脚本.md').catch(() => null)
    if (!current?.exists) return { version: 0, editUse: null, shots: [], total: 0, missing: true }
    const doc = use && use !== current.version ? await creative.read(root, '03_分镜脚本.md', use).catch(() => current) : current
    const parsed = parseStoryboard(doc.content)
    return { version: doc.version, currentVersion: current.version, editUse: use ?? null, ...parsed }
  }

  /** FR-33 — tag-based retrieval: Top3 per shot, greedy reuse avoidance, honest "未找到". */
  async function match(root, { keepManual = true } = {}) {
    const board = await storyboardInUse(root)
    if (board.missing) throw new WorkbenchError('还没有分镜脚本（创意剪辑/03_分镜脚本.md），无法匹配。', 409, 'NO_STORYBOARD')
    if (!board.shots.length) throw new WorkbenchError('分镜脚本里没有找到表格（需要包含「镜号」列的 Markdown 表格）。', 422, 'NO_SHOTS')
    const meta = await creative.readMeta(root)
    const index = await indexStore.read(root)
    const kept = new Set(Object.values(index.raws).filter((raw) => raw.status === 'kept').map((raw) => raw.id))
    const clips = Object.values(index.clips).filter((clip) => kept.has(clip.rawId))
    const previous = await readJson(matchFile(root), null)
    const used = new Map()
    const shots = []
    for (const shot of board.shots) {
      const wanted = [...shot.tags.map((tag) => ({ tag, weight: 1 })), ...(shot.size ? [{ tag: shot.size, weight: 0.5 }] : []), ...(shot.move ? [{ tag: shot.move, weight: 0.5 }] : [])]
      const dedup = [...new Map(wanted.map((w) => [w.tag, w])).values()]
      const totalWeight = dedup.reduce((sum, w) => sum + w.weight, 0)
      const scored = []
      if (totalWeight > 0) {
        for (const clip of clips) {
          const tags = new Set(effectiveClipTags(clip))
          const hit = dedup.filter((w) => tags.has(w.tag))
          if (!hit.length) continue
          let score = hit.reduce((sum, w) => sum + w.weight, 0) / totalWeight
          const short = shot.duration > 0 && clip.duration + 0.05 < shot.duration
          if (short) score -= 0.1
          if (used.has(clip.id)) score -= 0.15
          if (clip.reviewed) score += 0.02
          scored.push({ clipId: clip.id, score: round(Math.max(0, Math.min(1, score)), 2), duration: clip.duration, short, matched: hit.map((w) => w.tag), missing: dedup.filter((w) => !tags.has(w.tag)).map((w) => w.tag) })
        }
      }
      scored.sort((a, b) => b.score - a.score || Number(a.short) - Number(b.short) || b.duration - a.duration)
      const top = scored.slice(0, 3)
      const prior = keepManual ? previous?.shots?.find((s) => s.no === shot.no && s.manual && s.selected) : null
      const priorValid = prior && clips.some((clip) => clip.id === prior.selected)
      let selected = priorValid ? prior.selected : shot.tags.length && top[0] && top[0].score >= 0.6 ? top[0].clipId : null
      if (priorValid && !top.some((t) => t.clipId === prior.selected)) {
        const clip = index.clips[prior.selected]
        top.unshift({ clipId: clip.id, score: null, duration: clip.duration, short: shot.duration > 0 && clip.duration + 0.05 < shot.duration, matched: [], missing: [], manual: true })
      }
      if (selected) used.set(selected, (used.get(selected) || 0) + 1)
      const chosen = top.find((t) => t.clipId === selected)
      shots.push({
        no: shot.no, duration: shot.duration, desc: shot.desc, line: shot.line, required: dedup.map((w) => w.tag), size: shot.size, move: shot.move,
        warnings: shot.warnings, top, selected, manual: Boolean(priorValid),
        status: !selected ? 'missing' : chosen?.short ? 'short' : 'matched',
        note: !selected ? (!shot.tags.length ? '分镜缺少「所需标签」，不自动匹配' : top.length ? `最高分 ${top[0].score} 低于 0.6，未自动选用` : '素材库中未找到带这些标签的切片') : null
      })
    }
    const result = {
      at: now(),
      storyboardVersion: board.version, editUseStoryboard: board.editUse,
      scriptVersion: meta.files['02_文案.md']?.version ?? null, editUseScript: meta.editUse['02_文案.md'] ?? null,
      total: shots.length, matched: shots.filter((s) => s.status !== 'missing').length,
      shotsDuration: board.total, shots
    }
    await writeJson(matchFile(root), result)
    await appendLog(root, { action: 'edit.match', matched: result.matched, total: result.total, storyboardVersion: board.version })
    return result
  }

  async function select(root, no, clipId) {
    const data = await readJson(matchFile(root), null)
    if (!data) throw new WorkbenchError('还没有匹配结果。', 409)
    const shot = data.shots.find((s) => s.no === no)
    if (!shot) throw new WorkbenchError(`找不到镜头 ${no}。`, 404)
    const index = await indexStore.read(root)
    if (clipId && !index.clips[clipId]) throw new WorkbenchError(`找不到切片 ${clipId}。`, 404)
    shot.selected = clipId || null
    shot.manual = true
    const clip = clipId ? index.clips[clipId] : null
    shot.status = !clip ? 'missing' : shot.duration > 0 && clip.duration + 0.05 < shot.duration ? 'short' : 'matched'
    if (clip && !shot.top.some((t) => t.clipId === clipId)) shot.top.unshift({ clipId, score: null, duration: clip.duration, short: shot.status === 'short', matched: [], missing: [], manual: true })
    data.matched = data.shots.filter((s) => s.status !== 'missing').length
    await writeJson(matchFile(root), data)
    return shot
  }

  async function gaps(root) {
    const data = await readJson(matchFile(root), null)
    if (!data) throw new WorkbenchError('请先运行素材匹配。', 409)
    const list = data.shots.filter((s) => s.status !== 'matched').map((s) => ({ no: s.no, duration: s.duration, desc: s.desc, required: s.required, status: s.status === 'short' ? '时长不足' : '缺素材', suggestion: s.status === 'short' ? '补拍更长的镜头或缩短该镜' : '补拍，或用 AI 生成空镜' }))
    const md = ['# 缺口清单', '', `生成于 ${now()} · 分镜 v${data.storyboardVersion} · 缺 ${list.length} 镜`, '', '| 镜号 | 时长 | 画面描述 | 所需标签 | 问题 | 建议 |', '|---|---|---|---|---|---|',
      ...list.map((g) => `| ${g.no} | ${g.duration}s | ${g.desc.replace(/\|/g, '/')} | ${g.required.join(' ')} | ${g.status} | ${g.suggestion} |`)].join('\n') + '\n'
    await writeAtomic(path.join(root, P.creative, '缺口清单.md'), md)
    await writeJson(path.join(root, P.editData, 'gaps.json'), { at: now(), gaps: list })
    return { count: list.length, file: `${P.creative}/缺口清单.md`, gaps: list }
  }

  /** FR-35 — engine-independent timeline. */
  async function buildTimeline(root, project) {
    const data = await readJson(matchFile(root), null)
    if (!data) throw new WorkbenchError('请先运行素材匹配。', 409)
    const spec = await getSpec(root, project)
    const index = await indexStore.read(root)
    const video = []
    const subtitles = []
    const warnings = []
    let cursor = 0
    for (const shot of data.shots) {
      const clip = shot.selected && index.clips[shot.selected]
      if (!clip) { warnings.push(`镜 ${shot.no} 缺素材，已跳过`); continue }
      const want = shot.duration > 0 ? shot.duration : clip.duration
      const dur = Math.min(want, clip.duration)
      if (dur + 0.05 < want) warnings.push(`镜 ${shot.no} 素材只有 ${round(clip.duration, 2)}s，短于分镜 ${want}s`)
      const offset = Math.max(0, (clip.duration - dur) / 2)
      const raw = index.raws[clip.rawId]
      video.push({
        shot: shot.no, clipId: clip.id, start: round(cursor, 3), duration: round(dur, 3),
        source: { path: raw.path, in: round(clip.start + offset, 3), out: round(clip.start + offset + dur, 3), hasAudio: Boolean(raw.hasAudio), width: raw.width, height: raw.height },
        proxy: { path: clip.proxy, in: round(offset, 3), out: round(offset + dur, 3) },
        transitionIn: spec.transition === 'dissolve' && video.length ? { type: 'dissolve', duration: 0.5 } : { type: 'cut' }
      })
      if (shot.line) subtitles.push({ start: round(cursor, 3), end: round(cursor + dur, 3), text: shot.line })
      cursor += dur
    }
    if (!video.length) throw new WorkbenchError('没有任何已匹配的镜头，无法生成时间线。', 409)
    const timeline = {
      schema: 1, at: now(), spec,
      source: { storyboardVersion: data.storyboardVersion, scriptVersion: data.scriptVersion, matchAt: data.at },
      duration: round(cursor, 3), expected: data.shotsDuration,
      tracks: { video, subtitles, voiceover: [], bgm: null },
      warnings
    }
    await writeJson(timelineFile(root), timeline)
    await writeAtomic(path.join(root, P.editData, 'subtitles.srt'), toSrt(subtitles))
    await appendLog(root, { action: 'edit.timeline', segments: video.length, duration: timeline.duration })
    return timeline
  }

  async function videoEncoder(codec) {
    const caps = await ffmpeg.detect()
    const list = caps.encoders?.list || []
    if (codec === 'h265') {
      if (list.includes('libx265')) return { args: ['-c:v', 'libx265', '-preset', 'medium', '-tag:v', 'hvc1'], name: 'libx265' }
      const hw = ['hevc_nvenc', 'hevc_qsv', 'hevc_amf', 'hevc_videotoolbox', 'hevc_mf'].find((n) => list.includes(n))
      if (hw) return { args: ['-c:v', hw, '-tag:v', 'hvc1'], name: hw }
    }
    if (list.includes('libx264')) return { args: ['-c:v', 'libx264', '-preset', 'medium'], name: 'libx264', fallback: codec === 'h265' }
    const hw = ['h264_nvenc', 'h264_qsv', 'h264_amf', 'h264_videotoolbox', 'h264_mf'].find((n) => list.includes(n))
    if (hw) return { args: ['-c:v', hw], name: hw, fallback: codec === 'h265' }
    return { args: ['-c:v', 'mpeg4', '-q:v', '3'], name: 'mpeg4', fallback: true }
  }

  /** FR-36 — FFmpeg preview (proxies, low-res) or final render (originals at spec). */
  async function render({ root, project, kind, signal, progress }) {
    const timeline = await readJson(timelineFile(root), null)
    if (!timeline) throw new WorkbenchError('请先生成时间线。', 409)
    const spec = await getSpec(root, project)
    const res = RESOLUTIONS[spec.resolution]
    const preview = kind === 'preview'
    const W = preview ? (res.width >= res.height ? 960 : Math.round((960 * res.width) / res.height / 2) * 2) : res.width
    const H = preview ? (res.width >= res.height ? Math.round((960 * res.height) / res.width / 2) * 2 : 960) : res.height
    const enc = preview ? { args: ['-c:v', 'libx264', '-preset', 'ultrafast', '-crf', '28'], name: 'libx264' } : await videoEncoder(spec.codec)
    if (preview) {
      const caps = await ffmpeg.detect()
      if (!caps.encoders?.list?.includes('libx264')) Object.assign(enc, await videoEncoder('h264'))
    }
    const work = path.join(root, '.dsh', 'cache', 'render', `${kind}-${Date.now()}`)
    await mkdir(work, { recursive: true })
    const segments = timeline.tracks.video
    const burn = spec.subtitles.includes('burn')
    const fontStyle = "FontName=Microsoft YaHei,FontSize=" + (preview ? 16 : 18) + ",Outline=1,Shadow=0,MarginV=24"
    const total = segments.reduce((sum, s) => sum + s.duration, 0)
    let done = 0
    progress(0, Math.round(total), null)
    const files = []
    try {
      for (let i = 0; i < segments.length; i++) {
        signal.throwIfAborted()
        const seg = segments[i]
        const src = preview ? seg.proxy : seg.source
        const input = inside(root, src.path)
        const out = path.join(work, `seg_${String(i).padStart(3, '0')}.mp4`)
        const sub = timeline.tracks.subtitles.find((s) => Math.abs(s.start - seg.start) < 0.01)
        let vf = `scale=${W}:${H}:force_original_aspect_ratio=decrease,pad=${W}:${H}:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=${spec.fps},format=yuv420p`
        if (burn && sub) {
          await writeFile(path.join(work, `seg_${i}.srt`), toSrt([{ start: 0, end: seg.duration, text: sub.text }]))
          vf += `,subtitles=seg_${i}.srt:force_style='${fontStyle}'`
        }
        const args = ['-ss', src.in.toFixed(3), '-i', input]
        const hasAudio = preview ? seg.source.hasAudio : src.hasAudio
        if (!hasAudio) args.push('-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=stereo')
        args.push('-t', seg.duration.toFixed(3), '-map', '0:v:0', '-map', hasAudio ? '0:a:0' : '1:a:0', '-vf', vf, ...enc.args)
        if (!preview && !enc.args.includes('-crf') && !enc.args.includes('-q:v')) args.push('-b:v', `${spec.bitrateMbps}M`, '-maxrate', `${Math.round(spec.bitrateMbps * 1.5)}M`, '-bufsize', `${spec.bitrateMbps * 2}M`)
        args.push('-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-ac', '2', '-shortest', out)
        progress(Math.round(done), Math.round(total), `镜 ${seg.shot}`)
        await ffmpeg.ffmpeg(args, { signal, cwd: work })
        files.push(out)
        done += seg.duration
      }
      const list = path.join(work, 'list.txt')
      await writeFile(list, files.map((f) => `file '${path.basename(f)}'`).join('\n') + '\n')
      await mkdir(path.join(root, P.export), { recursive: true })
      const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\..+/, '').replace('T', '_')
      const safeName = project.name.replace(/[\\/:*?"<>|]+/g, '_')
      const output = path.join(root, P.export, preview ? `${safeName}_粗剪预览_${stamp}.mp4` : `${safeName}_${spec.resolution}_${spec.fps}fps_${stamp}.mp4`)
      await ffmpeg.ffmpeg(['-f', 'concat', '-safe', '0', '-i', 'list.txt', '-c', 'copy', '-movflags', '+faststart', output], { signal, cwd: work })
      const probe = await ffmpeg.probe(output)
      const actual = Number(probe?.format?.duration || 0)
      const vstream = probe?.streams?.find((s) => s.codec_type === 'video')
      let srt = null
      if (spec.subtitles.includes('srt') && timeline.tracks.subtitles.length) {
        srt = output.replace(/\.mp4$/, '.srt')
        await writeAtomic(srt, toSrt(timeline.tracks.subtitles))
      }
      const meta = await creative.readMeta(root)
      const manifest = {
        output: relTo(root, output), kind, createdAt: now(), spec,
        encoder: enc.name, encoderFallback: Boolean(enc.fallback),
        actual: { duration: round(actual, 3), width: vstream?.width, height: vstream?.height, fps: vstream ? round(evalRate(vstream.r_frame_rate || vstream.avg_frame_rate), 3) : null, codec: vstream?.codec_name },
        expected: { timeline: timeline.duration, storyboard: timeline.expected },
        durationError: round(Math.abs(actual - timeline.duration), 3),
        versions: { script: meta.files['02_文案.md']?.version ?? null, scriptEditUse: meta.editUse['02_文案.md'] ?? null, storyboard: timeline.source.storyboardVersion },
        subtitles: srt ? relTo(root, srt) : null,
        clips: segments.map((s) => ({ shot: s.shot, clipId: s.clipId, source: preview ? s.proxy.path : s.source.path, in: preview ? s.proxy.in : s.source.in, out: preview ? s.proxy.out : s.source.out })),
        notes: [
          ...(enc.fallback ? ['当前 FFmpeg 没有 H.265 编码器，已改用 H.264。'] : []),
          ...(spec.transition === 'dissolve' ? ['FFmpeg 出片目前按硬切处理；叠化转场保留在 timeline.json 中供剪映精修。'] : []),
          ...(timeline.warnings || [])
        ]
      }
      const manifestFile = output.replace(/\.mp4$/, '.manifest.json')
      await writeJson(manifestFile, manifest)
      await writeJson(path.join(root, P.export, 'manifest.json'), manifest)
      progress(Math.round(total), Math.round(total), null)
      await appendLog(root, { action: `edit.render.${kind}`, output: manifest.output, duration: manifest.actual.duration })
      return manifest
    } finally {
      await rm(work, { recursive: true, force: true }).catch(() => {})
    }
  }

  async function capcutDraft(root, project) {
    const status = await jianyingStatus(project.jianyingDraftDir)
    const timeline = await exists(timelineFile(root))
    throw new WorkbenchError(
      `剪映草稿适配器还没有接入：剪映草稿格式是社区逆向的，需要先在你使用的剪映版本上做验证（方案里的 M0）。${timeline ? '时间线（创意剪辑/剪辑数据/timeline.json）已就绪，' : ''}现在可以用「FFmpeg 粗剪预览」或「FFmpeg 直出」出片。${status.ok ? `已找到剪映草稿目录：${status.dir}` : status.reason || ''}`,
      501, 'CAPCUT_NOT_READY')
  }

  return { getSpec, setSpec, storyboardInUse, match, select, gaps, buildTimeline, render, capcutDraft, readMatch: (root) => readJson(matchFile(root), null), readTimeline: (root) => readJson(timelineFile(root), null) }
}

function evalRate(rate) {
  const [a, b] = String(rate || '0/1').split('/').map(Number)
  return b ? a / b : a
}
