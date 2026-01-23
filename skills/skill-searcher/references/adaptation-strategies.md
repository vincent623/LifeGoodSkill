# Adaptation Strategies

当搜索结果不完全匹配用户需求时，采用以下策略进行适应性改写。

## 策略 1: 功能扩展

基于已有技能，建议功能增强。

**场景**: 用户需要 PDF 处理，但搜索结果只有 PDF 转 PPT

**建议**:
- 推荐 `life-pdf-to-ppt` 作为基础
- 补充说明: 可配合 `life-text-proofreader` 进行文字校对
- 建议参数: `--proofread` 启用校对功能

## 策略 2: 组合推荐

多个技能组合使用以达到目标。

**场景**: 用户需要"整理桌面并生成报告"

**组合方案**:
1. `life-file-organizer` - 整理文件
2. `life-text-proofreader` - 生成结构化报告
3. `life-markdown-normalizer` - 标准化输出

## 策略 3: 替代方案

查找类似但不同的技能。

**场景**: 用户需要"图片压缩"，但搜索结果是"图片转换"

**替代建议**:
- 指出差异: 图片转换 != 图片压缩
- 推荐相关: `life-file-organizer` 可按类型分类图片
- 建议搜索词: "图片压缩", "image compress", "图片优化"

## 策略 4: 参数调整

建议更精确的搜索关键词。

**场景**: 用户需要"会议转录"，但搜索无结果

**优化建议**:
- 原搜索词过于宽泛
- 推荐: `life-transcription` (转录)
- 备选: `life-meeting-summary` (会议纪要)
- 建议搜索: "语音转文字", "audio transcription"

## 搜索词优化

| 原始意图 | 优化搜索词 |
|---------|-----------|
| 写文档 | markdown, 文档生成, writing |
| 处理视频 | video, 视频剪辑, video processing |
| 数据分析 | data, 数据, analytics |
| 翻译文档 | translation, 翻译, translator |
| 整理文件 | organize, 整理, file management |

## 响应模板

```markdown
## 搜索结果

找到 X 个相关技能:

1. **skill-name**
   - 描述
   - 安装: `42plugin install author/skill`
   - 适用场景

## 适应性建议

**如果不完全匹配您的需求:**

1. **尝试这些搜索词**: [关键词列表]
2. **推荐组合**: [技能组合]
3. **功能扩展**: [增强建议]
4. **替代方案**: [类似技能]
```
