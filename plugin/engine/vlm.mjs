// Layer 3: multimodal model review of each candidate segment through any
// OpenAI-compatible Chat Completions endpoint (Qwen3-VL via vLLM/Ollama or
// DashScope compatible mode, Hunyuan, Doubao, Gemini OpenAI-compat, ...).

export const DEFAULT_RUBRIC = `你是一名资深广告片剪辑指导，正在为导演初筛拍摄素材。请依据下列标准判断这段素材是否值得进入剪辑：
1. 主体：画面主体（人物/产品/食物）是否明确、完整、清晰，是否被遮挡或出画。
2. 构图与光线：构图是否有意图、平衡，光线是否塑造了质感；无明显穿帮。
3. 动作与表演：动作是否完整、自然；演员表情是否到位；产品展示是否正面、logo 是否可见。
4. 废片特征：场记板、工作人员/器材入画、对焦过程、开机等待、无意义空镜、画面杂乱无重点。
5. 商业审美：是否具备广告片质感，可直接或稍加调色后用于成片。`

const SHOT_TYPES = ['大特写', '特写', '近景', '中景', '全景', '远景', '空镜', '产品特写', '其他']
const MOVES = ['固定', '推', '拉', '摇', '移', '跟', '升降', '环绕', '手持', '其他']
export const HARD_ISSUES = ['场记板', '穿帮', '工作人员入画', '器材入画', '主体出画', '对焦过程', '无有效内容', '画面杂乱']

function systemPrompt(rubric) {
  return `${rubric || DEFAULT_RUBRIC}

只输出一个 JSON 对象，不要输出其他文字。字段：
{"usable":布尔,"aesthetic":1-10整数,"composition":1-10整数,"subject":"主体简述(15字内)","subject_clear":布尔,
"shot_type":${JSON.stringify(SHOT_TYPES.join('|'))},"camera_move":${JSON.stringify(MOVES.join('|'))},
"issues":["从以下选择或简短补充: ${HARD_ISSUES.join('、')}、构图失衡、光线平淡、表演不到位、产品角度不佳"],
"tags":["3-6个检索标签"],"reason":"一句话说明取舍理由(40字内)"}`
}

function userText(segment, meta) {
  const t = segment.tech
  return `素材：${meta.name}，片段 ${segment.start.toFixed(1)}s–${segment.end.toFixed(1)}s（${segment.duration.toFixed(1)}s），以下为按时间顺序抽取的画面。
技术检测（供参考，不必复述）：清晰度相对值 ${t.focusRel ?? '-'}，抖动 ${t.shake}% 画幅，平均亮度 ${t.mean}${segment.flags.length ? `，提示：${segment.flags.join('、')}` : ''}。
请判断这段素材的可用性与审美质量。`
}

export function parseJsonObject(text) {
  if (typeof text !== 'string') throw new Error('empty model response')
  const cleaned = text.replace(/```(?:json)?/gi, '')
  const start = cleaned.indexOf('{'), end = cleaned.lastIndexOf('}')
  if (start < 0 || end <= start) throw new Error('model response has no JSON object')
  return JSON.parse(cleaned.slice(start, end + 1))
}

export function normalizeReview(raw) {
  if (!raw || typeof raw !== 'object' || typeof raw.usable !== 'boolean' || typeof raw.subject_clear !== 'boolean' ||
      !Number.isFinite(Number(raw.aesthetic)) || !Number.isFinite(Number(raw.composition))) {
    throw new Error('model response missing required review fields')
  }
  const int = (v, d) => { const n = Math.round(Number(v)); return Number.isFinite(n) ? Math.max(1, Math.min(10, n)) : d }
  const list = (v) => Array.isArray(v) ? v.filter((x) => typeof x === 'string' && x.trim()).map((x) => x.trim().slice(0, 40)).slice(0, 8) : []
  return {
    usable: raw.usable,
    aesthetic: int(raw.aesthetic, 5),
    composition: int(raw.composition, 5),
    subject: typeof raw.subject === 'string' ? raw.subject.slice(0, 40) : '',
    subjectClear: raw.subject_clear,
    shotType: typeof raw.shot_type === 'string' ? raw.shot_type.slice(0, 12) : '',
    cameraMove: typeof raw.camera_move === 'string' ? raw.camera_move.slice(0, 12) : '',
    issues: list(raw.issues),
    tags: list(raw.tags),
    reason: typeof raw.reason === 'string' ? raw.reason.slice(0, 120) : '',
  }
}

export function chatUrl(baseUrl) {
  const u = String(baseUrl || '').trim().replace(/\/+$/, '')
  if (!/^https?:\/\//i.test(u)) throw new Error('VLM API 地址需以 http(s):// 开头')
  return /\/chat\/completions$/.test(u) ? u : `${u}/chat/completions`
}

/**
 * @param {{baseUrl:string, model:string, apiKey?:string, rubric?:string, timeoutMs?:number}} vlm
 * @param {Buffer[]} frames JPEG stills in time order
 */
export async function reviewSegment(vlm, segment, meta, frames, { signal } = {}) {
  const content = [{ type: 'text', text: userText(segment, meta) }]
  for (const jpg of frames) content.push({ type: 'image_url', image_url: { url: `data:image/jpeg;base64,${jpg.toString('base64')}` } })
  const body = {
    model: vlm.model,
    temperature: 0.2,
    max_tokens: 700,
    messages: [{ role: 'system', content: systemPrompt(vlm.rubric) }, { role: 'user', content }],
  }
  const headers = { 'content-type': 'application/json' }
  if (vlm.apiKey) headers.authorization = `Bearer ${vlm.apiKey}`
  let lastError
  for (let attempt = 0; attempt < 2; attempt++) {
    const timeout = AbortSignal.timeout(vlm.timeoutMs || 90_000)
    const combined = signal ? AbortSignal.any([signal, timeout]) : timeout
    try {
      const res = await fetch(chatUrl(vlm.baseUrl), { method: 'POST', headers, body: JSON.stringify(body), signal: combined, redirect: 'error' })
      const text = await res.text()
      if (!res.ok) {
        const err = new Error(`VLM HTTP ${res.status}: ${text.slice(0, 300)}`)
        err.status = res.status
        throw err
      }
      const data = JSON.parse(text)
      let msg = data.choices?.[0]?.message?.content
      if (Array.isArray(msg)) msg = msg.map((p) => p.text || '').join('')
      return { ...normalizeReview(parseJsonObject(msg)), model: data.model || vlm.model }
    } catch (error) {
      lastError = error
      if (signal?.aborted) throw new Error('cancelled')
      if (error.status && error.status < 500 && error.status !== 429) break
    }
  }
  throw lastError
}

/** Pick evenly spaced still times inside a segment. */
export function stillTimes(segment, count = 4) {
  const n = Math.max(1, Math.min(count, Math.floor(segment.duration / 0.8) + 1))
  const pad = Math.min(0.3, segment.duration * 0.1)
  const span = segment.duration - 2 * pad
  return Array.from({ length: n }, (_, i) => +(segment.start + pad + (n === 1 ? span / 2 : (span * i) / (n - 1))).toFixed(3))
}
