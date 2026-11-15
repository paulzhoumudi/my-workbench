// Combine technical analysis (layer 1) and model review (layer 3) into an
// A / B / C grade with a human-readable reason. Nothing is ever deleted:
//   A = 优先候选   B = 需人工复核   C = 问题片段（技术问题或内容不可用）
import { flagLabel } from './analyze.mjs'
import { HARD_ISSUES } from './vlm.mjs'

export const GRADE_LABEL = { A: '优先候选', B: '需复核', C: '问题片段' }

export const DEFAULT_GRADING = {
  techA: 85, techB: 60,          // tech-only grading
  techWeight: 0.4,               // share of technical score when a review exists
  combinedA: 75, combinedB: 55,
  aestheticA: 7,
}

function flagsText(flags) {
  return flags.map(flagLabel).join('、')
}

export function gradeRejected(seg) {
  return { grade: 'C', reason: seg.short ? `可用时长过短（${seg.duration}s）` : `技术废片：${flagsText(seg.flags) || '质量不达标'}` }
}

export function gradeCandidate(seg, review, cfg = {}) {
  const g = { ...DEFAULT_GRADING, ...cfg }
  const tech = seg.tech.score
  const warn = seg.flags.length ? `（提示：${flagsText(seg.flags)}）` : ''
  if (!review || review.error) {
    if (seg.short) return { grade: 'B', combined: tech, reason: `片段较短（${seg.duration}s），请确认动作是否完整${review?.error ? '；AI 复审失败' : ''}` }
    if (tech >= g.techA && !seg.flags.length) return { grade: 'A', combined: tech, reason: `技术指标优秀；画面内容未复审${review?.error ? '（AI 复审失败）' : ''}` }
    if (tech >= g.techB) return { grade: 'B', combined: tech, reason: `技术可用${warn}${review?.error ? '；AI 复审失败' : ''}` }
    return { grade: 'C', combined: tech, reason: `技术分偏低${warn}` }
  }
  const hard = review.issues.filter((i) => HARD_ISSUES.includes(i.trim()))
  if (!review.usable || hard.length || !review.subjectClear) {
    const why = [hard.join('、'), !review.subjectClear ? '主体不清' : '', review.reason].filter(Boolean).join('；')
    return { grade: 'C', combined: Math.round(tech * g.techWeight), reason: `AI 判定不可用：${why || '内容不可用'}` }
  }
  if (seg.short) return { grade: 'B', combined: tech, reason: `片段较短（${seg.duration}s），请确认动作是否完整；${review.reason || '内容待复核'}` }
  const visual = (review.aesthetic * 0.6 + review.composition * 0.4) * 10
  const combined = Math.round(g.techWeight * tech + (1 - g.techWeight) * visual)
  const base = review.reason || ''
  // A means "no doubts": any technical warning sends an otherwise strong take to review.
  if (combined >= g.combinedA && review.aesthetic >= g.aestheticA && !seg.flags.length) return { grade: 'A', combined, reason: base || '画面与内容俱佳' }
  if (combined >= g.combinedB) return { grade: 'B', combined, reason: `${base}${warn}` || '可用，建议复核' }
  return { grade: 'C', combined, reason: base || '审美/内容评分偏低' }
}

/** Final grade = human override if present, else machine grade. */
export function effectiveGrade(seg, overrides = {}) {
  return overrides[seg.id] || seg.grade
}

export function summarize(files, overrides = {}) {
  const sum = { files: files.length, analyzed: 0, failed: 0, footageSeconds: 0, A: { count: 0, seconds: 0 }, B: { count: 0, seconds: 0 }, C: { count: 0, seconds: 0 }, rejectedSeconds: 0 }
  for (const f of files) {
    if (f.status === 'failed') { sum.failed++; continue }
    if (!f.segments) continue
    sum.analyzed++
    sum.footageSeconds += f.duration || 0
    for (const s of [...f.segments, ...f.rejected]) {
      const g = effectiveGrade(s, overrides)
      if (!sum[g]) continue
      sum[g].count++
      sum[g].seconds += s.duration
      if (s.kind === 'rejected') sum.rejectedSeconds += s.duration
    }
  }
  for (const k of ['footageSeconds', 'rejectedSeconds']) sum[k] = +sum[k].toFixed(1)
  for (const k of ['A', 'B', 'C']) sum[k].seconds = +sum[k].seconds.toFixed(1)
  return sum
}
