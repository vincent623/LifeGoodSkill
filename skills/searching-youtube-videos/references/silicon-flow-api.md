# Silicon Flow API 调用示例

**重要**：使用 curl 直接调用 API，不要使用 npm 包。

> API 调用与视频来源无关，只要音频文件正确即可（B站、YouTube 等）。

## API 端点

```
POST https://api.siliconflow.cn/v1/audio/transcriptions
```

## 认证

```bash
# 设置 API Key
export SILICON_FLOW_API_KEY="your_api_key"
```

## 音频转写 (curl)

```bash
# 基本调用
curl -X POST \
  -H "Authorization: Bearer $SILICON_FLOW_API_KEY" \
  -F "file=@audio.mp3" \
  -F "model=FunAudioLLM/SenseVoiceSmall" \
  https://api.siliconflow.cn/v1/audio/transcriptions
```

### 返回示例

```json
{
  "text": "Hello, this is the transcribed audio content."
}
```

## 文件大小限制

- 最大文件大小: 50MB
- 超过 50MB 需要先分割音频

## Node.js 脚本示例

```javascript
#!/usr/bin/env node
import { spawn } from "child_process";
import { statSync } from "fs";

const apiKey = process.env.SILICON_FLOW_API_KEY;
const audioPath = "audio.mp3";
const apiUrl = "https://api.siliconflow.cn/v1/audio/transcriptions";
const model = "FunAudioLLM/SenseVoiceSmall";

// 检查文件大小
const stats = statSync(audioPath);
if (stats.size > 50 * 1024 * 1024) {
  console.log("文件超过 50MB，需要先分割");
  process.exit(1);
}

const proc = spawn("curl", [
  "-X", "POST",
  "-H", `Authorization: Bearer ${apiKey}`,
  "-F", `file=@${audioPath}`,
  "-F", `model=${model}`,
  apiUrl,
], { stdio: "pipe" });

let output = "";
proc.stdout.on("data", (d) => (output += d.toString()));
proc.on("close", (code) => {
  if (code === 0) {
    const result = JSON.parse(output);
    console.log("转写结果:", result.text);
  } else {
    console.error("转写失败");
  }
});
```

## 常见错误

| 错误 | 原因 | 解决方案 |
|------|------|----------|
| 401 Unauthorized | API Key 无效 | 检查 API Key 是否正确 |
| 413 Payload Too Large | 文件超过 50MB | 分割音频后重试 |
| 404 Not Found | 端点或模型错误 | 确认模型名称: `FunAudioLLM/SenseVoiceSmall` |

## 字幕下载失败时自动回退

```bash
# 1. 先尝试下载字幕
yt-dlp --write-subs --sub-langs zh,en --skip-download -o "subs" "URL"

# 2. 字幕下载失败时，回退 ASR
if [ ! -f "subs.zh.vtt" ] && [ ! -f "subs.en.vtt" ]; then
  SILICON_FLOW_API_KEY="xxx" curl -X POST \
    -H "Authorization: Bearer $SILICON_FLOW_API_KEY" \
    -F "file=@audio.mp3" \
    -F "model=FunAudioLLM/SenseVoiceSmall" \
    https://api.siliconflow.cn/v1/audio/transcriptions
fi
```
