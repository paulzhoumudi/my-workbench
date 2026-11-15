# 素材清洗台 · DSH Desktop 工作台

可维护源码位于 [plugin](plugin/README.md)。原始需求见 [方案.md](方案.md)。

当前实现提供：本地技术检测、可选 AI 静帧复审、A/B/C 片段标注、按需视频预览、人工改判、FCPXML / Premiere XML / CSV 导出，以及 DSH 对话工具。原始素材只读。

工作台在没有接入视觉模型时，只能判断画面技术指标；A 表示优先候选，仍要人工确认内容和动作。当前 AI 复审按片段抽静帧，不能保证发现瞬时穿帮或判断完整运镜。

## 本地验证

在 `plugin` 目录运行 `npm test`。已用本机一条 16.8 秒 4K HEVC 真实素材完成技术检测，结果见 [试运行结果](trial-real-footage/results.json)。真实 DSH Desktop 安装和剪辑软件导入需要单独验收。

## 安装包

源码目录中执行 `npm pack --pack-destination dist` 生成安装包。原有的 `dsh-footage-culler-0.1.0.tgz` 是方案附带的旧包；请使用新版安装包。
