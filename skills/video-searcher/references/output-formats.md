# 输出格式和转码选项

## 输出模板

```bash
# 基本模板
-o "%(title)s.%(ext)s"

# 带日期
-o "%(upload_date)s-%(title)s.%(ext)s"

# 带播放量
-o "%(view_count)s-%(title)s.%(ext)s"

# 自定义目录
-o "~/Videos/%(title)s.%(ext)s"
```

## 模板变量

| 变量 | 说明 |
|------|------|
| `%(title)s` | 视频标题 |
| `%(id)s` | 视频 ID |
| `%(ext)s` | 文件扩展名 |
| `%(upload_date)s` | 上传日期 (YYYYMMDD) |
| `%(view_count)s` | 观看次数 |
| `%(duration)s` | 时长（秒） |
| `%(uploader)s` | 上传者 |
| `%(playlist)s` | 所属播放列表 |

## 音频提取

```bash
# 提取 MP3
yt-dlp -x --audio-format mp3 "URL"

# 提取 MP3 (指定码率)
yt-dlp -x --audio-format mp3 --audio-quality 192K "URL"

# 提取 AAC
yt-dlp -x --audio-format aac "URL"

# 提取 M4A
yt-dlp -x --audio-format m4a "URL"
```

## 字幕格式

```bash
# 下载 vtt 字幕
yt-dlp --write-subs --sub-format vtt "URL"

# 下载 srt 字幕
yt-dlp --write-subs --sub-format srt "URL"

# 嵌入字幕到视频
yt-dlp --embed-subs "URL"
```

## 画质选择

```bash
# 最高画质
-f best

# 1080p
-f "bestvideo[height<=1080]+bestaudio"

# 720p
-f "bestvideo[height<=720]+bestaudio"

# 仅视频（无音频）
-f bestvideo

# 仅音频
-f bestaudio
```
