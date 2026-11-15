#!/usr/bin/env node
// Export per-window measurements for comparison with a director's decisions.
import { writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { discover, cameraGroup } from '../engine/job.mjs'
import { probe } from '../engine/probe.mjs'
import { resolveTools } from '../engine/tools.mjs'
import { classifyWindows, focusReference, measureClip, resolveThresholds } from '../engine/analyze.mjs'

const args = process.argv.slice(2)
const outputIndex = args.indexOf('--out')
const input = args.find((arg, i) => !arg.startsWith('--') && (outputIndex < 0 || i !== outputIndex + 1))
const output = outputIndex >= 0 ? args[outputIndex + 1] : null
const log = args.includes('--log')
if (!input || (outputIndex >= 0 && !output)) {
  process.stderr.write('用法: node tools/calibrate.mjs <素材目录或文件> [--out 指标.csv] [--log]\n')
  process.exit(2)
}

const { ffmpeg, ffprobe } = await resolveTools()
if (!ffmpeg || !ffprobe) throw new Error('未找到 ffmpeg / ffprobe')
const paths = await discover([resolve(input)])
if (!paths.length) throw new Error('未找到可分析的视频文件')
const measured = []
for (const path of paths) {
  try {
    const meta = await probe(ffprobe, path)
    const options = { log }
    const data = await measureClip({ ffmpeg, file: path, meta, options })
    measured.push({ path, meta, data })
    process.stderr.write(`已分析 ${measured.length}/${paths.length}: ${path}\n`)
  } catch (error) {
    process.stderr.write(`跳过 ${path}: ${error.message}\n`)
  }
}
const groups = new Map()
for (const item of measured) {
  const key = cameraGroup(item.meta)
  if (!groups.has(key)) groups.set(key, [])
  groups.get(key).push(item)
}
const th = resolveThresholds()
const rows = [['文件', '组别', '入点秒', '出点秒', '参考清晰度', '清晰度', '相对清晰度', '抖动百分比', '平均亮度', '高光裁切比例', '暗部裁切比例', '纹理比例', '技术分', '标记']]
for (const [key, group] of groups) {
  const { ref } = focusReference(group.map((item) => item.data.windows), th)
  for (const { path, data } of group) {
    for (const w of classifyWindows(data.windows, th, { log }, ref)) {
      rows.push([path, key, w.t0, w.t1, ref ?? '', w.focus, w.focusRel ?? '', w.shake, w.mean, w.clipHi, w.clipLo, w.textured, w.score, w.flags.map((f) => f.code).join('|')])
    }
  }
}
const csvCell = (value) => {
  const s = String(value)
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}
const csv = '\ufeff' + rows.map((row) => row.map(csvCell).join(',')).join('\r\n') + '\r\n'
if (output) {
  await writeFile(resolve(output), csv)
  process.stderr.write(`已写入 ${resolve(output)}：${measured.length} 个文件，${rows.length - 1} 个时间窗\n`)
} else process.stdout.write(csv)
