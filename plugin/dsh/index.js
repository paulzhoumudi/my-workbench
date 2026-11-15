// DSH Harness server entry for the Footage Culler workbench (素材清洗台).
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import Schema from '@deepseek-ai/schemastery'
import { defineTool } from '@deepseek-ai/dsh-tools'
import { BUNDLED_SKILL_RANK } from '@deepseek-ai/dsh-skill'
import { credentialKey } from '@deepseek-ai/dsh-credentials'
import { createService } from './service.js'
import { registerRoutes } from './routes.js'
import { footageTools } from './tools.js'

export const name = 'dsh-footage-culler'
export const inject = ['connection', 'tools', 'skills', 'credentials', 'systemPrompt']
export const Config = Schema.object({
  root: Schema.string().required().description('素材清洗台的数据目录（任务结果、缩略图、设置、改判记录）'),
})

const SECRET = credentialKey('dsh-footage-culler', 'vlm')
const PROMPT_SECTION = 'tool:footage-culler'
const PROMPT = 'For footage culling, selecting usable takes, rejecting blurry/shaky/badly exposed clips, or exporting selects to Premiere/Final Cut/DaVinci, load the footage-culling Skill and use the footage_* tools. Never delete, move or modify source media.'

/** API key for the multimodal review model lives in the host credential store, never in files or prompts. */
function hostSecret(ctx) {
  return {
    async read() {
      const record = await ctx.credentials.readRecord(SECRET)
      return record?.kind === 'grant' && typeof record.payload?.apiKey === 'string' ? record.payload.apiKey : undefined
    },
    async write(apiKey) {
      // Clearing keeps an empty grant record (same record shape as dsh-image-generation).
      await ctx.credentials.modifyRecord(SECRET, async () => ({ kind: 'grant', payload: apiKey ? { apiKey } : {} }))
    },
  }
}

export function apply(ctx, config) {
  const service = createService({ root: config.root, secret: hostSecret(ctx), logger: ctx.logger })
  ctx.on?.('dispose', () => service.dispose())
  registerRoutes((route) => ctx.connection.fetch.register(route), service, ctx.logger)
  for (const tool of footageTools(defineTool, service)) ctx.tools.register(tool)

  const locator = new URL('../skills/footage-culling/SKILL.md', import.meta.url)
  const candidate = {
    name: 'footage-culling',
    description: 'Cull a day of advertising rushes: run AI technical and aesthetic checks, explain A/B/C selects in a director\'s language, record corrections and export timelines for editing.',
    invocation: { modelInvocable: true, userInvocable: true },
    provider: name,
    source: 'bundled',
    rank: BUNDLED_SKILL_RANK,
    locator,
    resourceBase: { kind: 'directory', path: fileURLToPath(new URL('.', locator)) },
  }
  ctx.skills.registerProvider(() => ({
    name,
    list: async () => [candidate],
    get: async (selected) => (selected.name === candidate.name
      ? { ...candidate, content: (await readFile(locator, 'utf8')).replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/u, '').trim() }
      : undefined),
  }))
  ctx.systemPrompt.section({ name: PROMPT_SECTION, order: 116, text: PROMPT })
  ctx.logger?.info?.('footage-culler: ready; data root=%s', config.root)
}
