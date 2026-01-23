---
name: searching-youtube-videos
description: "在需要搜索/下载视频（B站、YouTube等）、提取音频或转写语音时使用此技能。使用 yt-dlp 实现搜索、下载、转码，硅基流动 FunAudioLLM 实现语音转文字。典型场景：\"搜索 3 个 Claude 教程视频\"、\"下载这个视频的音频并转写\"、\"提取视频内容为文字稿\"。"
---

# Video Search & Download

使用 yt-dlp 搜索、下载 YouTube/B站等平台视频并转写语音。

## Supported Platforms

| Platform | URL Format | Search | Download | Subtitles |
|----------|------------|--------|----------|-----------|
| YouTube | `youtube.com/watch/...` | ✓ | ✓ | ✓ |
| Bilibili | `bilibili.com/video/...` | - | ✓ | ✓ |
| Other | ... | - | ✓ | ✓ |

## Usage

```bash
# 搜索视频（仅 YouTube，不下载）
npx -y bun scripts/search.js "Python 教程" --limit 5

# 搜索 + 下载
npx -y bun scripts/workflow.js "Python 教程" --search --download --limit 3

# 下载 YouTube 视频
npx -y bun scripts/workflow.js "https://youtube.com/watch/VIDEO_ID" --download

# 下载 B站视频
npx -y bun scripts/workflow.js "https://www.bilibili.com/video/BVxxx" --download

# 自动提取音频+转写
SILICON_FLOW_API_KEY="xxx" npx -y bun scripts/workflow.js "URL" --download

# 字幕优先，无字幕时自动 ASR 转写
SILICON_FLOW_API_KEY="xxx" npx -y bun scripts/workflow.js "URL" --download --subtitles

# 仅转写已有音频
npx -y bun scripts/workflow.js "downloads/20260123_120000/视频标题_ID" --transcribe-only
```

## Options

| Option | Description |
|--------|-------------|
| `--search` / `-s` | 执行搜索 |
| `--download` / `-d` | 下载视频 |
| `--limit N` / `-n` | 搜索结果数量 (默认: 5) |
| `--extract-audio` / `-x` | 提取 MP3 音频 |
| `--subtitles` / `--subs` | 下载字幕，失败时自动回退 ASR |
| `--transcribe-only` / `-t` | 仅转写已有音频 |
| `--yes` / `-y` | 跳过确认，直接下载第 1 个 |
| `--lang LANG` | 字幕语言 (默认: en) |

## Dependencies

自动检查并提示安装：
- `yt-dlp` - 视频下载
- `ffmpeg` - 音频/字幕转码

## API Configuration

语音转文字需要硅基流动 API：

```bash
export SILICON_FLOW_API_KEY="your_key"
```

获取 API: https://cloud.siliconflow.cn/

**字幕获取逻辑：**
| 条件 | 行为 |
|------|------|
| `--subtitles` + 有 API Key | 优先下载字幕，失败自动 ASR |
| `--subtitles` + 无 API Key | 只下载字幕 |
| 无 `--subtitles` + 有 API Key | 直接 ASR 转写 |
| 无 `--subtitles` + 无 API Key | 跳过转写 |

## Output Structure

所有文件保存到运行目录的 `downloads/` 文件夹：

```
downloads/
└── 20260123120000/            # 时间戳目录
    └── 视频标题_视频ID/        # 视频目录
        ├── 视频标题-info.md    # 视频简介
        ├── 视频标题-srt.md     # 语音文字稿 (ASR)
        ├── 视频标题.vtt        # 字幕文件 (下载)
        ├── 视频标题.webm       # 视频文件
        └── 视频标题.mp3        # 音频文件
```

## Script Directory

**Important**: 所有脚本位于此 skill 的 `scripts/` 子目录。

**Agent Execution Instructions**:
1. 确定此 SKILL.md 文件的目录路径为 `SKILL_DIR`
2. 脚本路径 = `${SKILL_DIR}/scripts/<script-name>.js`
3. 替换本文档中的所有 `${SKILL_DIR}` 为实际路径

**Script Reference**:
| Script | Purpose |
|--------|---------|
| `scripts/workflow.js` | 完整工作流：搜索→下载→转写 |
| `scripts/search.js` | 仅搜索并展示 |
| `scripts/lib/config.js` | 配置（路径使用相对路径） |
| `scripts/lib/download.js` | 视频/音频/字幕下载 |
| `scripts/lib/transcribe.js` | 语音转文字 (curl 直接调用 API) |
| `scripts/lib/audio.js` | 音频诊断和分割 |

## Best Practices

- 使用 `--limit` 控制搜索结果数量
- 大量视频使用 `--transcribe-only` 避免重复下载
- 设置 `SILICON_FLOW_API_KEY` 后自动生成文字稿
- 字幕优先下载，失败自动 ASR 回退

## Reference

详细文档：
- `./references/yt-dlp-usage.md` - yt-dlp 命令速查
- `./references/silicon-flow-api.md` - 硅基流动 API 调用示例
- `./references/error-handling.md` - 异常处理（文件超限、ffmpeg 分割）
- `./references/output-formats.md` - 输出格式和命名规范

## Extension Support

Custom styles and configurations via EXTEND.md.

**Check paths** (priority order):
1. `.life-good-skill/<skill-name>/EXTEND.md` (project)
2. `~/.life-good-skill/<skill-name>/EXTEND.md` (user)

If found, load before Step 1. Extension content overrides defaults.
