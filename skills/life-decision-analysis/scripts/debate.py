#!/usr/bin/env python3
"""
Six Thinking Hats Debate Engine
"""
from dataclasses import dataclass, field
from typing import List, Dict, Tuple, Optional
from enum import Enum

class Hat(Enum):
    WHITE = "🤍 白帽"
    RED = "❤️ 红帽"
    BLACK = "🖤 黑帽"
    YELLOW = "💛 黄帽"
    GREEN = "💚 绿帽"
    BLUE = "💙 蓝帽"

@dataclass
class Perspective:
    hat: Hat
    round_num: int
    key_points: List[str]
    concerns: List[str] = field(default_factory=list)
    suggestions: List[str] = field(default_factory=list)
    score: float = 0.0  # 0-10

@dataclass
class DebateRound:
    round_num: int
    perspectives: List[Perspective]
    confrontations: List[Tuple[Hat, Hat]] = field(default_factory=list)  # 冲突
    alliances: List[Tuple[Hat, Hat]] = field(default_factory=list)  # 结盟

@dataclass
class DecisionAnalysis:
    question: str
    context: str
    rounds: List[DebateRound]
    final_score: float
    recommendation: str
    key_insights: List[str] = field(default_factory=list)

# 六顶思考帽的系统提示词
HAT_PROMPTS = {
    Hat.WHITE: """你是白帽分析师，专注于客观事实和数据。

你的职责：
- 收集和呈现可验证的事实
- 区分事实与观点
- 识别数据中的模式和趋势
- 指出信息缺口

请用简洁的事实性语言回答：{question}

背景信息：{context}

输出格式：
- 事实清单（3-5条）
- 缺失信息
- 数据模式""",

    Hat.RED: """你是红帽分析师，专注于直觉和情感。

你的职责：
- 表达即时的情感反应
- 捕捉直觉和第六感
- 识别情绪信号
- 不要解释，只需感受

请用直觉性的语言回答：{question}

背景信息：{context}

输出格式：
- 直觉反应（1-2句话）
- 情绪信号
- 潜在担忧""",

    Hat.BLACK: """你是黑帽分析师，专注于风险和问题。

你的职责：
- 识别潜在的风险和缺点
- 评估最坏情况的可能
- 指出逻辑漏洞
- 质疑假设的有效性

请用谨慎批判的语言回答：{question}

背景信息：{context}

输出格式：
- 主要风险（3-5条）
- 可能的问题
- 警示信号""",

    Hat.YELLOW: """你是黄帽分析师，专注于价值和机会。

你的职责：
- 发现积极的价值和优势
- 识别潜在的机会
- 探索可能的好处
- 构建乐观的场景

请用积极乐观的语言回答：{question}

背景信息：{context}

输出格式：
- 主要价值（3-5条）
- 潜在机会
- 乐观场景""",

    Hat.GREEN: """你是绿帽分析师，专注于创意和替代方案。

你的职责：
- 提出创新的想法
- 探索替代方案和可能性
- 挑战传统思维
- 提供新的视角

请用创意开放的语言回答：{question}

背景信息：{context}

输出格式：
- 创新想法（3-5条）
- 替代方案
- 新视角""",

    Hat.BLUE: """你是蓝帽主持人，负责流程控制。

你的职责：
- 总结各方观点
- 识别共识和分歧
- 引导对话方向
- 提供结构化结论

请用总结性的语言回答：{question}

背景信息：{context}

输出格式：
- 关键共识
- 主要分歧
- 建议结论"""
}

def generate_perspective(hat: Hat, question: str, context: str, round_num: int) -> Perspective:
    """生成某顶帽子的观点"""
    prompt = HAT_PROMPTS[hat].format(question=question, context=context)

    # 简化处理：根据帽子类型生成结构化观点
    if hat == Hat.WHITE:
        return Perspective(
            hat=hat,
            round_num=round_num,
            key_points=[
                f"关于'{question[:20]}...'的事实信息1",
                f"数据表明的趋势",
                f"需要进一步确认的信息"
            ],
            concerns=["信息不完整"],
            suggestions=["建议收集更多数据"],
            score=7.0
        )
    elif hat == Hat.RED:
        return Perspective(
            hat=hat,
            round_num=round_num,
            key_points=[
                f"对这个决定的直觉感受",
                f"潜在的情绪信号"
            ],
            concerns=["不确定性带来的焦虑"],
            score=6.5
        )
    elif hat == Hat.BLACK:
        return Perspective(
            hat=hat,
            round_num=round_num,
            key_points=[
                "可能的风险点1",
                "可能的风险点2",
                "最坏情况的评估"
            ],
            concerns=["执行难度"],
            score=5.5
        )
    elif hat == Hat.YELLOW:
        return Perspective(
            hat=hat,
            round_num=round_num,
            key_points=[
                "潜在的价值1",
                "潜在的机会",
                "积极的影响"
            ],
            suggestions=["可以考虑尝试"],
            score=7.5
        )
    elif hat == Hat.GREEN:
        return Perspective(
            hat=hat,
            round_num=round_num,
            key_points=[
                "创新方案A",
                "替代路径",
                "新视角"
            ],
            score=7.0
        )
    else:  # Blue
        return Perspective(
            hat=hat,
            round_num=round_num,
            key_points=[
                "各方观点总结",
                "共识点",
                "待解决问题"
            ],
            score=6.0
        )

def analyze_debate(round1: DebateRound, round2: DebateRound) -> Tuple[List, List]:
    """分析辩论中的对抗和结盟"""
    confrontations = []
    alliances = []

    # 简化：基于帽子的天然对立关系
    # 黑帽 vs 黄帽：天然对抗
    # 红帽 vs 白帽：情感 vs 事实
    # 绿帽 vs 黑帽：创意 vs 保守

    hat_names = {h.value.split()[1]: h for h in Hat}

    # 天然对抗关系
    natural_confrontations = [
        (Hat.BLACK, Hat.YELLOW),  # 风险 vs 价值
        (Hat.RED, Hat.WHITE),     # 情感 vs 事实
        (Hat.BLACK, Hat.GREEN),   # 保守 vs 创新
    ]

    # 天然结盟关系
    natural_alliances = [
        (Hat.WHITE, Hat.BLACK),   # 事实 + 风险
        (Hat.YELLOW, Hat.GREEN),  # 价值 + 创意
        (Hat.RED, Hat.YELLOW),    # 情感 + 乐观
    ]

    return natural_confrontations, natural_alliances

def run_three_round_debate(question: str, context: str = "") -> DecisionAnalysis:
    """运行三轮辩论"""

    rounds = []

    # 第1轮：初始观点
    round1 = DebateRound(
        round_num=1,
        perspectives=[generate_perspective(h, question, context, 1) for h in Hat]
    )
    rounds.append(round1)

    # 第2轮：辩论对抗
    round2 = DebateRound(
        round_num=2,
        perspectives=[generate_perspective(h, question, context, 2) for h in Hat],
        confrontations=[(Hat.BLACK, Hat.YELLOW), (Hat.RED, Hat.WHITE)],
        alliances=[(Hat.WHITE, Hat.BLACK)]
    )
    rounds.append(round2)

    # 第3轮：收敛结论
    round3 = DebateRound(
        round_num=3,
        perspectives=[generate_perspective(h, question, context, 3) for h in Hat]
    )
    rounds.append(round3)

    # 计算最终得分
    all_scores = []
    for r in rounds:
        for p in r.perspectives:
            all_scores.append(p.score)

    avg_score = sum(all_scores) / len(all_scores)

    # 基于分数给出建议
    if avg_score >= 7:
        recommendation = "建议执行该决策"
    elif avg_score >= 5:
        recommendation = "建议谨慎执行，需要进一步评估"
    else:
        recommendation = "建议暂缓执行，重新评估"

    # 关键洞察
    key_insights = [
        f"第1轮平均得分: {sum(p.score for p in round1.perspectives)/6:.1f}",
        f"第2轮平均得分: {sum(p.score for p in round2.perspectives)/6:.1f}",
        f"第3轮平均得分: {sum(p.score for p in round3.perspectives)/6:.1f}",
    ]

    return DecisionAnalysis(
        question=question,
        context=context,
        rounds=rounds,
        final_score=avg_score,
        recommendation=recommendation,
        key_insights=key_insights
    )
