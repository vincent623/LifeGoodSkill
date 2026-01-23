# yt-dlp 常用命令速查

## 搜索

```bash
# 搜索并下载第一个结果
yt-dlp "ytsearch:Python 教程"

# 搜索并下载前3个结果
yt-dlp "ytsearch3:Python 教程"

# 只获取搜索信息（不下载）
yt-dlp --print "%(title)s %(id)s %(view_count)s" "ytsearch10:猫"
```

## 下载

```bash
# 下载最高质量
yt-dlp "https://youtube.com/watch/..."

# 下载特定画质
yt-dlp -f "bestvideo[height<=1080]+bestaudio" "URL"

# 下载音频（MP3）
yt-dlp -x --audio-format mp3 "URL"

# 指定输出路径
yt-dlp -o "~/Downloads/%(title)s.%(ext)s" "URL"
```

## 字幕

```bash
# 下载所有字幕
yt-dlp --write-subs "URL"

# 下载指定语言字幕
yt-dlp --write-subs --sub-langs en "URL"

# 下载字幕并嵌入视频
yt-dlp --embed-subs "URL"
```

## 格式选项

| 选项 | 说明 |
|------|------|
| `best` | 最高质量 |
| `worst` | 最低质量 |
| `bestvideo[height<=1080]` | 最高 1080p |
| `bestaudio` | 最佳音频 |
| `bestvideo+bestaudio` | 最佳视频+音频分离 |

## 更多信息

```bash
# 查看视频信息
yt-dlp --dump-json "URL"

# 列出可用格式
yt-dlp -F "URL"

# 查看字幕列表
yt-dlp --list-subs "URL"
```
