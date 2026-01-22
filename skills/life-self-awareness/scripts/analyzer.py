#!/usr/bin/env python3
"""
Cognitive Bias Analyzer Engine
"""
from pathlib import Path
import re
from dataclasses import dataclass, field
from typing import List, Dict

@dataclass
class BiasResult:
    bias_type: str
    count: int
    severity: str  # low, medium, high
    examples: List[str] = field(default_factory=list)

@dataclass
class DimensionScore:
    dimension: str
    self_score: float  # 0-10
    confidence: float  # 0-10
    evidence: List[str] = field(default_factory=list)

# 认知偏差模式库
BIAS_PATTERNS = {
    "overconfidence": {
        "patterns": [r"非常", r"肯定", r"绝对", r"毫无问题", r"完全没问题", r"一定能"],
        "weight": 1.0,
        "label": "过度自信"
    },
    "underconfidence": {
        "patterns": [r"可能不够", r"不太确定", r"担心", r"只是运气", r"觉得自己"],
        "weight": 0.8,
        "label": "信心不足"
    },
    "imposter_syndrome": {
        "patterns": [r"冒充者", r"只是因为", r"运气好", r"不配", r"害怕被发现"],
        "weight": 0.9,
        "label": "冒充者综合症"
    },
    "dunning_kruger": {
        "patterns": [r"很懂", r"专家", r"没有人比我更", r"简单"],
        "weight": 0.7,
        "label": "邓宁-克鲁格效应"
    },
    "recency_bias": {
        "patterns": [r"最近", r"这次", r"上个月"],
        "weight": 0.5,
        "label": "近因偏差"
    },
    "confirmation_bias": {
        "patterns": [r"证明", r"总是", r"从不", r"一定是的"],
        "weight": 0.6,
        "label": "确认偏差"
    }
}

# 能力维度关键词
DIMENSION_KEYWORDS = {
    "沟通能力": ["沟通", "表达", "演讲", "写作", "汇报", "交流"],
    "技术能力": ["技术", "编程", "代码", "开发", "架构", "算法"],
    "领导力": ["领导", "管理", "团队", "指导", "决策"],
    "创新能力": ["创新", "创意", "新方法", "改进", "突破"],
    "问题解决": ["问题", "解决", "分析", "方案", "决策"],
    "执行力": ["执行", "完成", "交付", "落地", "推进"],
    "学习能力": ["学习", "成长", "提升", "掌握", "新技能"],
    "协作能力": ["协作", "合作", "配合", "支持", "协调"]
}

def analyze_text(text: str) -> Dict[str, BiasResult]:
    """分析文本中的认知偏差"""
    results = {}

    for bias_key, bias_info in BIAS_PATTERNS.items():
        matches = []
        for pattern in bias_info["patterns"]:
            found = re.findall(pattern, text)
            matches.extend(found)

        if matches:
            count = len(matches)
            # 计算严重程度
            word_count = len(text)
            density = count / (word_count / 100)  # 每百字出现次数

            if density > 2:
                severity = "high"
            elif density > 0.5:
                severity = "medium"
            else:
                severity = "low"

            results[bias_key] = BiasResult(
                bias_type=bias_info["label"],
                count=count,
                severity=severity,
                examples=matches[:5]  # 最多5个例子
            )

    return results

def analyze_dimensions(text: str) -> List[DimensionScore]:
    """分析各维度自评"""
    results = []

    for dimension, keywords in DIMENSION_KEYWORDS.items():
        # 统计关键词出现次数
        keyword_counts = {}
        for kw in keywords:
            count = len(re.findall(kw, text))
            if count > 0:
                keyword_counts[kw] = count

        total_kw = sum(keyword_counts.values())

        if total_kw > 0:
            # 估算自评分数（基于描述的详细程度）
            base_score = min(10, 5 + (total_kw * 0.5))

            # 估算自信度（基于绝对词的使用）
            confidence = 5.0
            abs_words = len(re.findall(r"非常|很|特别|极其", text))
            uncertainty = len(re.findall(r"可能|大概|也许|似乎", text))
            confidence = min(10, max(1, 5 + abs_words - uncertainty))

            results.append(DimensionScore(
                dimension=dimension,
                self_score=round(base_score, 1),
                confidence=round(confidence, 1),
                evidence=list(keyword_counts.keys())[:3]
            ))

    return results

def read_files(input_path: str) -> Dict[str, str]:
    """读取输入的文件"""
    path = Path(input_path)
    files = {}

    if path.is_file():
        files[path.name] = path.read_text()
    elif path.is_dir():
        for f in sorted(path.glob("*.md")):
            files[f.name] = f.read_text()
        for f in sorted(path.glob("*.txt")):
            files[f.name] = f.read_text()

    return files
