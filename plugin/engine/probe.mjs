import { run } from './tools.mjs'

function parseRate(rate) {
  if (!rate || rate === '0/0') return null
  const [n, d] = String(rate).split('/').map(Number)
  if (!d) return Number.isFinite(n) && n > 0 ? n : null
  const v = n / d
  return Number.isFinite(v) && v > 0 ? v : null
}

function rotationOf(stream) {
  const tag = Number(stream.tags?.rotate)
  if (Number.isFinite(tag) && tag) return tag
  for (const item of stream.side_data_list || []) {
    if (Number.isFinite(Number(item.rotation))) return Number(item.rotation)
  }
  return 0
}

/** Read the technical facts the analysis needs from one media file. */
export async function probe(ffprobe, file, { signal } = {}) {
  const raw = await run(ffprobe, ['-v', 'error', '-print_format', 'json', '-show_streams', '-show_format', file], { signal, maxBytes: 4 * 1024 * 1024 })
  const info = JSON.parse(raw.toString('utf8'))
  const video = (info.streams || []).find((s) => s.codec_type === 'video' && s.disposition?.attached_pic !== 1)
  if (!video) throw new Error('no video stream')
  const audio = (info.streams || []).some((s) => s.codec_type === 'audio')
  const fps = parseRate(video.avg_frame_rate) || parseRate(video.r_frame_rate) || 25
  const duration = Number(video.duration) || Number(info.format?.duration) || 0
  const rotation = Math.abs(rotationOf(video)) % 180 === 90
  const width = rotation ? video.height : video.width
  const height = rotation ? video.width : video.height
  const timecode = video.tags?.timecode || info.format?.tags?.timecode || null
  return {
    duration,
    width,
    height,
    fps,
    rFrameRate: video.r_frame_rate,
    codec: video.codec_name,
    pixFmt: video.pix_fmt,
    colorTransfer: video.color_transfer || null,
    bitRate: Number(info.format?.bit_rate) || null,
    hasAudio: audio,
    timecode,
  }
}
