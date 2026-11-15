import Schema from '@deepseek-ai/schemastery'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { createService } from './lib/service.js'
import { registerRoutes } from './lib/routes.js'
import { createTools, approvalFor, TOOL_NAMES, JSON_OUTPUT } from './lib/tools.js'

export const name = 'dsh-media-workbench'
export const inject = ['connection']
export const Config = Schema.object({
  root: Schema.string().required().description('工作台自己的数据目录（项目列表、设置）。项目文件都在各自的项目文件夹里。')
})

export const PROMPT_SECTION = 'tool:dsh-media-workbench'
export const PROMPT_TEXT = 'Media workbench (媒体自动化剪辑工作台): when the session workspace (or one of its parent folders) contains .dsh/project.json it is a video project; the workspace may be one of its libraries 原始素材库 / 输出素材库 / 创意剪辑 (tags live in the panel 标签 tab, not in a folder). Load the media-workbench Skill, call media_context first, and use the media_* tools for creative files, footage cleaning, tagging, Eagle, matching and rendering. Never modify or delete files in 原始素材库. Write creative files only with media_creative_write so versions are kept. New tag ideas go to 待审 via media_tags_suggest; never write the tag dictionary file directly. Never invent footage matches: report shots without footage as missing.'

export function apply(ctx, config) {
  const service = createService({ home: config.root, logger: ctx.logger })
  ctx.effect(() => () => service.dispose(), 'media-workbench: service')
  registerRoutes(ctx, service)

  // Agent tools are optional: the panel keeps working on hosts without them.
  ctx.inject(['tools'], async (ctx) => {
    let defineTool
    try {
      ({ defineTool } = await import('@deepseek-ai/dsh-tools'))
    } catch (error) {
      ctx.logger?.warn?.('media-workbench: @deepseek-ai/dsh-tools unavailable, agent tools disabled: %s', error?.message)
      return
    }
    for (const tool of createTools(service)) {
      ctx.tools.register(defineTool({ ...tool, output: JSON_OUTPUT, timeoutMs: 120_000, isConcurrencySafe: () => tool.name === 'media_context' || tool.name === 'media_creative_read' || tool.name === 'media_clips' }))
    }
    // Risky media actions ask the user first, with the concrete impact.
    ctx.on('tools/pre-execute', async (exec, next) => {
      const decision = await next()
      if (decision?.kind !== 'allow' || !TOOL_NAMES.has(exec.name)) return decision
      let reason = null
      try { reason = await approvalFor(service, exec) } catch (error) { reason = null; ctx.logger?.info?.('media-workbench: approval impact unavailable: %s', error?.message) }
      if (!reason) return decision
      return { kind: 'ask', reason, displayReason: { en: reason, zh: reason, 'zh-CN': reason } }
    })
  })

  ctx.inject(['skills'], async (ctx) => {
    const locator = new URL('../skills/media-workbench/SKILL.md', import.meta.url)
    let rank = 0
    try { ({ BUNDLED_SKILL_RANK: rank } = await import('@deepseek-ai/dsh-skill')) } catch { rank = 0 }
    const candidate = {
      name: 'media-workbench',
      description: 'Run the media workbench pipeline: creative docs (brief, directions, script, storyboard, tag dictionary), footage import/clean/split/tag/review/Eagle, storyboard matching, timeline and FFmpeg rendering.',
      invocation: { modelInvocable: true, userInvocable: true }, provider: name, source: 'bundled', rank,
      locator, resourceBase: { kind: 'directory', path: fileURLToPath(new URL('.', locator)) }
    }
    ctx.skills.registerProvider(() => ({
      name,
      list: async () => [candidate],
      get: async (selected) => selected.name === candidate.name
        ? { ...candidate, content: (await readFile(locator, 'utf8')).replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/u, '').trim() }
        : undefined
    }))
  })

  ctx.inject(['systemPrompt'], (ctx) => {
    ctx.systemPrompt.section({ name: PROMPT_SECTION, order: 116, text: PROMPT_TEXT })
  })
}
