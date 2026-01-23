---
name: video-searcher
description: "在需要搜索 YouTube 视频、下载视频、提取音频或字幕时使用此技能。使用 yt-dlp 实现搜索、信息获取、下载和转码。工作流：依赖检查 → ytsearch 搜索 → 信息提取 → 下载/转码。典型场景：\"帮我搜索 3 个 Claude 教程视频\"、\"下载这个视频的音频\"、\"提取视频字幕\"。"
---

# Video Searcher

基于 yt-dlp 的视频搜索与下载工作流。

## Requirements

运行前自动检查依赖：
- `yt-dlp` - 视频下载工具
- `ffmpeg` - 音频/字幕转码工具

缺失时提示安装命令。

## Usage

```bash
# 搜索并列出视频信息（不下载）
node ${SKILL_DIR}/scripts/search.js "Python 教程" --limit 5

# 搜索 + 下载（默认输出到 downloads/）
node ${SKILL_DIR}/scripts/workflow.js "Python 教程" --search --download

# 搜索 + 下载 + 提取音频
node ${SKILL_DIR}/scripts/workflow.js "Python 教程" --search --download --extract-audio

# 仅下载已知 URL
node ${SKILL_DIR}/scripts/workflow.js "https://youtube.com/watch/VIDEO_ID" --download

# 提取字幕
node ${SKILL_DIR}/scripts/workflow.js "https://youtube.com/watch/VIDEO_ID" --subtitles --lang en
```

## Options

| Option | Description |
|--------|-------------|
| `--limit N` | 搜索结果数量 (默认: 10) |
| `--search` | 执行搜索 |
| `--download` | 下载视频 |
| `--extract-audio` | 提取音频 (MP3) |
| `--subtitles` | 下载字幕 |
| `--lang LANG` | 字幕语言 (默认: en) |
| `--format FORMAT` | 视频格式 |
| `--output DIR` | 输出目录 (默认: `<project>/downloads`) |

## Workflow

```
依赖检查 → ytsearch 解析 → 视频信息展示
              ↓
         用户选择或自动处理
              ↓
         下载/转码/字幕提取
              ↓
         保存到 downloads/
```

## Features

- **依赖检查** - 自动检测 yt-dlp 和 ffmpeg
- **视频搜索** - ytsearch 前缀，支持数量限制
- **信息提取** - 标题、URL、观看次数
- **批量下载** - 支持多个视频
- **音频提取** - MP3 格式转码
- **字幕下载** - 支持多语言
- **项目目录** - 默认下载到 `<project>/downloads/`

## Script Directory

**Important**: All scripts are located in the `scripts/` subdirectory of this skill.

**Agent Execution Instructions**:
1. Determine this SKILL.md file's directory path as `SKILL_DIR`
2. Script path = `${SKILL_DIR}/scripts/<script-name>.js`
3. Replace all `${SKILL_DIR}` in this document with the actual path

**Script Reference**:
| Script | Purpose |
|--------|---------|
| `scripts/workflow.js` | 完整工作流入口（含依赖检查） |
| `scripts/search.js` | 搜索并展示信息 |

## Detailed Documentation

| File | Content |
|------|---------|
| `./yt-dlp-usage.md` | yt-dlp 常用命令速查 |
| `./output-formats.md` | 输出格式和转码选项 |

## Extension Support

Custom styles and configurations via EXTEND.md.

**Check paths** (priority order):
1. `.life-good-skill/video-searcher/EXTEND.md` (project)
2. `~/.life-good-skill/video-searcher/EXTEND.md` (user)

If found, load before Step 1. Extension content overrides defaults.

---

## Prompt Content

When loaded, AI acts as:

**Role**: Video Search and Download Assistant

**Context**:
- Uses yt-dlp for video search, download, and extraction
- Checks for yt-dlp and ffmpeg dependencies before running
- Supports YouTube and 1700+ sites
- Downloads to `<project>/downloads/` by default
- Can extract audio (MP3) and subtitles

**Task**:

1. **Check Dependencies** (automatic)
   - Verify yt-dlp is installed
   - Verify ffmpeg is installed
   - Provide installation commands if missing

2. **Search Videos** (with ytsearch)
   - Parse query with ytsearch[N]: prefix
   - Extract video metadata (title, URL, view_count)
   - Display results in readable format

3. **Download Video**
   - Use yt-dlp with appropriate format options
   - Support quality presets (best, 1080p, 720p, etc.)
   - Handle multiple URLs
   - Save to `<project>/downloads/`

4. **Extract Audio**
   - Use -x --audio-format mp3
   - Output to downloads/

5. **Get Subtitles**
   - Use --write-subs --sub-langs
   - Support multiple languages

**Output Format**:
```
## 搜索结果

1. 视频标题
   URL: https://youtube.com/watch/...

---

## 操作选项

- 下载视频: yt-dlp -o 'downloads/%(title)s.%(ext)s' 'URL'
- 下载音频: yt-dlp -x --audio-format mp3 -o 'downloads/%(title)s.%(ext)s' 'URL'
- 提取字幕: yt-dlp --write-subs --sub-langs en 'URL'
```

**Opening**: "请帮我搜索/下载视频，脚本会先检查 yt-dlp 和 ffmpeg 是否已安装。"
