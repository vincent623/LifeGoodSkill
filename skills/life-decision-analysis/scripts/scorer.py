#!/usr/bin/env python3
"""
Weighted Scoring System
"""
from dataclasses import dataclass
from typing import List, Dict
from enum import Enum

class Hat(Enum):
    WHITE = "🤍 白帽"
    RED = "❤️ 红帽"
    BLACK = "🖤 黑帽"
    YELLOW = "💛 黄帽"
    GREEN = "💚 绿帽"
    BLUE = "💙 蓝帽"

@dataclass
class ScoreBreakdown:
    perspective: str
    base_score: float
    weight: float
    adjusted_score: float
    reasoning: str

# 各视角的默认权重
HAT_WEIGHTS = {
    Hat.WHITE: 1.2,    # 事实很重要
    Hat.RED: 0.8,      # 情感是参考
    Hat.BLACK: 1.3,    # 风险评估很关键
    Hat.YELLOW: 1.0,   # 价值评估
    Hat.GREEN: 0.9,    # 创意加分
    Hat.BLUE: 1.1      # 综合判断
}

def calculate_weighted_score(scores: Dict[Hat, float]) -> tuple:
    """计算加权分数"""

    breakdown = []
    total_weight = 0
    weighted_sum = 0

    for hat in Hat:
        base = scores.get(hat, 5.0)
        weight = HAT_WEIGHTS.get(hat, 1.0)
        adjusted = base * weight

        reasoning = get_reasoning(hat, base)

        breakdown.append(ScoreBreakdown(
            perspective=hat.value,
            base_score=base,
            weight=weight,
            adjusted_score=adjusted,
            reasoning=reasoning
        ))

        weighted_sum += adjusted
        total_weight += weight

    final_score = weighted_sum / total_weight if total_weight > 0 else 50

    return final_score, breakdown

def get_reasoning(hat: Hat, score: float) -> str:
    """获取评分理由"""
    if hat == Hat.WHITE:
        if score >= 7:
            return "事实基础充分，数据支持决策"
        elif score >= 5:
            return "部分事实清晰，但有信息缺口"
        else:
            return "事实不足，需要更多数据支持"

    elif hat == Hat.RED:
        if score >= 7:
            return "直觉积极，情感上支持"
        elif score >= 5:
            return "直觉中性，有一定信心"
        else:
            return "直觉担忧，需要谨慎"

    elif hat == Hat.BLACK:
        if score >= 7:
            return "风险已识别并可控"
        elif score >= 5:
            return "存在风险，但可以接受"
        else:
            return "风险较高，需要特别注意"

    elif hat == Hat.YELLOW:
        if score >= 7:
            return "价值清晰，机会明确"
        elif score >= 5:
            return "有一定价值，但不够显著"
        else:
            return "价值不明显，需要重新评估"

    elif hat == Hat.GREEN:
        if score >= 7:
            return "创新方案丰富，有多种选择"
        elif score >= 5:
            return "有一些创新思路"
        else:
            return "创新不足，需要更多创意"

    else:  # Blue
        if score >= 7:
            return "综合判断积极，建议执行"
        elif score >= 5:
            return "综合判断中性，可以尝试"
        else:
            return "综合判断消极，建议暂缓"

def generate_recommendation(scores: Dict[Hat, float], final_score: float) -> str:
    """生成最终建议"""

    if final_score >= 75:
        return {
            "action": "强烈建议执行",
            "confidence": "高",
            "summary": "多角度分析均支持该决策"
        }
    elif final_score >= 60:
        return {
            "action": "建议执行",
            "confidence": "中",
            "summary": "大部分视角支持，需要关注风险"
        }
    elif final_score >= 45:
        return {
            "action": "谨慎执行",
            "confidence": "中低",
            "summary": "视角存在分歧，需要进一步评估"
        }
    else:
        return {
            "action": "建议暂缓",
            "confidence": "低",
            "summary": "多数视角持保留意见"
        }

def format_score(score: float) -> str:
    """格式化分数显示"""
    if score >= 80:
        return f"{score:.0f} 🟢"
    elif score >= 60:
        return f"{score:.0f} 🟡"
    elif score >= 40:
        return f"{score:.0f} 🟠"
    else:
        return f"{score:.0f} 🔴"
