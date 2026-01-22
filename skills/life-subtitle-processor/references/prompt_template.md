# LLM 语义切片提示词模板

## 概述

此提示词用于指导LLM（Large Language Model）进行字幕的智能语义切片。通过分析字幕内容，识别知识点边界，生成高质量的切片方案。

## 基础提示词

适用于教育视频字幕切片的通用提示词模板。

### 完整提示词

```
你是一位专业的视频课程制作者和教学设计师。我将提供视频字幕文本，请基于语义和逻辑结构进行智能切片。

**任务要求：**
1. 分析字幕内容的逻辑结构和知识点边界
2. 将字幕分割为5-12个知识点切片
3. 每个切片的时长应在3-20分钟之间
4. 优先在自然的主题转换点进行切分

**输出格式（必须是有效的JSON）：**
```json
{
  "slice_count": 数字,
  "slices": [
    {
      "slice_id": 1,
      "slice_name": "切片标题",
      "knowledge_type": "知识类型(概论/概念/计算/案例/操作/总结)",
      "start_seconds": 开始秒数,
      "end_seconds": 结束秒数,
      "key_keywords": ["关键词1", "关键词2", "关键词3"],
      "brief_intro": "切片内容简介"
    }
  ]
}
```

**关键要求：**
- slice_id 必须是数字，从1开始
- knowledge_type 必须是指定值之一
- 所有时间字段必须是数字（秒）
- key_keywords 必须是数组，包含3-5个词
- brief_intro 一句话概括，20-80字

**字幕内容：**
[字幕文本在此处]

现在请进行切片分析。
```

## 提示词变体

### 变体1：严格格式控制版本

用于对JSON输出格式有严格要求的场景。

```
你是专业视频编辑。任务：分析以下字幕，生成标准JSON格式的切片方案。

**必需字段（严格要求）：**
- slice_id: 整数，从1开始递增
- slice_name: 字符串
- knowledge_type: 必须是 "概论"|"概念"|"计算"|"案例"|"操作"|"总结"
- start_seconds: 整数
- end_seconds: 整数（必须 > start_seconds）
- key_keywords: 字符串数组，长度3-5
- brief_intro: 字符串，长度20-80字

**JSON输出示例格式（必须严格遵循）：**
```json
{
  "slice_count": 6,
  "slices": [
    {
      "slice_id": 1,
      "slice_name": "导学",
      "knowledge_type": "概论",
      "start_seconds": 0,
      "end_seconds": 300,
      "key_keywords": ["导学", "背景", "概述"],
      "brief_intro": "视频导学内容"
    }
  ]
}
```

**字幕内容：**
[字幕文本]

请生成有效的JSON输出，确保没有任何语法错误。
```

### 变体2：优质内容版本

注重切片质量和知识点精准度。

```
作为资深的在线教育内容设计师，请分析字幕内容并生成高质量的课程切片方案。

**设计原则：**
1. 每个切片应围绕一个核心知识点
2. 优先在逻辑转折点进行切分
3. 避免在中间切断相关概念
4. 确保切片顺序的学习逻辑
5. 时长应考虑学生专注力（6-12分钟为佳）

**知识点分类指南：**
- **概论**：引入、概述、背景、导学
- **概念**：定义、原理、理论、规则
- **计算**：算法、公式、方法、步骤
- **案例**：示例、应用、实践、演示
- **操作**：操作步骤、使用说明、流程
- **总结**：回顾、总结、要点、强调

**字幕内容：**
[字幕文本]

请生成JSON格式的切片方案，确保每个切片有意义且便于学习。
```

### 变体3：多语言版本

```
[中文提示词如上]

---

For English:
You are a professional video course producer. Please analyze the following subtitle content and generate intelligent slicing based on semantic structure.

**Requirements:**
1. Identify knowledge point boundaries
2. Create 5-12 slices
3. Each slice should be 3-20 minutes
4. Ensure logical flow

**Output Format (valid JSON):**
[JSON schema as shown above]

**Subtitle Content:**
[English subtitle text]
```

## 使用指南

### 如何集成提示词

```python
from openai import OpenAI

# 读取字幕文本
with open('subtitle.md', 'r', encoding='utf-8') as f:
    subtitle_text = f.read()

# 准备提示词
base_prompt = """[基础提示词模板]"""
full_prompt = base_prompt.replace(
    "[字幕文本在此处]",
    subtitle_text
)

# 调用LLM
client = OpenAI(
    api_key="your_api_key",
    base_url="https://api.minimax.chat/v1"  # MiniMax API
)

response = client.chat.completions.create(
    model="minimax-m2",
    messages=[{"role": "user", "content": full_prompt}],
    temperature=0.3  # 降低温度以确保格式稳定
)

# 获取响应
result = response.choices[0].message.content
```

### 调试技巧

1. **如果输出不是有效JSON**
   - 在提示词中加入更明确的格式示例
   - 降低temperature参数（0.1-0.3）
   - 在提示词末尾添加：`输出必须是有效的JSON，不要包含任何其他文本。`

2. **如果切片数量不合理**
   - 明确指定切片数量范围
   - 提供字幕长度信息帮助LLM计算
   - 调整目标时长参数

3. **如果knowledge_type值不规范**
   - 提供具体的有效值列表
   - 在示例中展示正确和错误的值
   - 使用枚举格式严格限制

### 性能优化

**降低延迟：**
```python
# 使用流式响应
stream = client.chat.completions.create(
    model="minimax-m2",
    messages=[...],
    stream=True  # 启用流式输出
)
```

**提高稳定性：**
```python
# 使用重试机制
max_retries = 3
for attempt in range(max_retries):
    try:
        response = client.chat.completions.create(...)
        # 验证JSON格式
        json.loads(response.choices[0].message.content)
        break
    except (json.JSONDecodeError, Exception) as e:
        if attempt == max_retries - 1:
            raise
```

## 常见问题

**Q: 字幕很长会影响API成本吗？**
A: 是的。考虑分批处理或先进行摘要处理。

**Q: 如何确保JSON输出格式正确？**
A: 在提示词中提供详细的格式示例，使用低temperature值，添加格式验证。

**Q: 能否自定义知识点分类？**
A: 可以。修改提示词中的knowledge_type有效值列表即可。

**Q: 切片效果不好怎么办？**
A: 尝试变体2（优质内容版本）或提供更详细的上下文说明。

## 最佳实践

1. ✅ 总是验证JSON输出的有效性
2. ✅ 在生产环境使用规则引擎作为备选方案
3. ✅ 定期测试提示词效果
4. ✅ 保存成功的提示词变体
5. ✅ 监控API成本和响应时间
