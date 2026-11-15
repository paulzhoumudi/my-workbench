// Builds a demo project (东湖秋日 Vlog sample docs + synthetic footage) through
// the real service, so the panel can be exercised without DSH Desktop.
import { mkdir, copyFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
import { ensureFixtures } from '../make-fixtures.mjs'
const fixtures = ensureFixtures()

export const DOCS = {
  '00_主题简报.md': `# 主题简报\n项目：东湖秋日 Vlog\n平台：B站 / 视频号（横屏 16:9）　目标时长：90 秒\n受众：25-35 岁城市上班族，周末想找近郊放松去处\n基调：治愈、慢节奏、真实\n拍摄日期：10 月 11 日、12 日（两天）\n`,
  '01_创意方向.md': `# 创意方向（AI 生成 3 个，已选 B）\n- A.「一个人的东湖」——独处视角，第一人称旁白\n- B.「东湖慢生活一日」——按时间线：清晨骑行 → 午后咖啡 → 落日 ✅ 已选\n- C.「东湖的 5 种秋色」——按色彩分段，节奏偏快\n`,
  '02_文案.md': `# 文案 v2（口语化，约 300 字，估算朗读 86 秒）\n\n【开场】\n秋天的东湖，适合慢下来。\n今天不赶路，就骑车、喝咖啡、等一场落日。\n\n【清晨 · 骑行绿道】\n早上七点的绿道几乎没人，风是凉的，湖面还有一层薄雾……\n\n【午后 · 咖啡店】\n骑累了就找家湖边的店坐一会儿……\n\n【傍晚 · 落日观景台】\n六点前到观景台，太阳会刚好落在对岸……\n\n【结尾】\n城市里最奢侈的，可能就是这样一整天。\n`,
  '03_分镜脚本.md': `# 分镜脚本（合计 12s，演示用）\n| 镜号 | 时长 | 画面描述 | 台词/旁白 | 所需标签 | 景别 | 运镜 | 备注 |\n|---|---|---|---|---|---|---|---|\n| 01 | 2s | 测试图开场 | 秋天的东湖，适合慢下来 | 湖边步道,开场 | 全景 | 固定 | |\n| 02 | 2s | 彩色分形空镜 | — | 樱园,转场空镜 | 全景 | 固定 | |\n| 03 | 3s | 横移跟拍 | 今天不赶路，就骑车、喝咖啡 | 骑行绿道,跟拍 | 中景 | 跟拍 | |\n| 04 | 3s | 芦苇逆光空镜 | — | 芦苇,转场空镜 | 特写 | 固定 | 待补拍 |\n| 05 | 2s | 落日延时 | 城市里最奢侈的，可能就是这样一整天 |  | 远景 | 延时 | |\n`,
  '标签字典.yaml': `# 标签字典（项目级）\n继承: vlog-base\n场景: [湖边步道, 樱园, 咖啡店, 骑行绿道, 落日观景台]\n主体: []\n景别: [远景, 全景, 中景, 特写]\n运镜: [固定, 推, 跟拍, 环绕, 航拍]\n情绪: [治愈, 热闹, 安静]\n用途: [开场, 转场空镜, 结尾, 口播]\n待审: []\n`,
  '剪辑思路.md': `# 剪辑思路\n- **节奏**：前 5 秒航拍开场抓眼球 → 中段慢节奏治愈 → 落日段卡 BGM 鼓点快切 → 结尾留白。\n- **BGM**：已授权曲库「秋日轻吉他」，82 BPM，切点对齐重拍。\n- **转场**：以硬切为主，场景切换处用 0.5s 叠化；不使用花哨特效。\n- **配音**：口播原声优先；无口播镜头用 TTS 旁白（音色：温和女声）。\n`
}

export async function buildDemo(service, dir, { render = true } = {}) {
  await mkdir(path.join(dir, '原始素材库'), { recursive: true })
  for (const name of await readdir(fixtures)) if (/^C\d+\.MP4$/.test(name)) await copyFile(path.join(fixtures, name), path.join(dir, '原始素材库', name))
  const { project } = await service.createProject({ path: dir, name: '东湖秋日 Vlog（演示）', template: 'vlog-base' })
  const { root } = await service.open(project.id)
  for (const [key, content] of Object.entries(DOCS)) await service.creative.write(root, key, content, { source: 'chat', model: 'deepseek-v4' })
  await service.creative.write(root, '02_文案.md', DOCS['02_文案.md'].replace('（口语化', '（口语化，已人工微调'), { source: 'manual' })
  await (await service.runStep(project.id, 'import')).done
  await (await service.runStep(project.id, 'clean')).done
  await (await service.runStep(project.id, 'split')).done
  const index = await service.indexStore.read(root)
  const items = Object.values(index.clips).map((clip) => {
    if (clip.id === 'C0001_s01') return { clipId: clip.id, tags: [{ tag: '湖边步道', confidence: 0.86 }, { tag: '全景', confidence: 0.9 }, { tag: '固定', confidence: 0.92 }, { tag: '开场', confidence: 0.72 }, { tag: '治愈', confidence: 0.66 }] }
    if (clip.id === 'C0001_s02') return { clipId: clip.id, tags: [{ tag: '樱园', confidence: 0.7 }, { tag: '全景', confidence: 0.88 }, { tag: '固定', confidence: 0.9 }, { tag: '转场空镜', confidence: 0.81 }] }
    if (clip.rawId === 'C0007') return { clipId: clip.id, tags: [{ tag: '骑行绿道', confidence: 0.78 }, { tag: '跟拍', confidence: 0.55 }, { tag: '中景', confidence: 0.8 }, { tag: '芦苇', dim: '场景', confidence: 0.45 }] }
    return { clipId: clip.id, tags: [{ tag: '湖边步道', confidence: 0.6 }] }
  })
  await service.media.applyTags(root, items, { model: 'deepseek-v4' })
  await service.media.review(root, 'C0001_s01', ['湖边步道', '全景', '固定', '开场'])
  await service.creative.setEditUse(root, '02_文案.md')
  await service.creative.setEditUse(root, '03_分镜脚本.md')
  await service.edit.match(root)
  await service.edit.setSpec(root, (await service.open(project.id)).project, { resolution: '1920x1080', fps: 25, codec: 'h264', bitrateMbps: 12 })
  await service.edit.buildTimeline(root, (await service.open(project.id)).project)
  if (render) await (await service.runStep(project.id, 'render-preview')).done
  return project
}
