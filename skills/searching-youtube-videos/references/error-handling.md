# 异常处理指南

## 文件大小限制

Silicon Flow API 限制：
- **最大文件大小**: 50MB
- **最大音频时长**: 3600 秒 (1 小时)

## 自动诊断

工作流会自动检查音频文件：

```javascript
// 诊断逻辑 (audio.js)
const MAX_SIZE = 50 * 1024 * 1024;  // 50MB
const MAX_DURATION = 3600;           // 1小时

if (stats.size > MAX_SIZE) {
  // 标记需要分割
}
```

### 诊断结果示例

```bash
# 文件正常
✓ 文件大小: 12.5MB
✓ 音频时长: 00:32:15

# 文件超限
⚠️  文件大小 52.3MB 超过 50MB 限制
```

## 音频分割 (ffmpeg)

当文件超限时，使用 ffmpeg 自动分割：

```bash
# 手动分割示例
ffmpeg -i input.mp3 -ss 0 -t 1800 -codec:a libmp3lame -q:a 2 part1.mp3
ffmpeg -i input.mp3 -ss 1800 -t 1800 -codec:a libmp3lame -q:a 2 part2.mp3
```

### ffmpeg 参数说明

| 参数 | 说明 |
|------|------|
| `-i input.mp3` | 输入文件 |
| `-ss 0` | 起始时间 |
| `-t 1800` | 切割时长（秒） |
| `-codec:a libmp3lame` | 音频编码器 |
| `-q:a 2` | 音频质量 (0=最好, 9=最差) |
| `-y` | 覆盖已存在文件 |

### 自动分割逻辑

```javascript
// chunkAudio() 实现
const maxDuration = 1800;  // 每块 30 分钟
const chunkCount = Math.ceil(duration / maxDuration);

for (let i = 0; i < chunkCount; i++) {
  const startTime = i * maxDuration;
  const chunkPath = `part${i + 1}.mp3`;

  ffmpeg -i original.mp3 -ss ${startTime} -t ${maxDuration} -y ${chunkPath}
}
```

## 转写流程

```
音频文件 → 诊断 → [正常] → 直接转写
              ↓
          [超限] → ffmpeg 分割 → 分块转写 → 合并结果
```

### 脚本调用

```javascript
import { diagnoseAudioFile, chunkAudio } from "./lib/audio.js";

const diagnosis = diagnoseAudioFile("audio.mp3");

if (diagnosis.needsChunking) {
  console.log(`⚠️  ${diagnosis.issues.map(i => i.message).join(", ")}`);
  const chunks = await chunkAudio("audio.mp3", outputDir);

  for (const chunk of chunks) {
    await transcribeAudio(chunk);
  }
} else {
  await transcribeAudio("audio.mp3");
}
```

## 常见错误处理

### 1. 文件大小超限

```bash
# 错误
Error: 文件大小 65.2MB 超过 50MB 限制

# 解决
# workflow.js 自动调用 ffmpeg 分割
```

### 2. 无法获取音频时长

```bash
# 错误
Error: 无法获取音频时长

# 可能原因
- 文件损坏
- 格式不支持
- ffprobe 未安装

# 解决
ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 audio.mp3
```

### 3. ffmpeg 切割失败

```bash
# 错误
Error: 切割失败，退出码: 1

# 可能原因
- 输入文件损坏
- 编码问题
- 权限不足

# 解决
# 1. 检查文件完整性
file audio.mp3

# 2. 重新编码
ffmpeg -i corrupted.mp3 -codec:a libmp3lame -q:a 2 fixed.mp3
```

### 4. API 认证失败

```bash
# 错误
{"error":"invalid_api_key"}

# 解决
export SILICON_FLOW_API_KEY="正确密钥"
```

## 手动处理大文件

```bash
# 1. 检查文件信息
ffprobe -v error -show_entries format=duration,size -of default=noprint_wrappers=1 audio.mp3

# 2. 手动切割（每块 30 分钟）
ffmpeg -i long_video.mp3 -ss 0 -t 1800 -codec:a libmp3lame -q:a 2 part1.mp3
ffmpeg -i long_video.mp3 -ss 1800 -t 1800 -codec:a libmp3lame -q:a 2 part2.mp3
ffmpeg -i long_video.mp3 -ss 3600 -codec:a libmp3lame -q:a 2 part3.mp3

# 3. 逐块转写
for f in part*.mp3; do
  curl -X POST \
    -H "Authorization: Bearer $SILICON_FLOW_API_KEY" \
    -F "file=@$f" \
    -F "model=FunAudioLLM/SenseVoiceSmall" \
    https://api.siliconflow.cn/v1/audio/transcriptions >> transcript.txt
done
```

## 清理临时文件

转写完成后自动清理：

```javascript
// 删除已处理的音频块
for (let i = 0; i < chunks.length - 1; i++) {
  unlinkSync(chunks[i]);
}

// 删除最后的块
unlinkSync(chunks[chunks.length - 1]);

// 删除空目录
rmdir chunks_dir
```
