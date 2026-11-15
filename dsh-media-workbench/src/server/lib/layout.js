/**
 * Project folder layout (v3): three top-level libraries. Every path the
 * workbench reads or writes is derived from here.
 *
 *   原始素材库/                 raw footage (read-only)
 *   输出素材库/切片素材/         cleaned, split clip proxies
 *   输出素材库/成片/             rendered films, subtitles, manifests
 *   创意剪辑/                   brief, directions, script, storyboard, edit notes
 *   创意剪辑/剪辑数据/           edit spec, match, timeline (machine files)
 *   .dsh/                       config, index, logs, caches (hidden)
 *   .dsh/tags/                  tag dictionary, clean report, discard register
 *                               (managed from the panel's 标签 tab, not as a folder)
 */
export const LIBRARIES = [
  { key: 'raw', dir: '原始素材库', label: '原始素材库', hint: '原片，只读' },
  { key: 'output', dir: '输出素材库', label: '输出素材库', hint: '切片素材与成片' },
  { key: 'creative', dir: '创意剪辑', label: '创意剪辑', hint: '文案、分镜、剪辑思路与时间线' }
]

export const P = {
  raw: '原始素材库',
  output: '输出素材库',
  clips: '输出素材库/切片素材',
  export: '输出素材库/成片',
  tags: '.dsh/tags',
  dictionary: '.dsh/tags/标签字典.yaml',
  cleanReport: '.dsh/tags/清洗报告.json',
  rejected: '.dsh/tags/丢弃登记',
  creative: '创意剪辑',
  refs: '创意剪辑/参考资料',
  editData: '创意剪辑/剪辑数据'
}

/** Directories created for every project. */
export const PROJECT_DIRS = [P.raw, P.clips, P.export, P.tags, P.rejected, P.creative, P.refs, P.editData, '.dsh/log', '.dsh/cache']

/** Folders that are never treated as raw-footage sources when scanning. */
/** v2 tag folder; migrated into .dsh/tags and removed when empty. */
export const LEGACY_TAGS_DIR = '标签管理'

export const RESERVED_DIRS = new Set([P.output, P.creative, LEGACY_TAGS_DIR, '.dsh', '_history', 'node_modules', '.git',
  // v1 layout names, so an un-migrated or partially migrated project is never re-imported as raw footage.
  '01_creative', '03_clips', '04_generated', '05_edit', '06_export', '00_brief'])

export const LAYOUT_VERSION = 3
