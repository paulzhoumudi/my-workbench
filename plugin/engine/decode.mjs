// Decode one clip into two grayscale raw streams in a single ffmpeg pass:
//   motion: small frames at a higher rate for camera shake and cut detection
//   focus:  larger frames at a low rate for focus measurement
// On macOS/Linux the second stream goes to file descriptor 3. Windows ffmpeg
// builds cannot write to inherited descriptors, so there two passes are used.
import { spawn } from 'node:child_process'

const even = (v) => Math.max(2, Math.round(v / 2) * 2)

export function frameSizes(meta, { motionWidth = 480, focusWidth = 1280 } = {}) {
  const aspect = meta.height / meta.width
  const mw = Math.min(motionWidth, even(meta.width))
  const fw = Math.min(focusWidth, even(meta.width))
  return { motion: { w: mw, h: even(mw * aspect) }, focus: { w: fw, h: even(fw * aspect) } }
}

function escapeFilterPath(p) {
  return p.replace(/\\/g, '/').replace(/:/g, '\\:').replace(/'/g, "\\'")
}

function chain(prefix, fps, size) {
  return `${prefix}fps=${fps},scale=${size.w}:${size.h}:flags=area,format=gray`
}

class FrameReader {
  constructor(size, onFrame) {
    this.bytes = size.w * size.h
    this.buf = Buffer.allocUnsafe(this.bytes)
    this.fill = 0
    this.index = 0
    this.onFrame = onFrame
  }
  push(chunk) {
    let off = 0
    while (off < chunk.length) {
      const n = Math.min(this.bytes - this.fill, chunk.length - off)
      chunk.copy(this.buf, this.fill, off, off + n)
      this.fill += n; off += n
      if (this.fill === this.bytes) {
        this.onFrame(this.index++, new Uint8Array(this.buf))
        this.fill = 0
      }
    }
  }
}

function spawnDecode(ffmpeg, args, readers, signal) {
  return new Promise((resolve, reject) => {
    const stdio = ['ignore', 'pipe', 'pipe']
    if (readers.length > 1) stdio.push('pipe')
    const child = spawn(ffmpeg, args, { stdio, windowsHide: true })
    let err = ''
    const onAbort = () => child.kill('SIGKILL')
    signal?.addEventListener('abort', onAbort, { once: true })
    child.stdout.on('data', (c) => readers[0].push(c))
    if (readers.length > 1) child.stdio[3].on('data', (c) => readers[1].push(c))
    child.stderr.on('data', (c) => { if (err.length < 16384) err += c.toString() })
    child.on('error', reject)
    child.on('close', (code) => {
      signal?.removeEventListener('abort', onAbort)
      if (signal?.aborted) return reject(new Error('cancelled'))
      if (code !== 0) return reject(new Error(`ffmpeg decode failed (${code}): ${err.trim().split('\n').slice(-3).join(' | ')}`))
      resolve()
    })
  })
}

/**
 * @param {object} o
 * @param {string} o.ffmpeg
 * @param {string} o.file
 * @param {object} o.meta probe() result
 * @param {(i:number, gray:Uint8Array)=>void} o.onMotion
 * @param {(i:number, gray:Uint8Array)=>void} o.onFocus
 */
export async function decode({ ffmpeg, file, meta, motionFps = 10, focusFps = 2, lutPath, hwaccel = false, sizes, signal, onMotion, onFocus }) {
  const size = sizes || frameSizes(meta)
  const base = ['-hide_banner', '-nostdin', '-loglevel', 'error']
  if (hwaccel && process.platform === 'darwin') base.push('-hwaccel', 'videotoolbox')
  base.push('-i', file)
  const lut = lutPath ? `lut3d=file='${escapeFilterPath(lutPath)}',` : ''
  const motionReader = new FrameReader(size.motion, onMotion)
  const focusReader = new FrameReader(size.focus, onFocus)
  if (process.platform !== 'win32') {
    const graph = `[0:v:0]${lut}split=2[a][b];[a]${chain('', motionFps, size.motion)}[m];[b]${chain('', focusFps, size.focus)}[f]`
    const args = [...base, '-filter_complex', graph,
      '-map', '[m]', '-f', 'rawvideo', '-pix_fmt', 'gray', 'pipe:1',
      '-map', '[f]', '-f', 'rawvideo', '-pix_fmt', 'gray', 'pipe:3']
    await spawnDecode(ffmpeg, args, [motionReader, focusReader], signal)
  } else {
    await spawnDecode(ffmpeg, [...base, '-map', '0:v:0', '-vf', chain(lut, motionFps, size.motion), '-f', 'rawvideo', '-pix_fmt', 'gray', 'pipe:1'], [motionReader], signal)
    await spawnDecode(ffmpeg, [...base, '-map', '0:v:0', '-vf', chain(lut, focusFps, size.focus), '-f', 'rawvideo', '-pix_fmt', 'gray', 'pipe:1'], [focusReader], signal)
  }
  return { motionFrames: motionReader.index, focusFrames: focusReader.index, size }
}

/** Extract one JPEG still at time t (seconds), scaled to `width`. */
export function stillJpeg({ ffmpeg, file, t, width = 768, lutPath, signal }) {
  const lut = lutPath ? `lut3d=file='${escapeFilterPath(lutPath)}',` : ''
  const args = ['-hide_banner', '-nostdin', '-loglevel', 'error', '-ss', Math.max(0, t).toFixed(3), '-i', file,
    '-frames:v', '1', '-vf', `${lut}scale=${width}:-2:flags=lanczos`, '-q:v', '4', '-f', 'image2pipe', '-vcodec', 'mjpeg', 'pipe:1']
  return new Promise((resolve, reject) => {
    const child = spawn(ffmpeg, args, { stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true })
    const out = []
    let err = ''
    const onAbort = () => child.kill('SIGKILL')
    signal?.addEventListener('abort', onAbort, { once: true })
    child.stdout.on('data', (c) => out.push(c))
    child.stderr.on('data', (c) => { if (err.length < 4096) err += c })
    child.on('error', reject)
    child.on('close', (code) => {
      signal?.removeEventListener('abort', onAbort)
      if (signal?.aborted) return reject(new Error('cancelled'))
      const buf = Buffer.concat(out)
      if (code !== 0 || !buf.length) return reject(new Error(`still extraction failed: ${err.trim().slice(-300)}`))
      resolve(buf)
    })
  })
}
