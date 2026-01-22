#!/usr/bin/env python3
"""
Problem Decomposition Engine
"""
from dataclasses import dataclass, field
from typing import List, Dict, Tuple
import re

@dataclass
class Task:
    id: str
    name: str
    phase: str
    priority: int  # 1-5, 1=highest
    effort_hours: float
    dependencies: List[str] = field(default_factory=list)
    description: str = ""
    risk_level: str = "low"  # low, medium, high

@dataclass
class Phase:
    name: str
    order: int
    tasks: List[Task] = field(default_factory=list)
    duration_days: float = 0

# 通用问题类型模板
PROBLEM_TEMPLATES = {
    "用户增长": {
        "诊断": ["数据分析 - 找到流失节点", "用户访谈 - 了解流失原因", "竞品分析 - 寻找差距", "指标拆解 - 定位问题"],
        "方案": ["头脑风暴 - 提出假设", "优先级排序 - 选择高ROI", "方案设计 - 制定策略", "资源评估 - 所需支持"],
        "实施": ["MVP设计 - 快速验证", "开发实现 - 功能上线", "A/B测试 - 数据对比", "迭代优化 - 持续改进"],
        "验证": ["效果评估 - 达成确认", "复盘总结 - 经验沉淀", "规模化推广 - 复制成功"]
    },
    "产品问题": {
        "调研": ["用户研究 - 需求挖掘", "数据分析 - 行为洞察", "竞品调研 - 市场定位", "需求评审 - 优先级排期"],
        "设计": ["原型设计 - 交互流程", "PRD撰写 - 详细说明", "设计评审 - 团队对齐", "设计迭代 - 持续优化"],
        "开发": ["技术评审 - 方案确定", "开发实现 - 功能开发", "测试验证 - 质量保障", "上线发布 - 灰度策略"],
        "运营": ["推广策略 - 用户获取", "运营活动 - 活跃提升", "数据监控 - 效果跟踪", "用户反馈 - 问题修复"]
    },
    "组织问题": {
        "诊断": ["现状评估 - 差距识别", "人员盘点 - 能力地图", "流程梳理 - 效率分析", "文化调研 - 氛围了解"],
        "规划": ["目标设定 - 方向对齐", "架构设计 - 组织调整", "人才规划 - 招聘需求", "制度建立 - 规则制定"],
        "执行": ["沟通机制 - 信息透明", "激励机制 - 绩效设计", "培训发展 - 能力提升", "变革管理 - 平稳过渡"],
        "评估": ["效果验证 - 目标达成", "持续改进 - 迭代优化", "经验沉淀 - 最佳实践"]
    },
    "技术问题": {
        "诊断": ["日志分析 - 定位问题", "性能分析 - 瓶颈识别", "代码审查 - 问题发现", "监控告警 - 异常发现"],
        "方案": ["技术选型 - 方案对比", "架构设计 - 方案制定", "风险评估 - 影响分析", "资源规划 - 团队分工"],
        "实施": ["代码开发 - 功能实现", "测试验证 - 质量保障", "部署上线 - 灰度发布", "文档编写 - 知识沉淀"],
        "运维": ["监控告警 - 实时跟踪", "应急响应 - 快速恢复", "容量规划 - 扩展准备", "优化迭代 - 持续改进"]
    },
    "default": {
        "分析": ["信息收集 - 全面了解", "问题拆解 - 结构化", "根因分析 - 找到本质", "目标设定 - 明确方向"],
        "方案": ["方案设计 - 多个选项", "可行性分析 - 评估利弊", "决策选择 - 最佳方案", "资源准备 - 保障支持"],
        "执行": ["计划制定 - 详细排期", "任务分配 - 责任到人", "进度跟踪 - 及时调整", "问题解决 - 扫除障碍"],
        "收尾": ["结果验收 - 质量把控", "复盘总结 - 经验沉淀", "文档归档 - 知识留存", "庆祝分享 - 团队激励"]
    }
}

# 难度/工时估算系数
EFFORT_RULES = {
    "数据分析": (3, 8),  # (min, max) hours
    "用户访谈": (4, 8),
    "竞品分析": (4, 8),
    "头脑风暴": (2, 4),
    "原型设计": (8, 16),
    "开发实现": (8, 40),
    "测试验证": (4, 16),
    "上线发布": (2, 4),
    "评估复盘": (2, 4),
}

# 优先级映射
PRIORITY_KEYWORDS = {
    1: ["必须", "关键", "核心", "阻塞", "紧急"],
    2: ["重要", "主要", "优先", "尽快"],
    3: ["常规", "正常", "标准"],
    4: ["次要", "可以", "稍后"],
    5: ["锦上添花", "可延迟", "nice to have"]
}

def detect_problem_type(text: str) -> str:
    """检测问题类型"""
    text_lower = text.lower()

    type_keywords = {
        "用户增长": ["增长", "用户", "留存", "活跃", "转化", "获客"],
        "产品问题": ["产品", "功能", "需求", "设计", "体验"],
        "组织问题": ["团队", "组织", "人员", "管理", "文化", "绩效"],
        "技术问题": ["技术", "性能", "系统", "架构", "代码", "bug", "故障"]
    }

    for ptype, keywords in type_keywords.items():
        if any(kw in text_lower for kw in keywords):
            return ptype

    return "default"

def decompose_problem(problem: str) -> List[Phase]:
    """将问题分解为阶段和任务"""
    problem_type = detect_problem_type(problem)
    template = PROBLEM_TEMPLATES.get(problem_type, PROBLEM_TEMPLATES["default"])

    phases = []
    phase_order = 1

    for phase_name, tasks in template.items():
        phase = Phase(name=phase_name, order=phase_order)

        for i, task_name in enumerate(tasks):
            # 估算工时
            effort = estimate_effort(task_name)

            # 确定优先级
            priority = determine_priority(task_name, i, len(tasks))

            # 添加风险
            risk = "medium" if priority <= 2 else "low"
            if any(kw in task_name for kw in ["上线", "发布", "部署"]):
                risk = "high"

            task = Task(
                id=f"{phase_order}.{i+1}",
                name=task_name,
                phase=phase_name,
                priority=priority,
                effort_hours=effort,
                dependencies=[],
                description=f"执行{task_name}任务",
                risk_level=risk
            )

            # 添加依赖（同一阶段的前置任务）
            if i > 0:
                task.dependencies.append(f"{phase_order}.{i}")

            phase.tasks.append(task)

        phase.duration_days = sum(t.effort_hours for t in phase.tasks) / 8
        phases.append(phase)
        phase_order += 1

    return phases

def estimate_effort(task_name: str) -> float:
    """估算任务工时"""
    task_lower = task_name.lower()

    for category, (min_h, max_h) in EFFORT_RULES.items():
        if category in task_lower:
            return (min_h + max_h) / 2

    # 默认工时
    if "分析" in task_name or "研究" in task_name:
        return 6
    elif "设计" in task_name or "规划" in task_name:
        return 8
    elif "开发" in task_name or "实现" in task_name:
        return 16
    elif "测试" in task_name or "验证" in task_name:
        return 8
    elif "访谈" in task_name or "调研" in task_name:
        return 6
    else:
        return 4

def determine_priority(task_name: str, index: int, total: int) -> int:
    """确定任务优先级"""
    task_lower = task_name.lower()

    for prio, keywords in PRIORITY_KEYWORDS.items():
        if any(kw in task_lower for kw in keywords):
            return prio

    # 前序任务优先级高
    if index < total // 3:
        return 2
    elif index > 2 * total // 3:
        return 4
    else:
        return 3

def extract_context(text: str) -> Dict:
    """提取问题上下文"""
    return {
        "problem": text,
        "type": detect_problem_type(text),
        "length": len(text)
    }
