// Locate ffmpeg / ffprobe and run them. Desktop apps launched from Finder or
// the Dock do not inherit the shell PATH, so common install locations are
// probed explicitly before falling back to PATH lookup.
import { spawn } from 'node:child_process'
import { access, constants } from 'node:fs/promises'
import { delimiter, join } from 'node:path'

const COMMON_DIRS = [
  '/opt/homebrew/bin', '/usr/local/bin', '/usr/bin',
  'C:\\ffmpeg\\bin', 'C:\\Program Files\\ffmpeg\\bin',
]

async function executable(path) {
  try { await access(path, constants.X_OK); return true } catch { return false }
}

/** Resolve an ffmpeg-family binary. `preferred` may be a full path from settings. */
export async function resolveBinary(name, preferred) {
  const exe = process.platform === 'win32' ? `${name}.exe` : name
  if (preferred) {
    const candidate = preferred.endsWith(exe) ? preferred : join(preferred, exe)
    if (await executable(candidate)) return candidate
    if (await executable(preferred)) return preferred
  }
  const dirs = [...COMMON_DIRS, ...(process.env.PATH || '').split(delimiter)]
  for (const dir of dirs) {
    if (!dir) continue
    const candidate = join(dir, exe)
    if (await executable(candidate)) return candidate
  }
  return null
}

export async function resolveTools(ffmpegDir) {
  const ffmpeg = await resolveBinary('ffmpeg', ffmpegDir)
  const ffprobe = await resolveBinary('ffprobe', ffmpegDir)
  return { ffmpeg, ffprobe }
}

/** Run a command and collect stdout as a Buffer. */
export function run(cmd, args, { signal, maxBytes = 64 * 1024 * 1024 } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true })
    const out = []
    let size = 0
    let err = ''
    const onAbort = () => child.kill('SIGKILL')
    signal?.addEventListener('abort', onAbort, { once: true })
    child.stdout.on('data', (chunk) => {
      size += chunk.length
      if (size > maxBytes) { child.kill('SIGKILL'); return }
      out.push(chunk)
    })
    child.stderr.on('data', (chunk) => { if (err.length < 8192) err += chunk.toString() })
    child.on('error', reject)
    child.on('close', (code) => {
      signal?.removeEventListener('abort', onAbort)
      if (signal?.aborted) return reject(new Error('cancelled'))
      if (code !== 0) return reject(new Error(`${cmd.split(/[\\/]/).pop()} exited ${code}: ${err.trim().slice(-600)}`))
      resolve(Buffer.concat(out))
    })
  })
}
