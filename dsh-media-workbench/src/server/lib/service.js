import { watch } from 'node:fs'
import { readdir, stat, mkdir, readFile } from 'node:fs/promises'
import { spawn } from 'node:child_process'
import path from 'node:path'
import os from 'node:os'
import { WorkbenchError, createLocks, exists, inside, readJson, writeJson, now, appendLog, realDirectory } from './util.js'
import { createRegistry, initProject, readProject, writeProject, sanitizeSpec, sanitizeRules, ensureLayout } from './project.js'
import { LIBRARIES, P } from './layout.js'
import { createCreativeStore, DOCS } from './creative.js'
import { createIndexStore } from './store.js'
import { createJobs } from './jobs.js'
import { createFFmpeg } from './ffmpeg.js'
import { createEagle } from './eagle.js'
import { createMedia } from './media.js'
import { createEdit, jianyingStatus, RESOLUTIONS, FPS_OPTIONS } from './edit.js'
import { applyTagOperation, parseDictionary, serializeDictionary, defaultDictionaryText, effectiveDictionary, switchTemplate, tagIndex } from './tags.js'
import { createTemplateStore, cleanDims } from './templates.js'

const BRIEF_TEMPLATE = (name) => `# 主题简报\n项目：${name}\n平台：\n目标时长：\n受众：\n基调：\n拍摄日期：\n参考资料：（放在 创意剪辑/参考资料/ 文件夹）\n`

/**
 * The workbench service: everything the HTTP routes and the Agent tools share.
 * Each project is a folder; this service never reads or writes outside it,
 * except its own registry/settings under the DSH home (config.root).
 */
const PREVIEWABLE = /\.(mp4|mov|m4v|webm|jpe?g|png|gif|webp|mp3|wav|m4a|aac|srt|json)$/i
const readFileText = (file) => readFile(file, 'utf8')

export function createService({ home, logger }) {
  const lock = createLocks()
  const registry = createRegistry(home)
  const settingsFile = path.join(home, 'settings.json')
  const revisions = new Map()
  const watchers = new Map()
  const contexts = new Map()
  let disposed = false

  const bump = (root) => revisions.set(root, (revisions.get(root) || 0) + 1)

  async function readSettings() {
    const saved = await readJson(settingsFile, {})
    return { ffmpegPath: '', ffprobePath: '', eaglePort: 41595, ...saved }
  }

  let resolvedPaths = null
  async function ffmpegPaths() {
    const settings = await readSettings()
    if (settings.ffmpegPath) return { ffmpeg: settings.ffmpegPath, ffprobe: settings.ffprobePath || siblingProbe(settings.ffmpegPath) }
    if (resolvedPaths && Date.now() - resolvedPaths.at < 300_000) return resolvedPaths.value
    // PATH first, then common Windows install locations (winget / scoop / chocolatey / C:\ffmpeg).
    const candidates = ['ffmpeg']
    if (process.platform === 'win32') {
      const local = process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local')
      candidates.push(path.join(local, 'Microsoft', 'WinGet', 'Links', 'ffmpeg.exe'), path.join(os.homedir(), 'scoop', 'shims', 'ffmpeg.exe'), 'C:\\ProgramData\\chocolatey\\bin\\ffmpeg.exe', 'C:\\ffmpeg\\bin\\ffmpeg.exe', 'D:\\ffmpeg\\bin\\ffmpeg.exe')
    } else if (process.platform === 'darwin') candidates.push('/opt/homebrew/bin/ffmpeg', '/usr/local/bin/ffmpeg')
    let value = { ffmpeg: 'ffmpeg', ffprobe: 'ffprobe' }
    for (const candidate of candidates) {
      if (candidate !== 'ffmpeg' && !(await exists(candidate))) continue
      const ok = await new Promise((resolve) => {
        try {
          const child = spawn(candidate, ['-version'], { windowsHide: true, stdio: 'ignore' })
          child.on('error', () => resolve(false))
          child.on('close', (code) => resolve(code === 0))
        } catch { resolve(false) }
      })
      if (ok) { value = { ffmpeg: candidate, ffprobe: candidate === 'ffmpeg' ? 'ffprobe' : siblingProbe(candidate) }; break }
    }
    resolvedPaths = { at: Date.now(), value }
    return value
  }

  const templates = createTemplateStore(home)
  const ffmpeg = createFFmpeg(ffmpegPaths)
  const eagle = createEagle(async () => `http://127.0.0.1:${(await readSettings()).eaglePort || 41595}`)
  const creative = createCreativeStore({ lock })
  const indexStore = createIndexStore({ lock })
  const jobs = createJobs({ onChange: bump })
  const media = createMedia({ ffmpeg, indexStore, creative, eagle, templates })
  const edit = createEdit({ creative, indexStore, ffmpeg })

  function startWatch(root) {
    if (watchers.has(root) || disposed) return
    let timer = null
    try {
      const watcher = watch(root, { recursive: true }, (_event, file) => {
        const name = String(file || '').replace(/\\/g, '/')
        if (/^\.dsh\/(cache|log|jobs\.json)/.test(name) || name.endsWith('.tmp')) return
        clearTimeout(timer)
        timer = setTimeout(() => bump(root), 120)
      })
      watcher.on('error', () => { watchers.delete(root) })
      watchers.set(root, watcher)
    } catch (error) {
      logger?.warn?.('media-workbench: file watch unavailable for %s: %s', root, error?.message)
      watchers.set(root, null)
    }
  }

  /** Resolve a registered project and mark it as recently used. */
  async function open(projectId) {
    const entry = await registry.get(projectId)
    if (!(await exists(path.join(entry.path, '.dsh', 'project.json')))) throw new WorkbenchError(`项目路径失效：${entry.path}。请在项目列表里「重新定位」。`, 410, 'PATH_MISSING')
    await ensureLayout(entry.path)
    const project = await readProject(entry.path)
    startWatch(entry.path)
    return { root: entry.path, project, entry }
  }

  /** Agent tools find the project from the session's working directory. */
  async function openByDirectory(cwd) {
    if (!cwd) throw new WorkbenchError('当前会话没有工作目录。请在媒体工作台里为项目开始对话。', 409, 'NO_WORKSPACE')
    let dir = await realDirectory(cwd)
    for (let i = 0; i < 4; i++) {
      if (await exists(path.join(dir, '.dsh', 'project.json'))) break
      const parent = path.dirname(dir)
      if (parent === dir) break
      dir = parent
    }
    if (!(await exists(path.join(dir, '.dsh', 'project.json')))) throw new WorkbenchError('当前会话的工作区不是媒体项目。请在媒体工作台里新建或打开项目，再从工作台开始对话。', 409, 'NOT_PROJECT')
    let entry = await registry.findByPath(dir)
    await ensureLayout(dir)
    const project = await readProject(dir)
    if (!entry) entry = await registry.upsert({ id: project.id, name: project.name, path: dir, createdAt: now(), openedAt: now() })
    startWatch(dir)
    return { root: dir, project, entry }
  }

  async function saveProject(root, values) {
    return lock(`project:${root}`, async () => {
      const project = await readProject(root)
      const next = { ...project, ...values }
      await writeProject(root, next)
      bump(root)
      return next
    })
  }

  async function countMedia(root) {
    const index = await indexStore.read(root)
    return { raws: Object.keys(index.raws).length, clips: Object.keys(index.clips).length }
  }

  async function registerProject(root, project) {
    const counts = await countMedia(root)
    const existing = await registry.findByPath(root)
    return registry.upsert({ ...(existing || {}), id: existing?.id || project.id, name: project.name, path: root, createdAt: existing?.createdAt || project.createdAt || now(), openedAt: now(), archived: false, counts })
  }

  async function seedProject(root, project) {
    const list = await creative.list(root)
    const has = (key) => list.find((item) => item.key === key)?.exists
    if (!has('00_主题简报.md')) await creative.write(root, '00_主题简报.md', BRIEF_TEMPLATE(project.name), { source: 'manual', note: '项目创建时生成的空白简报' })
    if (!has('标签字典.yaml')) {
      const template = await templates.get(project.template)
      await creative.write(root, '标签字典.yaml', defaultDictionaryText(project.template), { source: 'system', note: `继承标签模板「${template?.label || project.template}」` })
    }
  }

  async function tryEagleFolder(root, project) {
    try {
      const info = await eagle.info()
      if (!info.connected) return null
      const folderId = await eagle.ensureFolder(project.eagle.folderName || project.name, project.eagle.folderId)
      if (folderId !== project.eagle.folderId) await saveProject(root, { eagle: { ...project.eagle, folderId } })
      return folderId
    } catch (error) {
      logger?.info?.('media-workbench: eagle folder deferred: %s', error?.message)
      return null
    }
  }

  async function status(root, project) {
    const [ff, eagleInfo, jy] = await Promise.all([ffmpeg.detect(), eagle.info(), jianyingStatus(project.jianyingDraftDir)])
    return {
      folder: true,
      ffmpeg: { ok: ff.ffmpeg && ff.ffprobe, version: ff.version, h265: ff.encoders.h265, h264: ff.encoders.h264, path: ff.paths.ffmpeg },
      eagle: { connected: eagleInfo.connected, version: eagleInfo.version || null, folderId: project.eagle.folderId },
      jianying: jy
    }
  }

  async function exportsList(root) {
    const dir = path.join(root, P.export)
    let names = []
    try { names = await readdir(dir) } catch { return [] }
    const out = []
    for (const name of names) {
      if (!/\.mp4$/i.test(name)) continue
      const info = await stat(path.join(dir, name))
      const manifest = await readJson(path.join(dir, name.replace(/\.mp4$/i, '.manifest.json')), null)
      out.push({ name, path: `${P.export}/${name}`, size: info.size, at: info.mtime.toISOString(), manifest: manifest ? { kind: manifest.kind, duration: manifest.actual?.duration, width: manifest.actual?.width, height: manifest.actual?.height, fps: manifest.actual?.fps, durationError: manifest.durationError, versions: manifest.versions, notes: manifest.notes } : null })
    }
    return out.sort((a, b) => b.at.localeCompare(a.at))
  }

  async function overview(projectId) {
    const { root, project, entry } = await open(projectId)
    const [docs, report, tags, spec, matchData, timeline, exportsInfo, jobList, st, board, meta] = await Promise.all([
      creative.list(root), media.computeReport(root, project), media.tagSummary(root), edit.getSpec(root, project), edit.readMatch(root),
      edit.readTimeline(root), exportsList(root), jobs.list(root), status(root, project), edit.storyboardInUse(root).catch(() => null), creative.readMeta(root)
    ])
    const idea = await creative.read(root, '剪辑思路.md').catch(() => null)
    const staleMatch = Boolean(matchData && board && !board.missing && matchData.storyboardVersion !== board.version)
    const counts = { raws: report.imported, clips: report.clips }
    if (JSON.stringify(entry.counts || {}) !== JSON.stringify(counts)) registry.patch(entry.id, { counts, updatedAt: now() }).catch(() => {})
    return {
      revision: revisions.get(root) || 0,
      project: { id: entry.id, name: project.name, path: root, spec: project.spec, template: project.template, cleanRules: project.cleanRules, eagle: project.eagle, jianyingDraftDir: project.jianyingDraftDir, rawSources: project.rawSources, sessionId: entry.sessionId || null, sessions: entry.sessions || {} },
      libraries: LIBRARIES,
      status: st,
      creative: { docs, editUse: meta.editUse },
      storyboard: board ? { version: board.version, currentVersion: board.currentVersion, editUse: board.editUse, total: board.total, count: board.shots?.length || 0, missing: Boolean(board.missing), hasTable: board.hasTable, warnings: (board.shots || []).filter((s) => s.warnings.length).map((s) => ({ no: s.no, warnings: s.warnings })) } : null,
      material: { report, tags },
      edit: {
        spec, options: { resolutions: RESOLUTIONS, fps: FPS_OPTIONS },
        idea: idea?.exists ? { content: idea.content, version: idea.version } : null,
        match: matchData, staleMatch,
        timeline: timeline ? { at: timeline.at, duration: timeline.duration, expected: timeline.expected, segments: timeline.tracks.video.length, warnings: timeline.warnings, source: timeline.source } : null,
        exports: exportsInfo
      },
      jobs: jobList,
      context: contexts.get(entry.id) || null,
      templates: (await templates.list()).map((t) => ({ key: t.key, label: t.label, builtin: t.builtin }))
    }
  }

  /** Start a media job; returns immediately with its id. */
  async function runStep(projectId, step, options = {}) {
    const { root, project } = await open(projectId)
    const common = { root, project }
    const steps = {
      import: (ctx) => media.importRaw({ ...common, ...ctx }),
      clean: (ctx) => media.clean({ ...common, ...ctx, force: Boolean(options.force) }),
      split: (ctx) => media.split({ ...common, ...ctx, rawIds: options.rawIds }),
      keyframes: (ctx) => media.keyframes({ ...common, ...ctx, clipIds: options.clipIds }),
      transcribe: (ctx) => media.transcribe({ ...common, ...ctx, clipIds: options.clipIds }),
      'eagle-push': (ctx) => media.eaglePush({ ...common, ...ctx, saveProject: (values) => saveProject(root, values) }),
      'eagle-pull': (ctx) => media.eaglePull({ ...common, ...ctx }),
      'render-preview': (ctx) => edit.render({ ...common, ...ctx, kind: 'preview' }),
      'render-final': (ctx) => edit.render({ ...common, ...ctx, kind: 'final' })
    }
    if (!steps[step]) throw new WorkbenchError(`未知步骤：${step}`)
    if (step.startsWith('render') || ['import', 'clean', 'split', 'keyframes'].includes(step)) {
      const caps = await ffmpeg.detect()
      if (!caps.ffmpeg || !caps.ffprobe) throw new WorkbenchError('未检测到 FFmpeg/ffprobe。请安装 FFmpeg 并加入 PATH（或在工作台设置里填写 ffmpeg.exe 路径），然后重试。', 424, 'FFMPEG_MISSING')
    }
    return jobs.start(root, step, steps[step], { params: options.force || options.rawIds || options.clipIds ? { force: options.force, rawIds: options.rawIds, clipIds: options.clipIds } : null })
  }

  /** Apply one operation or a list ({ ops: [...] }) to the dictionary in memory. */
  function planTagOps(dictionary, input, all) {
    const ops = Array.isArray(input?.ops) ? input.ops : [input]
    if (!ops.length) throw new WorkbenchError('没有要执行的标签操作。')
    if (ops.length > 200) throw new WorkbenchError('一次最多 200 个标签操作。')
    let current = dictionary
    const steps = []
    for (const op of ops) {
      const applied = applyTagOperation(current, op, all)
      steps.push(applied)
      current = applied.dictionary
    }
    const summary = steps.length === 1 ? steps[0].summary : `${steps.length} 项标签操作（${steps.slice(0, 3).map((s) => s.summary).join('；')}${steps.length > 3 ? '…' : ''}）`
    return { dictionary: current, steps, summary }
  }

  async function tagImpact(projectId, input) {
    const { root } = await open(projectId)
    const { dictionary, templates: all } = await media.readDictionary(root)
    const plan = planTagOps(dictionary, input, all)
    const index = await indexStore.read(root)
    const affected = Object.values(index.clips).filter((clip) => plan.steps.some((step) => step.affects(clip)))
    return { summary: plan.summary, clips: affected.length, eagle: affected.filter((clip) => clip.eagle?.id).length }
  }

  /** FR-24 — dictionary change propagated to every clip and flagged for Eagle. One dictionary version per call. */
  async function tagOperation(projectId, input, { source = 'manual' } = {}) {
    const { root } = await open(projectId)
    const { dictionary, templates: all } = await media.readDictionary(root)
    const plan = planTagOps(dictionary, input, all)
    const changed = await indexStore.update(root, (index) => {
      let n = 0
      for (const clip of Object.values(index.clips)) {
        let touched = false
        for (const applied of plan.steps) {
          if (!applied.affects(clip)) continue
          touched = true
          if (applied.approve) {
            const moved = (clip.pendingTags || []).filter((p) => p.tag === applied.approve.tag)
            clip.pendingTags = (clip.pendingTags || []).filter((p) => p.tag !== applied.approve.tag)
            clip.tags = [...new Set([...(clip.tags || []), applied.approve.tag])]
            clip.aiTags = [...(clip.aiTags || []), ...moved.map((p) => ({ tag: p.tag, dim: applied.approve.dim, confidence: p.confidence ?? 0.8 }))]
          } else if (applied.reject) {
            clip.pendingTags = (clip.pendingTags || []).filter((p) => p.tag !== applied.reject)
          } else if (applied.retag) {
            clip.aiTags = (clip.aiTags || []).map((t) => (t.tag === applied.retag.tag ? { ...t, dim: applied.retag.dim } : t))
          } else {
            clip.tags = applied.mapTags(clip.tags || [])
            const seen = new Set()
            clip.aiTags = (clip.aiTags || []).map((t) => ({ ...t, tag: applied.mapTags([t.tag])[0] })).filter((t) => t.tag && !seen.has(t.tag) && seen.add(t.tag))
          }
        }
        if (!touched) continue
        if (clip.eagle?.id) clip.eagle.dirty = true
        n++
      }
      return n
    })
    await creative.write(root, '标签字典.yaml', serializeDictionary(plan.dictionary), { source: source === 'manual' ? 'tags-op' : 'chat', note: plan.summary })
    await appendLog(root, { action: 'tags.op', ops: Array.isArray(input?.ops) ? input.ops : [input], clips: changed, source })
    bump(root)
    return { summary: plan.summary, clips: changed }
  }

  /** Several AI suggestions in one dictionary version (they all land in 待审). */
  async function suggestTags(projectId, items, { source = 'chat' } = {}) {
    const { root } = await open(projectId)
    const { dictionary, templates: all } = await media.readDictionary(root)
    let current = dictionary
    const added = []
    const skipped = []
    for (const item of Array.isArray(items) ? items : []) {
      const tag = typeof item === 'string' ? item.trim() : String(item?.tag || '').trim()
      const dim = typeof item === 'object' && item?.dim ? String(item.dim).trim() : ''
      if (!tag) continue
      try {
        current = applyTagOperation(current, { op: 'suggest', tag, dim }, all).dictionary
        added.push(dim ? { tag, dim } : { tag })
      } catch (error) { skipped.push({ tag, reason: error.message }) }
    }
    if (!added.length) return { added, skipped, pending: current.pending.length }
    await creative.write(root, '标签字典.yaml', serializeDictionary(current), { source, note: `AI 建议 ${added.length} 个新标签进入待审` })
    await appendLog(root, { action: 'tags.suggest', tags: added.map((t) => t.tag), source })
    bump(root)
    return { added, skipped, pending: current.pending.length }
  }

  /** Tags that clips of a project use (so switching or editing templates never strips them). */
  async function usedTags(root) {
    const index = await indexStore.read(root)
    const used = new Set()
    for (const clip of Object.values(index.clips)) for (const tag of clip.tags || []) used.add(tag)
    return used
  }

  /** Preview or apply a template switch for one project. */
  async function switchProjectTemplate(projectId, key, { apply = false } = {}) {
    const { root } = await open(projectId)
    const all = await templates.all()
    if (!all[key]) throw new WorkbenchError('模板不存在。', 404, 'NO_TEMPLATE')
    const { dictionary } = await media.readDictionary(root)
    if (dictionary.inherit === key) throw new WorkbenchError(`当前已经在使用「${all[key].label}」。`)
    const result = switchTemplate(dictionary, key, all, await usedTags(root))
    const summary = { from: all[dictionary.inherit]?.label || dictionary.inherit, to: all[key].label, added: result.added, dropped: result.dropped, kept: result.kept }
    if (!apply) return summary
    await creative.write(root, '标签字典.yaml', serializeDictionary(result.dictionary), { source: 'tags-op', note: `标签模板从「${summary.from}」换成「${summary.to}」` })
    await saveProject(root, { template: key })
    await appendLog(root, { action: 'tags.template', from: dictionary.inherit, to: key, kept: result.kept })
    bump(root)
    return { ...summary, applied: true }
  }

  /**
   * Edit a global template. Every registered project inheriting it keeps the
   * tags its clips already use (they become project tags), so an edit never
   * strips tags off footage.
   */
  async function saveTemplate(key, values) {
    const before = await templates.all()
    if (!before[key]) throw new WorkbenchError('模板不存在。', 404, 'NO_TEMPLATE')
    const saved = await templates.save(key, values)
    const after = await templates.all()
    const preserved = await preserveUsedTags(key, before, after)
    return { template: saved, preserved }
  }

  async function preserveUsedTags(key, before, after) {
    const out = []
    for (const entry of await registry.list()) {
      if (entry.missing) continue
      try {
        await ensureLayout(entry.path)
        const { dictionary } = await media.readDictionary(entry.path)
        if (dictionary.inherit !== key) continue
        const used = await usedTags(entry.path)
        const known = tagIndex(effectiveDictionary(dictionary, after))
        const lost = []
        for (const [dim, tags] of Object.entries(effectiveDictionary(dictionary, before).dims)) {
          for (const tag of tags) if (used.has(tag) && !known.has(tag)) lost.push([dim, tag])
        }
        if (!lost.length) { bump(entry.path); continue }
        const next = { ...dictionary, dims: Object.fromEntries(Object.entries(dictionary.dims).map(([k, v]) => [k, [...v]])) }
        for (const [dim, tag] of lost) (next.dims[dim] ||= []).push(tag)
        await creative.write(entry.path, '标签字典.yaml', serializeDictionary(next), { source: 'system', note: `模板「${after[key].label}」改动后，保留切片在用的 ${lost.length} 个标签` })
        bump(entry.path)
        out.push({ project: entry.name, tags: lost.map(([, tag]) => tag) })
      } catch (error) { logger?.info?.('media-workbench: template sync skipped %s: %s', entry.path, error?.message) }
    }
    return out
  }

  async function projectsUsingTemplate(key) {
    const names = []
    for (const entry of await registry.list()) {
      if (entry.missing) continue
      const project = await readJson(path.join(entry.path, '.dsh', 'project.json'), null)
      if (project?.template === key) names.push(entry.name)
    }
    return names
  }

  return {
    registry, creative, media, edit, jobs, ffmpeg, eagle, indexStore,
    open, openByDirectory, overview, runStep, tagImpact, tagOperation, suggestTags, saveProject, status,
    templates,
    async listTemplates(projectId) {
      const list = await templates.list()
      let current = null
      if (projectId) { try { current = (await media.readDictionary((await open(projectId)).root)).dictionary.inherit } catch { current = null } }
      return { templates: list, current }
    },
    switchProjectTemplate,
    saveTemplate,
    async createTemplate({ label, dims, fromProject, use }) {
      let source = dims
      let createdFrom = null
      let root = null
      if (fromProject) {
        const opened = await open(fromProject)
        root = opened.root
        const { effective } = await media.readDictionary(root)
        source = effective.dims
        createdFrom = opened.project.name
      }
      const template = await templates.create({ label, dims: cleanDims(source), createdFrom })
      let switched = null
      if (fromProject && use) {
        // The new template already holds every project tag: inherit it and keep the project list lean.
        const { dictionary } = await media.readDictionary(root)
        const next = { ...dictionary, inherit: template.key, dims: Object.fromEntries(Object.keys(dictionary.dims).map((dim) => [dim, []])) }
        await creative.write(root, '标签字典.yaml', serializeDictionary(next), { source: 'tags-op', note: `另存为模板「${template.label}」并改用它` })
        await saveProject(root, { template: template.key })
        bump(root)
        switched = template.key
      }
      return { template, switched }
    },
    async removeTemplate(key) {
      const target = await templates.get(key)
      if (!target) throw new WorkbenchError('模板不存在。', 404, 'NO_TEMPLATE')
      if (target.builtin) throw new WorkbenchError('内置模板不能删除，可以「恢复默认」。')
      const users = await projectsUsingTemplate(key)
      if (users.length) throw new WorkbenchError(`还有项目在用这个模板：${users.slice(0, 5).join('、')}${users.length > 5 ? ' 等' : ''}。先把它们换成别的模板再删除。`, 409, 'TEMPLATE_IN_USE')
      return templates.remove(key)
    },
    async resetTemplate(key) {
      const before = await templates.all()
      const template = await templates.reset(key)
      const preserved = await preserveUsedTags(key, before, await templates.all())
      return { template, preserved }
    },
    revision: (root) => revisions.get(root) || 0,
    bump,
    readSettings,
    async writeSettings(values) {
      const current = await readSettings()
      const next = { ...current }
      for (const key of ['ffmpegPath', 'ffprobePath']) if (typeof values?.[key] === 'string') next[key] = values[key].trim()
      if (Number.isInteger(values?.eaglePort) && values.eaglePort > 0 && values.eaglePort < 65536) next.eaglePort = values.eaglePort
      await mkdir(home, { recursive: true })
      await writeJson(settingsFile, next)
      resolvedPaths = null
      await ffmpeg.detect(true)
      return next
    },
    setContext(projectId, context) { contexts.set(projectId, { ...context, at: now() }) },
    getContext(projectId) { return contexts.get(projectId) || null },
    async listProjects() {
      return registry.list()
    },
    async createProject({ path: dir, name, spec, template }) {
      const known = await templates.get(template)
      const { root, project, created } = await initProject(dir, { name, spec: sanitizeSpec(spec), template: known ? template : 'vlog-base' })
      await seedProject(root, project)
      const entry = await registerProject(root, project)
      await tryEagleFolder(root, project)
      await appendLog(root, { action: created ? 'project.create' : 'project.open', name: project.name })
      startWatch(root)
      return { project: entry, created }
    },
    async relocate(projectId, dir) {
      const root = await realDirectory(dir)
      const project = await readProject(root)
      const entry = await registry.get(projectId)
      if (project.id !== entry.id && project.name !== entry.name) throw new WorkbenchError('这个文件夹里的项目和原项目不一致。', 409)
      return registry.patch(projectId, { path: root, openedAt: now() })
    },
    async patchProject(projectId, values) {
      const { root, project, entry: entry0 } = await open(projectId)
      const update = {}
      if (typeof values.name === 'string' && values.name.trim()) update.name = values.name.trim()
      if (values.spec) update.spec = { ...project.spec, ...sanitizeSpec(values.spec) }
      if (values.cleanRules) update.cleanRules = { ...project.cleanRules, ...sanitizeRules(values.cleanRules), version: `${project.cleanRules.version.replace(/ \(调整\)$/, '')} (调整)` }
      if (typeof values.jianyingDraftDir === 'string') update.jianyingDraftDir = values.jianyingDraftDir.trim()
      if (Object.keys(update).length) await saveProject(root, update)
      const entryValues = { openedAt: now() }
      if (update.name) entryValues.name = update.name
      if (typeof values.archived === 'boolean') entryValues.archived = values.archived
      if (typeof values.sessionId === 'string' || values.sessionId === null) {
        // One workbench conversation per library folder ('' = project root).
        const library = typeof values.library === 'string' && LIBRARIES.some((l) => l.dir === values.library) ? values.library : ''
        if (library) entryValues.sessions = { ...(entry0.sessions || {}), [library]: values.sessionId }
        else entryValues.sessionId = values.sessionId
      }
      return registry.patch(projectId, entryValues)
    },
    async removeProject(projectId) {
      await registry.remove(projectId)
      return { removed: true }
    },
    async fileFor(projectId, rel) {
      const { root } = await open(projectId)
      const norm = String(rel || '').replace(/\\/g, '/')
      const hidden = norm.startsWith('.dsh/') && !/^\.dsh\/cache\/(thumbs|keyframes)\/[^/]+\.jpg$/i.test(norm)
      if (hidden || !PREVIEWABLE.test(norm)) throw new WorkbenchError('不允许读取该文件。', 403)
      return inside(root, norm)
    },
    async reveal(projectId, rel) {
      const { root } = await open(projectId)
      const target = inside(root, rel || '.')
      if (!(await exists(target))) throw new WorkbenchError('文件不存在。', 404)
      const [cmd, args] = process.platform === 'win32' ? ['explorer.exe', [`/select,${target}`]] : process.platform === 'darwin' ? ['open', ['-R', target]] : ['xdg-open', [path.dirname(target)]]
      spawn(cmd, args, { detached: true, stdio: 'ignore', windowsHide: false }).on('error', () => {}).unref()
      return { ok: true }
    },
    libraries: LIBRARIES,
    /** One level of the real project folder for the panel's file tree. */
    async listDir(projectId, rel = '') {
      const { root } = await open(projectId)
      const norm = String(rel || '').replace(/\\/g, '/').replace(/^\/+|\/+$/g, '')
      if (norm === '.dsh' || norm.startsWith('.dsh/')) throw new WorkbenchError('不允许浏览该目录。', 403)
      const dir = inside(root, norm || '.')
      let entries
      try { entries = await readdir(dir, { withFileTypes: true }) } catch { throw new WorkbenchError('文件夹不存在或无法读取。', 404) }
      const docsByPath = new Map(Object.entries(DOCS).map(([key, rel2]) => [rel2, key]))
      const libOrder = new Map(LIBRARIES.map((l, i) => [l.dir, i]))
      const items = []
      for (const entry of entries) {
        if (entry.name.startsWith('.') || entry.name.endsWith('.tmp')) continue
        const relPath = norm ? `${norm}/${entry.name}` : entry.name
        const isDir = entry.isDirectory()
        let size = null
        let mtime = null
        try { const info = await stat(path.join(dir, entry.name)); size = isDir ? null : info.size; mtime = info.mtime.toISOString() } catch { continue }
        items.push({ name: entry.name, path: relPath, type: isDir ? 'dir' : 'file', size, mtime, doc: docsByPath.get(relPath) || null, library: !norm && libOrder.has(entry.name) ? entry.name : null })
      }
      items.sort((a, b) => (a.library !== null) === (b.library !== null)
        ? (a.library !== null ? libOrder.get(a.library) - libOrder.get(b.library) : (a.type === b.type ? a.name.localeCompare(b.name, 'zh') : a.type === 'dir' ? -1 : 1))
        : a.library !== null ? -1 : 1)
      return { path: norm, items: items.slice(0, 2000), truncated: items.length > 2000 }
    },
    /** Read-only preview of a small text file anywhere in the project (not .dsh). */
    async readTextFile(projectId, rel) {
      const { root } = await open(projectId)
      const norm = String(rel || '').replace(/\\/g, '/')
      if (norm.startsWith('.dsh/') || !/\.(md|txt|ya?ml|json|jsonl|srt|csv|log|xml|html?)$/i.test(norm)) throw new WorkbenchError('只能预览文本文件。', 415)
      const file = inside(root, norm)
      const info = await stat(file).catch(() => null)
      if (!info?.isFile()) throw new WorkbenchError('文件不存在。', 404)
      if (info.size > 1024 * 1024) return { path: norm, size: info.size, truncated: true, content: (await readFileText(file)).slice(0, 200_000) }
      return { path: norm, size: info.size, truncated: false, content: await readFileText(file) }
    },
    docs: Object.keys(DOCS),
    parseDictionary,
    dispose() {
      disposed = true
      jobs.cancelAll()
      for (const watcher of watchers.values()) watcher?.close()
      watchers.clear()
    }
  }
}

function siblingProbe(ffmpegPath) {
  const dir = path.dirname(ffmpegPath)
  const ext = path.extname(ffmpegPath)
  return dir === '.' ? 'ffprobe' : path.join(dir, `ffprobe${ext}`)
}
