import { spawn } from 'node:child_process'
import { WorkbenchError } from './util.js'

/**
 * Thin FFmpeg/ffprobe runner. Arguments are always passed as an array (never
 * through a shell) and every run is cancellable through an AbortSignal.
 */
export function createFFmpeg(getPaths) {
  let probeCache = null

  function run(bin, args, { signal, cwd, onStderr, stdoutLimit = 64 * 1024 * 1024, timeoutMs } = {}) {
    return new Promise((resolve, reject) => {
      if (signal?.aborted) return reject(abortError())
      let child
      try {
        child = spawn(bin, args, { cwd, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] })
      } catch (error) {
        return reject(new WorkbenchError(`无法启动 ${bin}：${error.message}`, 500, 'FFMPEG_MISSING'))
      }
      const out = []
      let outLength = 0
      let err = ''
      let timer
      const kill = () => { try { child.kill('SIGKILL') } catch { /* already exited */ } }
      const onAbort = () => { kill() }
      signal?.addEventListener('abort', onAbort, { once: true })
      if (timeoutMs) timer = setTimeout(kill, timeoutMs)
      child.stdout.on('data', (chunk) => {
        outLength += chunk.length
        if (outLength > stdoutLimit) { kill(); return }
        out.push(chunk)
      })
      child.stderr.on('data', (chunk) => {
        const text = chunk.toString('utf8')
        err = (err + text).slice(-200_000)
        onStderr?.(text)
      })
      child.on('error', (error) => {
        signal?.removeEventListener('abort', onAbort)
        clearTimeout(timer)
        reject(error.code === 'ENOENT'
          ? new WorkbenchError(`找不到 ${bin}。请安装 FFmpeg 并加入 PATH，或在工作台设置里填写路径。`, 424, 'FFMPEG_MISSING')
          : new WorkbenchError(`${bin} 运行失败：${error.message}`, 500, 'FFMPEG_FAILED'))
      })
      child.on('close', (code) => {
        signal?.removeEventListener('abort', onAbort)
        clearTimeout(timer)
        if (signal?.aborted) return reject(abortError())
        resolve({ code, stdout: Buffer.concat(out), stderr: err })
      })
    })
  }

  async function ffmpeg(args, options) {
    const { ffmpeg: bin } = await getPaths()
    const result = await run(bin, ['-hide_banner', '-nostdin', '-y', ...args], options)
    if (result.code !== 0) throw new WorkbenchError(`FFmpeg 处理失败：${lastLines(result.stderr)}`, 500, 'FFMPEG_FAILED')
    return result
  }

  return {
    run,
    ffmpeg,
    /** Availability and capability probe for the status chips (FR-04). */
    async detect(force = false) {
      if (probeCache && !force && Date.now() - probeCache.at < 60_000) return probeCache.value
      const paths = await getPaths()
      const value = { ffmpeg: false, ffprobe: false, version: null, encoders: { h264: false, h265: false }, paths }
      try {
        const v = await run(paths.ffmpeg, ['-hide_banner', '-version'], { timeoutMs: 8000 })
        value.ffmpeg = v.code === 0
        value.version = v.stdout.toString('utf8').split('\n')[0].replace(/^ffmpeg version\s*/, '').split(' ')[0] || null
        if (value.ffmpeg) {
          const enc = await run(paths.ffmpeg, ['-hide_banner', '-encoders'], { timeoutMs: 8000 })
          const text = enc.stdout.toString('utf8')
          value.encoders.h264 = /\blibx264\b|\bh264_(nvenc|qsv|amf|videotoolbox|mf)\b/.test(text)
          value.encoders.h265 = /\blibx265\b|\bhevc_(nvenc|qsv|amf|videotoolbox|mf)\b/.test(text)
          value.encoders.list = ['libx264', 'libx265', 'h264_nvenc', 'hevc_nvenc', 'h264_qsv', 'hevc_qsv', 'h264_amf', 'hevc_amf', 'h264_videotoolbox', 'hevc_videotoolbox', 'h264_mf', 'hevc_mf'].filter((name) => new RegExp(`\\b${name}\\b`).test(text))
        }
      } catch { /* reported as unavailable */ }
      try {
        const p = await run(paths.ffprobe, ['-hide_banner', '-version'], { timeoutMs: 8000 })
        value.ffprobe = p.code === 0
      } catch { /* reported as unavailable */ }
      probeCache = { at: Date.now(), value }
      return value
    },
    async probe(file, signal) {
      const { ffprobe: bin } = await getPaths()
      const result = await run(bin, ['-v', 'error', '-print_format', 'json', '-show_format', '-show_streams', file], { signal, timeoutMs: 60_000 })
      if (result.code !== 0) return null
      try { return JSON.parse(result.stdout.toString('utf8')) } catch { return null }
    },
    /** Decode frames as 8-bit grayscale buffers for the cleaning metrics. */
    async grayFrames(file, { start = 0, duration, fps, width, height, signal }) {
      const args = []
      if (start > 0) args.push('-ss', start.toFixed(3))
      if (duration) args.push('-t', duration.toFixed(3))
      args.push('-i', file, '-an', '-vf', `fps=${fps},scale=${width}:${height}:flags=area,format=gray`, '-f', 'rawvideo', '-pix_fmt', 'gray', 'pipe:1')
      const { stdout } = await ffmpeg(args, { signal })
      const size = width * height
      const frames = []
      for (let offset = 0; offset + size <= stdout.length; offset += size) frames.push(new Uint8Array(stdout.buffer, stdout.byteOffset + offset, size))
      return frames
    },
    async sceneCuts(file, threshold, signal, onProgress) {
      const cuts = []
      const { ffmpeg: bin } = await getPaths()
      const result = await run(bin, ['-hide_banner', '-nostdin', '-i', file, '-an', '-sn', '-vf', `scale=320:-2,select='gt(scene,${threshold})',showinfo`, '-f', 'null', '-'], {
        signal,
        onStderr: (text) => {
          for (const match of text.matchAll(/pts_time:([\d.]+)/g)) cuts.push(Number(match[1]))
          const time = text.match(/time=(\d+):(\d+):([\d.]+)/)
          if (time && onProgress) onProgress(Number(time[1]) * 3600 + Number(time[2]) * 60 + Number(time[3]))
        }
      })
      if (result.code !== 0) throw new WorkbenchError(`镜头检测失败：${lastLines(result.stderr)}`, 500, 'FFMPEG_FAILED')
      return [...new Set(cuts)].sort((a, b) => a - b)
    }
  }
}

export function abortError() {
  return new WorkbenchError('任务已取消。', 499, 'ABORTED')
}

export function lastLines(text, count = 3) {
  return String(text || '').trim().split('\n').filter((line) => !/^\s*(frame=|size=)/.test(line)).slice(-count).join(' / ').slice(0, 400)
}

export function parseRate(rate) {
  if (!rate || rate === '0/0') return 0
  const [a, b] = String(rate).split('/').map(Number)
  return b ? a / b : a
}

/** Normalize an ffprobe result into what the index stores. */
export function summarizeProbe(probe) {
  const video = probe?.streams?.find((stream) => stream.codec_type === 'video' && stream.disposition?.attached_pic !== 1)
  if (!video) return null
  const audio = probe.streams.find((stream) => stream.codec_type === 'audio')
  const duration = Number(probe.format?.duration || video.duration || 0)
  let width = video.width
  let height = video.height
  const rotation = Number(video.tags?.rotate || video.side_data_list?.find((item) => item.rotation !== undefined)?.rotation || 0)
  if (Math.abs(rotation) % 180 === 90) [width, height] = [height, width]
  return {
    duration: Math.round(duration * 1000) / 1000,
    width, height,
    fps: Math.round(parseRate(video.avg_frame_rate || video.r_frame_rate) * 1000) / 1000,
    codec: video.codec_name,
    bitrate: Number(probe.format?.bit_rate || 0),
    hasAudio: Boolean(audio),
    shotAt: probe.format?.tags?.creation_time || video.tags?.creation_time || null
  }
}
