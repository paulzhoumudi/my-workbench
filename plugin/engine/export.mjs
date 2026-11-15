// Exports for editing software. Source media is referenced, never copied or
// modified.
//   FCPXML 1.10   -> Final Cut Pro, DaVinci Resolve
//   FCP7 XML (v5) -> Premiere Pro, DaVinci Resolve, Avid (via import)
//   CSV           -> Excel / shot log
import { basename } from 'node:path'
import { pathToFileURL } from 'node:url'
import { effectiveGrade, GRADE_LABEL } from './grade.mjs'
import { flagLabel } from './analyze.mjs'

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/** Exact frame rate as a rational frame duration. */
export function rateOf(fps) {
  const ntsc = [[23.976, 24], [29.97, 30], [47.952, 48], [59.94, 60], [119.88, 120]]
  for (const [v, base] of ntsc) if (Math.abs(fps - v) < 0.01) return { fps: base * 1000 / 1001, timebase: base, ntsc: true, num: 1001, den: base * 1000 }
  const base = Math.round(fps) || 25
  return { fps: base, timebase: base, ntsc: false, num: 100, den: base * 100 }
}

const frames = (seconds, rate) => Math.round(seconds * rate.fps)
const ftime = (n, rate) => (n === 0 ? '0s' : `${n * rate.num}/${rate.den}s`)

function timecodeFrames(tc, rate) {
  const m = /^(\d{1,2})[:;](\d{2})[:;](\d{2})[:;.](\d{2,3})$/.exec(tc || '')
  if (!m) return 0
  const [h, mi, s, f] = m.slice(1).map(Number)
  return ((h * 60 + mi) * 60 + s) * rate.timebase + f
}

function fmtTc(sec) {
  const s = Math.max(0, sec)
  const m = Math.floor(s / 60)
  return `${String(m).padStart(2, '0')}:${(s - m * 60).toFixed(1).padStart(4, '0')}`
}

/** Selected segments in shooting order (file order, then time). */
export function selectSegments(results, grades, overrides = {}) {
  const want = new Set(grades)
  const out = []
  for (const f of results.files) {
    if (!f.segments) continue
    for (const s of [...f.segments, ...f.rejected].sort((a, b) => a.start - b.start)) {
      const g = effectiveGrade(s, overrides)
      if (want.has(g)) out.push({ file: f, seg: s, grade: g })
    }
  }
  return out
}

function noteOf({ seg, grade }) {
  const r = seg.review
  return [`${grade}·${GRADE_LABEL[grade]}`, r?.shotType, r?.subject, seg.gradeReason].filter(Boolean).join(' | ')
}

export function toFcpxml(results, items, title) {
  const formats = new Map(), assets = new Map()
  const fmtKey = (m) => `${m.width}x${m.height}@${rateOf(m.fps).timebase}${rateOf(m.fps).ntsc ? 'n' : ''}`
  const resources = []
  for (const { file } of items) {
    const key = fmtKey(file.meta)
    if (!formats.has(key)) {
      const id = `r${formats.size + 1}`
      const rate = rateOf(file.meta.fps)
      formats.set(key, { id, rate })
      resources.push(`    <format id="${id}" frameDuration="${ftime(1, rate)}" width="${file.meta.width}" height="${file.meta.height}"/>`)
    }
    if (!assets.has(file.path)) {
      const { id: fid, rate } = formats.get(key)
      const id = `a${assets.size + 1}`
      const tc = timecodeFrames(file.meta.timecode, rate)
      const total = frames(file.meta.duration, rate)
      assets.set(file.path, { id, rate, fid, tc })
      resources.push(`    <asset id="${id}" name="${esc(basename(file.path))}" start="${ftime(tc, rate)}" duration="${ftime(total, rate)}" hasVideo="1" format="${fid}" videoSources="1"${file.meta.hasAudio ? ' hasAudio="1" audioSources="1" audioChannels="2"' : ''}>
      <media-rep kind="original-media" src="${esc(pathToFileURL(file.path).href)}"/>
    </asset>`)
    }
  }
  const seqFormat = items.length ? formats.get(fmtKey(items[0].file.meta)) : { id: 'r1', rate: rateOf(25) }
  if (!items.length) resources.push(`    <format id="r1" frameDuration="${ftime(1, seqFormat.rate)}" width="1920" height="1080"/>`)
  const sr = seqFormat.rate
  let offset = 0
  const clips = items.map((item) => {
    const { file, seg, grade } = item
    const a = assets.get(file.path)
    const inF = frames(seg.start, a.rate)
    const durSeq = Math.max(1, frames(seg.duration, sr))
    const durClip = Math.max(1, frames(seg.duration, a.rate))
    const tags = [grade, seg.review?.shotType, ...(seg.review?.tags || [])].filter(Boolean).join(', ')
    const xml = `          <asset-clip ref="${a.id}" offset="${ftime(offset, sr)}" name="${esc(`${grade} ${basename(file.path)} ${fmtTc(seg.start)}`)}" start="${ftime(a.tc + inF, a.rate)}" duration="${ftime(durSeq, sr)}" format="${a.fid}" tcFormat="NDF">
            <note>${esc(noteOf(item))}</note>
            <keyword start="${ftime(a.tc + inF, a.rate)}" duration="${ftime(durClip, a.rate)}" value="${esc(tags)}"/>
            <marker start="${ftime(a.tc + inF, a.rate)}" duration="${ftime(1, a.rate)}" value="${esc(noteOf(item).slice(0, 120))}"/>
          </asset-clip>`
    offset += durSeq
    return xml
  })
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE fcpxml>
<fcpxml version="1.10">
  <resources>
${resources.join('\n')}
  </resources>
  <library>
    <event name="${esc(title)}">
      <project name="${esc(title)}">
        <sequence format="${seqFormat.id}" duration="${ftime(offset, sr)}" tcStart="0s" tcFormat="NDF">
          <spine>
${clips.join('\n')}
          </spine>
        </sequence>
      </project>
    </event>
  </library>
</fcpxml>
`
}

const rateXml = (r) => `<rate><timebase>${r.timebase}</timebase><ntsc>${r.ntsc ? 'TRUE' : 'FALSE'}</ntsc></rate>`

export function toXmeml(results, items, title) {
  const seqMeta = items[0]?.file.meta || { width: 1920, height: 1080, fps: 25 }
  const sr = rateOf(seqMeta.fps)
  const fileIds = new Map()
  let offset = 0
  const video = [], audio = []
  items.forEach((item, i) => {
    const { file, seg, grade } = item
    const r = rateOf(file.meta.fps)
    const inF = frames(seg.start, r), outF = frames(seg.end, r)
    const len = Math.max(1, frames(seg.duration, sr))
    const total = frames(file.meta.duration, r)
    let fileXml
    if (fileIds.has(file.path)) fileXml = `<file id="${fileIds.get(file.path)}"/>`
    else {
      const id = `file-${fileIds.size + 1}`
      fileIds.set(file.path, id)
      const url = pathToFileURL(file.path).href.replace(/^file:\/\/\//, 'file://localhost/')
      fileXml = `<file id="${id}"><name>${esc(basename(file.path))}</name><pathurl>${esc(url)}</pathurl>${rateXml(r)}<duration>${total}</duration>` +
        `<media><video><samplecharacteristics>${rateXml(r)}<width>${file.meta.width}</width><height>${file.meta.height}</height></samplecharacteristics></video>` +
        (file.meta.hasAudio ? '<audio><channelcount>2</channelcount></audio>' : '') + '</media></file>'
    }
    const name = esc(`${grade} ${basename(file.path)} ${fmtTc(seg.start)}`)
    const comment = `<comments><mastercomment1>${esc(noteOf(item))}</mastercomment1></comments>`
    const label = `<labels><label2>${grade === 'A' ? 'Forest' : grade === 'B' ? 'Mango' : 'Rose'}</label2></labels>`
    const vid = `clipitem-v${i + 1}`, aid = `clipitem-a${i + 1}`
    const links = file.meta.hasAudio
      ? `<link><linkclipref>${vid}</linkclipref><mediatype>video</mediatype><trackindex>1</trackindex><clipindex>${i + 1}</clipindex></link><link><linkclipref>${aid}</linkclipref><mediatype>audio</mediatype><trackindex>1</trackindex><clipindex>${i + 1}</clipindex></link>`
      : ''
    video.push(`<clipitem id="${vid}"><name>${name}</name><enabled>TRUE</enabled><duration>${total}</duration>${rateXml(r)}<start>${offset}</start><end>${offset + len}</end><in>${inF}</in><out>${outF}</out>${fileXml}${comment}${label}${links}</clipitem>`)
    if (file.meta.hasAudio) {
      audio.push(`<clipitem id="${aid}"><name>${name}</name><enabled>TRUE</enabled><duration>${total}</duration>${rateXml(r)}<start>${offset}</start><end>${offset + len}</end><in>${inF}</in><out>${outF}</out><file id="${fileIds.get(file.path)}"/><sourcetrack><mediatype>audio</mediatype><trackindex>1</trackindex></sourcetrack>${links}</clipitem>`)
    }
    offset += len
  })
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE xmeml>
<xmeml version="5">
  <sequence id="sequence-1">
    <name>${esc(title)}</name>
    <duration>${offset}</duration>
    ${rateXml(sr)}
    <media>
      <video>
        <format><samplecharacteristics>${rateXml(sr)}<width>${seqMeta.width}</width><height>${seqMeta.height}</height><pixelaspectratio>square</pixelaspectratio><fielddominance>none</fielddominance></samplecharacteristics></format>
        <track>
          ${video.join('\n          ')}
        </track>
      </video>
      <audio>
        <track>
          ${audio.join('\n          ')}
        </track>
      </audio>
    </media>
  </sequence>
</xmeml>
`
}

const csvCell = (v) => {
  const s = String(v ?? '')
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export function toCsv(results, items) {
  const head = ['等级', '文件', '入点(s)', '出点(s)', '时长(s)', '技术分', '清晰度(相对)', '抖动(%画幅)', 'AI审美', 'AI构图', '景别', '运镜', '主体', '问题', '标签', '理由', '是否人工改判', '文件路径']
  const rows = items.map(({ file, seg, grade }) => [
    grade, basename(file.path), seg.start.toFixed(2), seg.end.toFixed(2), seg.duration.toFixed(2), seg.tech.score,
    seg.tech.focusRel ?? '', seg.tech.shake, seg.review?.aesthetic ?? '', seg.review?.composition ?? '',
    seg.review?.shotType ?? '', seg.review?.cameraMove ?? '', seg.review?.subject ?? '',
    [...seg.flags.map(flagLabel), ...(seg.review?.issues || [])].join('、'), (seg.review?.tags || []).join('、'),
    seg.gradeReason || '', grade !== seg.grade ? '是' : '', file.path,
  ])
  return '\ufeff' + [head, ...rows].map((r) => r.map(csvCell).join(',')).join('\r\n') + '\r\n'
}
