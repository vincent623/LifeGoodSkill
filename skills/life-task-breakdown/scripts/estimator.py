#!/usr/bin/env python3
"""
Effort Estimation Utilities
"""
from dataclasses import dataclass
from typing import List, Dict

@dataclass
class EffortEstimate:
    task_name: str
    optimistic: float  # 最乐观
    realistic: float   # 最可能
    pessimistic: float # 最悲观
    confidence: float  # 0-1

# 复杂度系数
COMPLEXITY_FACTORS = {
    "trivial": 0.5,
    "simple": 0.8,
    "moderate": 1.0,
    "complex": 1.5,
    "very_complex": 2.0
}

# 任务类型基准工时（小时）
TASK_BASELINE = {
    "analysis": 6,
    "research": 8,
    "design": 12,
    "development": 24,
    "testing": 8,
    "deployment": 4,
    "review": 4,
    "meeting": 2,
    "documentation": 4,
    "communication": 2
}

def estimate_withPERT(optimistic: float, realistic: float, pessimistic: float) -> float:
    """PERT三点估算"""
    return (optimistic + 4 * realistic + pessimistic) / 6

def estimate_task_complexity(task: str) -> str:
    """估算任务复杂度"""
    task_lower = task.lower()

    complexity_indicators = {
        "very_complex": ["架构", "重构", "系统设计", "多团队", "高风险"],
        "complex": ["开发", "集成", "安全", "性能优化"],
        "moderate": ["功能", "模块", "接口", "数据迁移"],
        "simple": ["修复", "配置", "更新", "文档"],
        "trivial": ["检查", "验证", "简单测试"]
    }

    for complexity, indicators in complexity_indicators.items():
        if any(ind in task_lower for ind in indicators):
            return complexity

    return "moderate"

def calculate_effort(task: str, complexity: str = None) -> EffortEstimate:
    """计算任务工时估算"""
    if complexity is None:
        complexity = estimate_task_complexity(task)

    base = TASK_BASELINE.get("moderate", 8)
    factor = COMPLEXITY_FACTORS.get(complexity, 1.0)
    realistic = base * factor

    # PERT估算
    optimistic = realistic * 0.6
    pessimistic = realistic * 1.6

    # 置信度
    confidence = 0.9 if complexity == "simple" else 0.7

    return EffortEstimate(
        task_name=task,
        optimistic=round(optimistic, 1),
        realistic=round(realistic, 1),
        pessimistic=round(pessimistic, 1),
        confidence=confidence
    )

def format_duration(hours: float) -> str:
    """格式化时长显示"""
    if hours < 1:
        return f"{int(hours * 60)}分钟"
    elif hours < 8:
        return f"{hours:.1f}小时"
    elif hours < 24:
        return f"{hours/8:.1f}天"
    else:
        return f"{hours/8:.1f}天 ({hours:.0f}小时)"

def summarize_efforts(tasks: List[EffortEstimate]) -> Dict:
    """汇总工时估算"""
    total_realistic = sum(e.realistic for e in tasks)
    total_optimistic = sum(e.optimistic for e in tasks)
    total_pessimistic = sum(e.pessimistic for e in tasks)
    avg_confidence = sum(e.confidence for e in tasks) / len(tasks) if tasks else 0

    return {
        "total_hours": round(total_realistic, 1),
        "total_days": round(total_realistic / 8, 1),
        "optimistic_days": round(total_optimistic / 8, 1),
        "pessimistic_days": round(total_pessimistic / 8, 1),
        "avg_confidence": round(avg_confidence, 2)
    }
