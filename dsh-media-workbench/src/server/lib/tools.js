import path from 'node:path'
import { WorkbenchError } from './util.js'
import { DOCS } from './creative.js'
import { RESOLUTIONS } from './edit.js'

const DOC_KEYS = Object.keys(DOCS)
// The tag dictionary is changed only through tag operations (AI ideas go to 待审 first).
const WRITE_KEYS = DOC_KEYS.filter((key) => key !== '标签字典.yaml')
const JSON_OUTPUT = { schema: { type: 'json' }, render: (_args, value) => [{ type: 'text', text: typeof value === 'string' ? value : JSON.stringify(value, null, 1) }] }

const cwdOf = (exec) => exec?.agent?.session?.header?.cwd
const modelOf = (exec) => {
  const header = exec?.agent?.session?.header
  return header?.model?.name || header?.model || null
}

/**
 * Agent tools for the media workbench. Every tool resolves the project from the
 * session's working directory, so it can only act inside that project folder.
 * Tools named in RISKY ask for user approval with the concrete impact (FR-42).
 */
export function createTools(service) {
  const project = (exec) => service.openByDirectory(cwdOf(exec))

  async function waitJob(started, wait) {
    if (!wait) return { job: started.job, note: '任务已在后台运行，可用 media_job_status 查看进度。' }
    const timeout = new Promise((resolve) => setTimeout(() => resolve(null), 100_000))
    try {
      const finished = await Promise.race([started.done, timeout])
      if (!finished) return { job: started.job, status: 'running', note: '任务仍在后台运行（超过 100 秒），稍后用 media_job_status 查看。面板上有进度条。' }
      return { job: finished }
    } catch (error) {
      return { job: started.job, status: 'failed', error: error?.message || String(error) }
    }
  }

  const tools = [
    {
      name: 'media_context',
      description: 'Media workbench: read the current project state for this session (tag template and dictionary, target duration and output spec, which panel tab the user is looking at, creative file versions, footage cleaning/tagging counts, storyboard match status, running jobs, external tool status). Call this first in a media-workbench conversation, and whenever the request is ambiguous ("this", "here", "current tab").',
      parameters: {},
      async execute(_args, exec) {
        const { entry, root } = await project(exec)
        const o = await service.overview(entry.id)
        const rel = path.relative(root, cwdOf(exec) || root).split(path.sep).join('/')
        return {
          project: { name: o.project.name, folder: o.project.path },
          targetDuration: o.edit.spec.targetDuration ?? null,
          targetDurationNote: o.edit.spec.targetDuration ? undefined : '目标时长未设置：写文案/分镜前先看 00_主题简报.md 里的「目标时长」，没有就问用户，并可用 media_edit_spec_set 记下来。',
          tagTemplate: { key: o.material.tags.inherit, label: o.material.tags.inheritLabel },
          workingLibrary: rel && !rel.startsWith('..') ? rel.split('/')[0] : null,
          libraries: o.libraries.map((l) => `${l.dir}/ — ${l.hint}`),
          uiTab: o.context?.tab || null,
          creative: o.creative.docs.map((d) => ({ file: d.key, exists: d.exists, version: d.version, editUse: d.editUse, source: d.source, manualEdits: d.manualEdits })),
          storyboard: o.storyboard,
          footage: { imported: o.material.report.imported, kept: o.material.report.kept, rejected: o.material.report.rejected, pending: o.material.report.pending, clips: o.material.report.clips, tagging: o.material.report.tagging, eagleSynced: o.material.report.eagleSynced, unsupported: o.material.report.unsupported.length },
          dictionary: { dims: Object.fromEntries(o.material.tags.dims.map((d) => [d.dim, d.tags.map((t) => t.tag)])), pending: o.material.tags.pending.map((p) => (p.suggestedDim ? `${p.tag}（${p.suggestedDim}）` : p.tag)) },
          edit: { spec: o.edit.spec, matched: o.edit.match ? `${o.edit.match.matched}/${o.edit.match.total}` : null, staleMatch: o.edit.staleMatch, timeline: o.edit.timeline, exports: o.edit.exports.slice(0, 3).map((e) => e.path) },
          jobs: { running: o.jobs.running, queued: o.jobs.queue.length },
          tools: o.status
        }
      }
    },
    {
      name: 'media_creative_read',
      description: `Media workbench: read a creative document. file is one of ${DOC_KEYS.join(', ')}. Optional version like "v1" reads an archived version from _history.`,
      parameters: { file: { type: 'string', required: true, enum: DOC_KEYS }, version: { type: 'string', description: 'e.g. v1, v2_手改前; omit for current' } },
      async execute(args, exec) {
        const { root } = await project(exec)
        return service.creative.read(root, args.file, args.version)
      }
    },
    {
      name: 'media_creative_write',
      description: `Media workbench: write a creative document with automatic versioning — the previous content moves to _history and the version number increases; the panel refreshes immediately. Always use this instead of generic file tools for ${WRITE_KEYS.join(', ')}. Write the COMPLETE file content. 03_分镜脚本.md must contain a markdown table with columns 镜号|时长|画面描述|台词/旁白|所需标签|景别|运镜|备注; 所需标签 must use words from the tag dictionary (media_context → dictionary); for a needed word that is not in it, call media_tags_suggest. The tag dictionary itself is not written here: use media_tags_suggest (new ideas → 待审) or media_tags_update.`,
      parameters: { file: { type: 'string', required: true, enum: WRITE_KEYS }, content: { type: 'string', required: true }, note: { type: 'string', description: 'one-line change summary shown in the panel' } },
      async execute(args, exec) {
        const { root } = await project(exec)
        if (args.file === '标签字典.yaml' || String(args.file).includes('标签字典')) throw new WorkbenchError('标签字典不能整份改写：新标签请用 media_tags_suggest 放进待审，由用户在「标签」页转正；改名/合并/删除用 media_tags_update。')
        const result = await service.creative.write(root, args.file, args.content, { source: 'chat', model: modelOf(exec), note: args.note })
        service.bump(root)
        return result
      }
    },
    {
      name: 'media_creative_diff',
      description: 'Media workbench: line diff between two versions of a creative document (from, to like "v1", "v2"; to defaults to current).',
      parameters: { file: { type: 'string', required: true, enum: DOC_KEYS }, from: { type: 'string', required: true }, to: { type: 'string' } },
      async execute(args, exec) {
        const { root } = await project(exec)
        const diff = await service.creative.diff(root, args.file, args.from, args.to)
        return { ...diff, lines: diff.lines.filter((l) => l.type !== 'same').slice(0, 400) }
      }
    },
    {
      name: 'media_creative_rollback',
      description: 'Media workbench: restore an archived version of a creative document as the new current version (nothing is deleted).',
      parameters: { file: { type: 'string', required: true, enum: DOC_KEYS }, version: { type: 'string', required: true } },
      async execute(args, exec) {
        const { root } = await project(exec)
        const result = await service.creative.rollback(root, args.file, args.version)
        service.bump(root)
        return result
      }
    },
    {
      name: 'media_creative_set_edit_version',
      description: 'Media workbench: mark the CURRENT version of 02_文案.md or 03_分镜脚本.md as the version the edit module uses (剪辑使用版本). The edit tab then asks to re-match when it changes.',
      parameters: { file: { type: 'string', required: true, enum: ['02_文案.md', '03_分镜脚本.md'] } },
      async execute(args, exec) {
        const { root } = await project(exec)
        const result = await service.creative.setEditUse(root, args.file)
        service.bump(root)
        return result
      }
    },
    {
      name: 'media_tags_update',
      description: 'Media workbench: change the tag dictionary when the USER asks for it, and propagate to every clip (and mark Eagle items for re-sync). op: add (tag + dim), rename (tag → to), merge (tag into to), delete (tag), move (tag to another dim), approve (move a 待审 tag into dim), reject (drop a 待审 tag), add-dim / delete-dim (dim). For your own ideas use media_tags_suggest instead. Requires user approval showing how many clips change.',
      parameters: { op: { type: 'string', required: true, enum: ['add', 'rename', 'merge', 'delete', 'move', 'approve', 'reject', 'add-dim', 'delete-dim'] }, tag: { type: 'string' }, to: { type: 'string' }, dim: { type: 'string', description: '场景/主体/景别/运镜/情绪/用途 or another dimension' } },
      async execute(args, exec) {
        const { entry } = await project(exec)
        return service.tagOperation(entry.id, args, { source: 'chat' })
      }
    },
    {
      name: 'media_tag_samples',
      description: 'Media workbench: contact sheets (3 frames each) spread across the project footage — clips when the footage is already split, otherwise imported raw files — plus the current tag dictionary. Use it to look at the footage before suggesting tags; view each image with your image/file reading tool. Run media_import first if nothing has been imported.',
      parameters: { limit: { type: 'integer', description: 'number of samples (default 16, max 40)' } },
      async execute(args, exec) {
        const { root } = await project(exec)
        const result = await service.media.samples({ root, limit: args.limit, signal: exec.signal })
        const { effective } = await service.media.readDictionary(root)
        if (result.kind === 'none') return { samples: [], dictionary: effective.dims, note: '项目里还没有导入素材。先用 media_import 导入原始素材库里的视频，再来取样。' }
        return { kind: result.kind, samples: result.items, dictionary: effective.dims, pending: effective.pending, folder: root, note: '图片路径相对于项目根目录。看完图后，把字典里还没有、但素材里反复出现且对剪辑检索有用的词，用 media_tags_suggest 放进待审，并给出建议维度。' }
      }
    },
    {
      name: 'media_tags_suggest',
      description: 'Media workbench: propose NEW tags for the project dictionary. They go to the 待审 (pending) area with a suggested dimension; the user approves or rejects them in the 标签 tab. Use after looking at footage (media_tag_samples / media_keyframes) or from the brief/script/storyboard. Suggest concrete, reusable, searchable words (2–6 Chinese characters), one dimension each; skip words already in the dictionary or near-duplicates of them. Keep it to what you actually saw or what the script needs (usually 5–30 tags).',
      parameters: {
        items: { type: 'array', required: true, items: { type: 'object', additionalProperties: false, properties: { tag: { type: 'string', required: true }, dim: { type: 'string', description: '场景/主体/景别/运镜/情绪/用途 or an existing custom dimension' } } } }
      },
      async execute(args, exec) {
        const { entry } = await project(exec)
        const result = await service.suggestTags(entry.id, args.items, { source: 'chat' })
        return { ...result, note: result.added.length ? '已放进「标签」页的待审区，请用户确认转正。' : '没有新增待审标签。' }
      }
    },
    {
      name: 'media_import',
      description: 'Media workbench: scan 原始素材库 (and adopted source folders) and read duration/resolution/fps/shoot time with ffprobe. Read-only for the footage; updates the index.',
      parameters: { wait: { type: 'boolean', description: 'wait for completion (default true)' } },
      async execute(args, exec) {
        const { entry } = await project(exec)
        return waitJob(await service.runStep(entry.id, 'import'), args.wait !== false)
      }
    },
    {
      name: 'media_clean',
      description: 'Media workbench: keep/discard each imported raw clip with quantified evidence (clarity score, shake variance, duration, black-frame ratio, duplicate similarity) using the project rules. Discards are only registered in the project discard register (shown in the 素材 tab); raw files are never moved or deleted. force=true re-evaluates all clips except ones the user restored.',
      parameters: { force: { type: 'boolean' }, wait: { type: 'boolean' } },
      async execute(args, exec) {
        const { entry } = await project(exec)
        return waitJob(await service.runStep(entry.id, 'clean', { force: args.force === true }), args.wait !== false)
      }
    },
    {
      name: 'media_restore',
      description: 'Media workbench: restore discarded raw clips (by raw id such as C0031) so they are kept and can be split again.',
      parameters: { rawIds: { type: 'array', items: { type: 'string' }, required: true } },
      async execute(args, exec) {
        const { root, project: p } = await project(exec)
        const result = await service.media.restore(root, p, args.rawIds)
        service.bump(root)
        return result
      }
    },
    {
      name: 'media_split',
      description: 'Media workbench: split kept raw clips into shots by scene detection, writing 1080p H.264 proxies to 输出素材库/切片素材/<raw>/ and thumbnails. Only raws without clips are processed unless rawIds is given.',
      parameters: { rawIds: { type: 'array', items: { type: 'string' } }, wait: { type: 'boolean' } },
      async execute(args, exec) {
        const { entry } = await project(exec)
        return waitJob(await service.runStep(entry.id, 'split', { rawIds: args.rawIds?.length ? args.rawIds : undefined }), args.wait !== false)
      }
    },
    {
      name: 'media_transcribe',
      description: 'Media workbench: transcribe clips that have audio with local Whisper (optional; reports clearly when Whisper is not installed).',
      parameters: { clipIds: { type: 'array', items: { type: 'string' } }, wait: { type: 'boolean' } },
      async execute(args, exec) {
        const { entry } = await project(exec)
        return waitJob(await service.runStep(entry.id, 'transcribe', { clipIds: args.clipIds?.length ? args.clipIds : undefined }), args.wait !== false)
      }
    },
    {
      name: 'media_keyframes',
      description: 'Media workbench: make one 3-frame contact sheet (20%/50%/80%) per clip for tagging and return project-relative JPEG paths plus clip info and transcript. Omit clipIds to take up to `limit` untagged clips. Then view each image with your image/file reading tool and call media_tag_clips.',
      parameters: { clipIds: { type: 'array', items: { type: 'string' } }, limit: { type: 'integer', description: 'max clips when clipIds omitted (default 12, max 40)' } },
      async execute(args, exec) {
        const { root } = await project(exec)
        let ids = args.clipIds
        if (!ids?.length) {
          const { clips } = await service.media.listClips(root, { filter: 'untagged', limit: Math.min(Math.max(args.limit || 12, 1), 40) })
          ids = clips.map((c) => c.id)
          if (!ids.length) return { clips: [], note: '没有未打标的切片。' }
        }
        const clips = await service.media.keyframes({ root, clipIds: ids.slice(0, 40), signal: exec.signal })
        const { effective } = await service.media.readDictionary(root)
        return { clips, dictionary: effective.dims, folder: root, note: '图片路径相对于项目根目录（会话工作目录）。只能从 dictionary 里选标签；字典外的词会进入待审区。' }
      }
    },
    {
      name: 'media_tag_clips',
      description: 'Media workbench: save tags you chose for clips after viewing their keyframes. Only words in the tag dictionary are accepted; any other word goes to the 待审 (pending) area for the user. Give each tag a confidence 0–1; below 0.6 marks the clip 待复核. Never invent tags you did not see evidence for.',
      parameters: {
        items: {
          type: 'array', required: true,
          items: { type: 'object', additionalProperties: false, properties: {
            clipId: { type: 'string', required: true },
            tags: { type: 'array', required: true, items: { type: 'object', additionalProperties: false, properties: { tag: { type: 'string', required: true }, confidence: { type: 'number' }, dim: { type: 'string' } } } },
            transcript: { type: 'string' }
          } }
        }
      },
      async execute(args, exec) {
        const { root } = await project(exec)
        const result = await service.media.applyTags(root, args.items, { model: modelOf(exec) })
        service.bump(root)
        return result
      }
    },
    {
      name: 'media_clips',
      description: 'Media workbench: list clips with their tags. filter: review (needs human review), untagged, reviewed; or tag to list clips carrying a tag.',
      parameters: { tag: { type: 'string' }, filter: { type: 'string', enum: ['review', 'untagged', 'reviewed'] }, limit: { type: 'integer' } },
      async execute(args, exec) {
        const { root } = await project(exec)
        const { total, clips } = await service.media.listClips(root, { tag: args.tag, filter: args.filter, limit: Math.min(args.limit || 50, 300) })
        return { total, clips: clips.map((c) => ({ id: c.id, raw: c.raw, duration: c.duration, tags: c.tags, pending: c.pendingTags?.map((p) => p.tag), needsReview: c.needsReview, reviewed: c.reviewed, transcript: c.transcript || undefined })) }
      }
    },
    {
      name: 'media_eagle_sync',
      description: 'Media workbench: direction=push adds proxy clips with tags and notes (original path, in/out, transcript) into the project folder in Eagle and updates changed tags; direction=pull reads tag edits made in Eagle back into the project. Eagle must be running.',
      parameters: { direction: { type: 'string', enum: ['push', 'pull'], required: true }, wait: { type: 'boolean' } },
      async execute(args, exec) {
        const { entry } = await project(exec)
        return waitJob(await service.runStep(entry.id, args.direction === 'pull' ? 'eagle-pull' : 'eagle-push'), args.wait !== false)
      }
    },
    {
      name: 'media_edit_spec_set',
      description: `Media workbench: set output spec saved to 创意剪辑/剪辑数据/edit_spec.json. resolution: ${Object.keys(RESOLUTIONS).join(' | ')}; fps 24/25/30/50/60; codec h264|h265; bitrateMbps; targetDuration seconds; subtitles burn+srt|srt|burn|none; engine ffmpeg|jianying|both; transition cut|dissolve.`,
      parameters: { resolution: { type: 'string', enum: Object.keys(RESOLUTIONS) }, fps: { type: 'integer' }, codec: { type: 'string', enum: ['h264', 'h265'] }, bitrateMbps: { type: 'number' }, targetDuration: { type: 'number' }, subtitles: { type: 'string', enum: ['burn+srt', 'srt', 'burn', 'none'] }, engine: { type: 'string', enum: ['ffmpeg', 'jianying', 'both'] }, transition: { type: 'string', enum: ['cut', 'dissolve'] } },
      async execute(args, exec) {
        const { root, project: p } = await project(exec)
        const spec = await service.edit.setSpec(root, p, args)
        service.bump(root)
        return spec
      }
    },
    {
      name: 'media_match',
      description: 'Media workbench: match each storyboard shot (剪辑使用版本 of 03_分镜脚本.md) to clips by 所需标签/景别/运镜, saving Top3 candidates and the selection to 创意剪辑/剪辑数据/match.json. Unmatched shots are reported as missing — never claim a match that is not in the result.',
      parameters: { keepManual: { type: 'boolean', description: 'keep shots the user picked by hand (default true)' } },
      async execute(args, exec) {
        const { root } = await project(exec)
        const result = await service.edit.match(root, { keepManual: args.keepManual !== false })
        service.bump(root)
        return { matched: result.matched, total: result.total, storyboardVersion: result.storyboardVersion, shots: result.shots.map((s) => ({ no: s.no, status: s.status, selected: s.selected, top: s.top.map((t) => `${t.clipId}(${t.score ?? '手选'})`), required: s.required, note: s.note })) }
      }
    },
    {
      name: 'media_edit_select',
      description: 'Media workbench: choose a specific clip for a storyboard shot (or clipId empty to clear).',
      parameters: { no: { type: 'string', required: true }, clipId: { type: 'string' } },
      async execute(args, exec) {
        const { root } = await project(exec)
        const result = await service.edit.select(root, args.no, args.clipId || null)
        service.bump(root)
        return result
      }
    },
    {
      name: 'media_gaps',
      description: 'Media workbench: export the gap list (shots with no or too-short footage) to 创意剪辑/缺口清单.md for reshoots or AI-generated b-roll.',
      parameters: {},
      async execute(_args, exec) {
        const { root } = await project(exec)
        const result = await service.edit.gaps(root)
        service.bump(root)
        return result
      }
    },
    {
      name: 'media_timeline_build',
      description: 'Media workbench: build the engine-independent 创意剪辑/剪辑数据/timeline.json (shot order, original paths, in/out points, subtitles from 台词) and 创意剪辑/剪辑数据/subtitles.srt from the current match.',
      parameters: {},
      async execute(_args, exec) {
        const { root, project: p } = await project(exec)
        const t = await service.edit.buildTimeline(root, p)
        service.bump(root)
        return { duration: t.duration, expected: t.expected, segments: t.tracks.video.length, subtitles: t.tracks.subtitles.length, warnings: t.warnings }
      }
    },
    {
      name: 'media_render',
      description: 'Media workbench: kind=preview renders a fast low-res rough cut from proxies; kind=final renders the film from original footage at the output spec into 输出素材库/成片 with a manifest.json (versions + clip list). Build the timeline first.',
      parameters: { kind: { type: 'string', enum: ['preview', 'final'], required: true }, wait: { type: 'boolean' } },
      async execute(args, exec) {
        const { entry } = await project(exec)
        return waitJob(await service.runStep(entry.id, args.kind === 'final' ? 'render-final' : 'render-preview'), args.wait !== false)
      }
    },
    {
      name: 'media_capcut_draft',
      description: 'Media workbench: generate a JianYing (剪映) draft from timeline.json. Currently reports that the adapter is not yet verified and offers the FFmpeg fallback.',
      parameters: {},
      async execute(_args, exec) {
        const { root, project: p } = await project(exec)
        return service.edit.capcutDraft(root, p)
      }
    },
    {
      name: 'media_job_status',
      description: 'Media workbench: progress of background jobs (import, clean, split, eagle sync, render). Pass cancel=true with jobId to cancel.',
      parameters: { jobId: { type: 'string' }, cancel: { type: 'boolean' } },
      async execute(args, exec) {
        const { root } = await project(exec)
        if (args.cancel) return { cancelled: service.jobs.cancel(root, args.jobId) }
        return args.jobId ? (await service.jobs.get(root, args.jobId)) || { error: '找不到该任务' } : service.jobs.list(root)
      }
    }
  ]
  return tools
}

/** Which calls need explicit approval, and the impact sentence shown to the user (P3 先确认再动手). */
export async function approvalFor(service, exec) {
  const args = exec.arguments || {}
  const p = () => service.openByDirectory(cwdOf(exec))
  switch (exec.name) {
    case 'media_creative_write': {
      const { root } = await p()
      const current = await service.creative.read(root, args.file).catch(() => null)
      if (!current?.exists || current.content === args.content) return null
      return `覆盖 ${current.key}（v${current.version} → v${current.version + 1}），旧版本自动存入 _history，可随时回滚`
    }
    case 'media_creative_rollback': {
      const { root } = await p()
      const current = await service.creative.read(root, args.file).catch(() => null)
      return `把 ${args.file} 回滚到 ${args.version}（当前 v${current?.version ?? '?'} 会存入 _history）`
    }
    case 'media_tags_update': {
      const { entry } = await p()
      const impact = await service.tagImpact(entry.id, args)
      return `${impact.summary}：更新 ${impact.clips} 条切片标签${impact.eagle ? `，其中 ${impact.eagle} 条需要同步到 Eagle` : ''}`
    }
    case 'media_clean': {
      const { root } = await p()
      const index = await service.indexStore.read(root)
      const raws = Object.values(index.raws).filter((r) => !r.missing)
      const n = args.force ? raws.filter((r) => !r.restored).length : raws.filter((r) => r.status === 'pending').length
      if (!n) return null
      return `清洗 ${n} 条原片：判定丢弃的只做登记（原片不移动、不删除，可在素材页一键恢复）${args.force ? '；会重新评估已清洗过的原片' : ''}`
    }
    case 'media_restore':
      return `恢复 ${(args.rawIds || []).length} 条被丢弃的原片（${(args.rawIds || []).slice(0, 5).join('、')}），恢复后需要重新切片`
    case 'media_tag_clips': {
      const { root } = await p()
      const index = await service.indexStore.read(root)
      const ids = (args.items || []).map((i) => i?.clipId)
      const reviewed = ids.filter((id) => index.clips[id]?.reviewed).length
      const tagged = ids.filter((id) => index.clips[id]?.tagStatus === 'tagged' || index.clips[id]?.tagStatus === 'manual').length
      if (!tagged && !reviewed) return null
      return `重新打标会覆盖 ${tagged} 条切片的现有标签${reviewed ? `（其中 ${reviewed} 条已人工复核）` : ''}`
    }
    case 'media_eagle_sync': {
      const { root } = await p()
      const index = await service.indexStore.read(root)
      const clips = Object.values(index.clips)
      if (args.direction === 'pull') return `从 Eagle 拉取标签，可能改写本地 ${clips.filter((c) => c.eagle?.id).length} 条已入库切片的标签`
      const add = clips.filter((c) => !c.eagle?.id || c.eagle?.missing).length
      const upd = clips.filter((c) => c.eagle?.id && c.eagle?.dirty).length
      return `同步 Eagle：新增 ${add} 条代理切片（复制进 Eagle 资料库），更新 ${upd} 条标签`
    }
    case 'media_render': {
      if (args.kind !== 'final') return null
      const { root, project: proj } = await p()
      const spec = await service.edit.getSpec(root, proj)
      const timeline = await service.edit.readTimeline(root)
      return `正式渲染：${spec.resolution} · ${spec.fps}fps · ${spec.codec.toUpperCase()} ${spec.bitrateMbps}Mbps，时长约 ${timeline?.duration ?? '?'} 秒，输出到 输出素材库/成片`
    }
    default:
      return null
  }
}

export const TOOL_NAMES = new Set(['media_context', 'media_creative_read', 'media_creative_write', 'media_creative_diff', 'media_creative_rollback', 'media_creative_set_edit_version', 'media_tags_update', 'media_tag_samples', 'media_tags_suggest', 'media_import', 'media_clean', 'media_restore', 'media_split', 'media_transcribe', 'media_keyframes', 'media_tag_clips', 'media_clips', 'media_eagle_sync', 'media_edit_spec_set', 'media_match', 'media_edit_select', 'media_gaps', 'media_timeline_build', 'media_render', 'media_capcut_draft', 'media_job_status'])

export { JSON_OUTPUT, WorkbenchError }
