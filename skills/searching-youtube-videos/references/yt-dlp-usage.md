# yt-dlp 常用命令速查

## 支持平台

| Platform | URL 示例 | 说明 |
|----------|----------|------|
| YouTube | `https://youtube.com/watch/VIDEO_ID` | 支持搜索 |
| B站 | `https://www.bilibili.com/video/BVxxx` | 不支持搜索 |
| 其他 | ... | 取决于 yt-dlp 支持 |

## 搜索（仅 YouTube）

```bash
# 搜索并下载前3个结果
yt-dlp "ytsearch3:Python 教程"

# 只获取搜索信息（不下载）
yt-dlp --print "%(title)s %(id)s %(view_count)s" "ytsearch10:猫"
```

## 下载

```bash
# 下载 YouTube 最高质量
yt-dlp "https://youtube.com/watch/..."

# 下载 B站视频
yt-dlp "https://www.bilibili.com/video/BV1xx411xx"

# 下载特定画质
yt-dlp -f "bestvideo[height<=1080]+bestaudio" "URL"

# 下载音频（MP3）
yt-dlp -x --audio-format mp3 "URL"

# 指定输出路径
yt-dlp -o "~/Downloads/%(title)s.%(ext)s" "URL"

# 只下载不处理（获取视频文件）
yt-dlp -o "%(title)s.%(ext)s" --no-post-process "URL"
```

## 字幕

```bash
# 下载所有字幕（不下载视频）
yt-dlp --write-subs --skip-download "URL"

# 下载中英文字幕
yt-dlp --write-subs --sub-langs "zh,en" --skip-download "URL"

# 只下载指定语言字幕
yt-dlp --write-subs --sub-langs zh --skip-download "URL"

# 下载字幕并嵌入视频
yt-dlp --embed-subs "URL"

# 指定字幕格式
yt-dlp --sub-format vtt --write-subs "URL"
```

### 字幕工作流（与 ASR 配合）

```bash
# 1. 先尝试下载字幕
yt-dlp --write-subs --sub-langs zh,en --skip-download -o "subs" "URL"

# 2. 检查是否有字幕文件
if ls subs*.vtt 1> /dev/null 2>&1; then
  echo "字幕下载成功"
else
  echo "无字幕，启用 ASR 转写"
  # 使用 Silicon Flow API 转写（参考 silicon-flow-api.md）
fi
```

## 查看信息

```bash
# 查看视频信息（JSON）
yt-dlp --dump-json "URL"

# 列出可用格式
yt-dlp -F "URL"

# 查看字幕列表
yt-dlp --list-subs "URL"

# 查看视频元信息
yt-dlp --print "%(title)s\n%(uploader)s\n%(upload_date)s" "URL"
```

## 格式选项

| 选项 | 说明 |
|------|------|
| `best` | 最高质量 |
| `worst` | 最低质量 |
| `bestvideo[height<=1080]` | 最高 1080p |
| `bestaudio` | 最佳音频 |
| `bestvideo+bestaudio` | 最佳视频+音频分离 |
| `-x` | 提取音频 |
| `--audio-format mp3` | 转换为 MP3 |
| `--audio-quality 192K` | 音频质量 192kbps |
