# JSON 输出格式规范

## 概述

字幕处理器生成的JSON文件遵循统一的格式规范。本文档详细说明了每个字段的含义和有效值。

## 根级字段

| 字段名 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `source_file` | string | ✅ | 源字幕文件名 |
| `video_title` | string | ✅ | 视频标题 |
| `total_duration_seconds` | number | ✅ | 总时长（秒） |
| `slice_count` | number | ✅ | 切片数量 |
| `slices` | array | ✅ | 切片数组 |

## 切片对象字段

每个切片对象包含以下字段：

| 字段名 | 类型 | 必需 | 说明 | 示例 |
|------|------|------|------|------|
| `slice_id` | number | ✅ | 切片序号（从1开始） | 1 |
| `slice_name` | string | ✅ | 切片标题/知识点名称 | "导学与背景介绍" |
| `knowledge_type` | string | ✅ | 知识点类型 | "概论" |
| `start_time_seconds` | number | ✅ | 开始时间（秒） | 0 |
| `end_time_seconds` | number | ✅ | 结束时间（秒） | 350 |
| `start_time_formatted` | string | ✅ | 格式化开始时间 | "00:00:00" |
| `end_time_formatted` | string | ✅ | 格式化结束时间 | "00:05:50" |
| `key_keywords` | array | ✅ | 关键词数组 | ["导学", "背景", "介绍"] |
| `brief_intro` | string | ✅ | 切片内容简介 | "视频开篇介绍本节内容..." |

## 字段详解

### knowledge_type（知识点类型）

推荐值（可根据实际内容扩展）：

- **概论** - 理论基础、导学、背景介绍
- **概念** - 基本概念、定义、原理
- **计算** - 计算方法、数值演算、公式应用
- **案例** - 实际案例分析、案例研究
- **操作** - 步骤说明、流程演示
- **总结** - 知识点总结、要点回顾

### 时间格式

- **秒数格式** - 整数，从0开始
- **格式化格式** - `HH:MM:SS` 格式（24小时制）

转换公式：
```
total_seconds = 2745
hours = 2745 // 3600 = 0
minutes = (2745 % 3600) // 60 = 45
seconds = 2745 % 60 = 45
formatted = "00:45:45"
```

### key_keywords（关键词）

- **数量** - 3-5个关键词
- **用途** - 用于搜索和检索
- **选择** - 从切片内容中提取最重要的术语

### brief_intro（内容简介）

- **长度** - 一句话，20-80字
- **要求** - 简明扼要地说明切片内容
- **示例**：
  - ✅ "介绍建筑计量的基本概念和国家规范要求"
  - ✅ "通过实际工程案例演示混凝土用量的计算方法"
  - ❌ "这部分很重要" （太模糊）

## 完整示例

```json
{
  "source_file": "2025年案例分析真题解析-第一题.md",
  "video_title": "2025年案例分析真题解析-第一题",
  "total_duration_seconds": 2100,
  "slice_count": 6,
  "slices": [
    {
      "slice_id": 1,
      "slice_name": "导学与背景介绍",
      "knowledge_type": "概论",
      "start_time_seconds": 0,
      "end_time_seconds": 350,
      "start_time_formatted": "00:00:00",
      "end_time_formatted": "00:05:50",
      "key_keywords": ["导学", "背景", "介绍"],
      "brief_intro": "视频开篇介绍本节内容的背景和学习目标"
    },
    {
      "slice_id": 2,
      "slice_name": "基本概念与定义",
      "knowledge_type": "概念",
      "start_time_seconds": 350,
      "end_time_seconds": 700,
      "start_time_formatted": "00:05:50",
      "end_time_formatted": "00:11:40",
      "key_keywords": ["概念", "定义", "规范"],
      "brief_intro": "详细解释建筑计量的核心概念和国家规范要求"
    },
    {
      "slice_id": 3,
      "slice_name": "计算方法与公式",
      "knowledge_type": "计算",
      "start_time_seconds": 700,
      "end_time_seconds": 1050,
      "start_time_formatted": "00:11:40",
      "end_time_formatted": "00:17:30",
      "key_keywords": ["计算", "公式", "方法"],
      "brief_intro": "演示具体的计算公式和步骤"
    },
    {
      "slice_id": 4,
      "slice_name": "真题案例分析（第1题）",
      "knowledge_type": "案例",
      "start_time_seconds": 1050,
      "end_time_seconds": 1400,
      "start_time_formatted": "00:17:30",
      "end_time_formatted": "00:23:20",
      "key_keywords": ["真题", "案例", "分析"],
      "brief_intro": "通过实际真题详细讲解解题思路和方法"
    },
    {
      "slice_id": 5,
      "slice_name": "常见错误与易误点",
      "knowledge_type": "总结",
      "start_time_seconds": 1400,
      "end_time_seconds": 1750,
      "start_time_formatted": "00:23:20",
      "end_time_formatted": "00:29:10",
      "key_keywords": ["易误点", "常见错误", "提醒"],
      "brief_intro": "总结学生常犯的错误和需要注意的要点"
    },
    {
      "slice_id": 6,
      "slice_name": "知识点总结与回顾",
      "knowledge_type": "总结",
      "start_time_seconds": 1750,
      "end_time_seconds": 2100,
      "start_time_formatted": "00:29:10",
      "end_time_formatted": "00:35:00",
      "key_keywords": ["总结", "回顾", "要点"],
      "brief_intro": "对本节重点内容进行总体回顾和梳理"
    }
  ]
}
```

## 验证规则

生成的JSON应满足以下验证规则：

1. **结构完整** - 所有必需字段都存在
2. **类型正确** - 字段类型符合规范
3. **数值有效** - 时间戳递增，不为负数
4. **格式规范** - 时间格式为 HH:MM:SS
5. **内容质量** - 字段内容清晰有意义
6. **唯一性** - 每个slice_id唯一

## 常见错误

❌ **错误1**：slice_id为字符串
```json
"slice_id": "1"  // 应该是 1
```

❌ **错误2**：知识类型不规范
```json
"knowledge_type": "其他"  // 应该选择标准值
```

❌ **错误3**：时间戳错误
```json
"start_time_formatted": "25:00:00"  // 小时数超过24
```

❌ **错误4**：关键词数量过多或过少
```json
"key_keywords": ["单个"]  // 应该3-5个
```

✅ **正确示例** - 参考上面的完整示例
