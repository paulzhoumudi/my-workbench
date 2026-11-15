# 素材清洗台（dsh-footage-culler）

DSH Desktop 工作台插件。本地检测虚焦、抖动、曝光异常和黑场；可选用多模态模型复审主体、构图与审美；支持片段预览、人工改判及 Premiere / Final Cut / 达芬奇时间线导出。**原始素材只读，插件不会删除或修改任何原片。**

A 是优先候选，B 需要人工复核，C 是问题片段。未启用 AI 时，A 只表示技术指标优秀，仍需确认内容和动作。C 不会自动删除。

完整方案见 [docs/方案.md](docs/方案.md)。

## 能做什么

- 添加素材文件夹，点「开始清洗」：按秒检测虚焦、抖动、过曝/欠曝、黑场，给出可用区段的入点和出点
- 可选的 AI 复审：接入任意 OpenAI 兼容的多模态模型（推荐私有部署 Qwen3-VL），按团队写的审美标准评估主体、构图、景别，并识别场记板、穿帮
- 在片段卡片上一键改判，改判记录会保留下来，用于后续校准
- 点击缩略图可在工作台内播放片段；首次播放会按需生成 960px H.264 预览文件
- 导出 FCPXML、Premiere XML、CSV 场记表
- 在 AI 对话中直接驱动：「清洗今天的素材」「哪些能用」「把 A 导出给 Premiere」

## 环境要求

- DSH Desktop，使用本机 `desktop` profile 安装
- ffmpeg / ffprobe（macOS：`brew install ffmpeg`；Windows 下请在设置中填写 ffmpeg 所在目录）
- 可选：一个多模态模型服务

## 安装（本地）

1. 打包：`npm pack --pack-destination dist`，得到 `dsh-footage-culler-0.2.1.tgz`。
2. 在 DSH Desktop 的本地插件安装入口选择 `.tgz`，或者用 `dsh plugin --profile desktop add <安装包绝对路径>` 安装到桌面 profile。安装入口和命令以当前版本实际界面及输出为准。
3. 完整退出并重新打开 DSH Desktop。
4. 展开左侧栏，点击左上角「工作台」旁边的切换区域，选择「素材清洗台」。

## 使用

1. 点「添加素材文件夹」，选择当天的素材目录。
2. 打开「设置」：
   - 选择严格度；如果是 LOG 素材，勾选「素材为 LOG」
   - 如需 AI 复审，填写 API 地址、模型名和 Key，再写上团队审美标准，然后点「测试连接」
3. 点「开始清洗」，完成后按 A/B/C 浏览片段，不同意的直接改判。
4. 点「导出时间线」，选择保存位置后导入剪辑软件。

命令行批处理（不依赖 DSH）：

```sh
node engine/cli.mjs scan --input /Volumes/素材盘/1026 --out ./job-1026 [--log] [--strictness strict] \
  [--vlm-base-url http://127.0.0.1:8000/v1 --vlm-model Qwen3-VL-8B-Instruct]   # Key 用环境变量 FOOTAGE_VLM_API_KEY
node engine/cli.mjs export --job-dir ./job-1026 --dest ./exports --grades A,B
node tools/calibrate.mjs /Volumes/素材盘/1026 --out ./metrics.csv
```

## 测试

```sh
npm test
```

测试内容：

- 短但有效的片段留在 B 级，不因时长直接归档
- 硬切落在整秒之间时，时间窗沿准确切点断开
- 使用 FFmpeg 生成预览代理，验证 MP4 和拖动播放所需的字节范围响应

## 验收状态（如实记录）

| 项目 | 状态 |
|---|---|
| 本地分析一条 16.8 秒 4K HEVC 真实素材 | ✅ 已完成 |
| FCPXML、Premiere XML、CSV 文件生成 | ✅ 已完成；剪辑软件导入待验收 |
| 短片段、硬切、预览字节范围测试 | ✅ 已通过 |
| 真实 DSH Desktop 加载、侧栏入口、交互 | ⏳ 待安装验收 |
| 在真实 DSH Desktop 中安装、重启后加载、出现在「已安装」列表、侧栏切换入口 | ⏳ 未实测 |
| 在真实宿主中验证会话归属、深浅主题、窄窗口布局、原生窗口拖动 | ⏳ 未实测 |
| 真实拍摄素材的人工标注对比、接入真实 VLM 的效果 | ⏳ 待验收 |
| 导出的 XML 在 Premiere / Final Cut / 达芬奇中实际导入 | ⏳ 未实测 |

## 上架前需要改

- `package.json` 的 `repository` 和 `lib/client.js` 里的 `REPOSITORY` 目前是占位地址 `your-org/dsh-footage-culler`，需要改成你自己的公开 GitHub 仓库后，再按《工作台市场验收规范》提交。
- 填写 `author`。

## 数据位置

`<DSH 数据目录>/footage-culler/`：

- `jobs/<任务ID>/`：`request.json`、`results.json`、`overrides.json`、`thumbs/`、按需生成的 `previews/`、`exports/`
- `folders.json`、`settings.json`
- `feedback.ndjson`：导演改判记录

卸载插件不会删除这些数据。

## 许可

MIT
