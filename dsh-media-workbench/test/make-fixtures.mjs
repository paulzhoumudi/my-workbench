// Generates the synthetic test footage with FFmpeg (kept out of the repo):
// C0001 two scenes + audio · C0002 blurred · C0003 handheld shake · C0004 black
// C0005 1 s · C0006 duplicate of C0001 · C0007 smooth pan · C0008 not a video
import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const FIXTURES = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixtures')

const run = (args) => {
  const r = spawnSync('ffmpeg', ['-v', 'error', '-y', ...args], { cwd: FIXTURES, stdio: 'inherit' })
  if (r.status !== 0) throw new Error(`ffmpeg failed: ${args.join(' ')}`)
}

export function ensureFixtures() {
  if (existsSync(path.join(FIXTURES, 'C0008.MP4'))) return FIXTURES
  mkdirSync(FIXTURES, { recursive: true })
  run(['-f', 'lavfi', '-i', 'testsrc2=size=1920x1080:rate=1:duration=1', '-frames:v', '1', 'base.png'])
  run(['-f', 'lavfi', '-i', 'mandelbrot=size=1920x1080:rate=1', '-frames:v', '1', 'base2.png'])
  run(['-loop', '1', '-framerate', '25', '-t', '3', '-i', 'base.png', '-loop', '1', '-framerate', '25', '-t', '3', '-i', 'base2.png', '-f', 'lavfi', '-i', 'sine=frequency=440:duration=6',
    '-filter_complex', '[0:v]scale=1280:720,format=yuv420p[a];[1:v]scale=1280:720,format=yuv420p[b];[a][b]concat=n=2:v=1:a=0[v]', '-map', '[v]', '-map', '2:a', '-c:v', 'libx264', '-preset', 'ultrafast', '-c:a', 'aac', '-shortest', 'C0001.MP4'])
  run(['-loop', '1', '-framerate', '25', '-t', '5', '-i', 'base.png', '-vf', 'scale=1280:720,boxblur=12:2,format=yuv420p', '-c:v', 'libx264', '-preset', 'ultrafast', 'C0002.MP4'])
  run(['-loop', '1', '-framerate', '25', '-t', '5', '-i', 'base.png', '-vf', "crop=1600:900:x='160+60*(random(1)-0.5)':y='90+50*(random(2)-0.5)',scale=1280:720,format=yuv420p", '-c:v', 'libx264', '-preset', 'ultrafast', 'C0003.MP4'])
  run(['-f', 'lavfi', '-i', 'color=c=black:size=1280x720:rate=25:duration=4', '-vf', 'noise=alls=4:allf=t,format=yuv420p', '-c:v', 'libx264', '-preset', 'ultrafast', 'C0004.MP4'])
  run(['-loop', '1', '-framerate', '25', '-t', '1', '-i', 'base2.png', '-vf', 'scale=1280:720,format=yuv420p', '-c:v', 'libx264', '-preset', 'ultrafast', 'C0005.MP4'])
  run(['-i', 'C0001.MP4', '-c:v', 'libx264', '-preset', 'ultrafast', '-crf', '30', '-c:a', 'copy', 'C0006.MP4'])
  run(['-loop', '1', '-framerate', '25', '-t', '5', '-i', 'base2.png', '-vf', "crop=1280:720:x='t*100':y=180,format=yuv420p", '-c:v', 'libx264', '-preset', 'ultrafast', 'C0007.MP4'])
  writeFileSync(path.join(FIXTURES, 'C0008.MP4'), 'not a video\n')
  rmSync(path.join(FIXTURES, 'base.png'))
  rmSync(path.join(FIXTURES, 'base2.png'))
  return FIXTURES
}

if (process.argv[1] === fileURLToPath(import.meta.url)) console.log(ensureFixtures())
