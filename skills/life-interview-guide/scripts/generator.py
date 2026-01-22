#!/usr/bin/env python3
"""
Interview Question Generator
"""
from typing import List, Dict
from dataclasses import dataclass

@dataclass
class InterviewQuestion:
    category: str
    priority: int
    question: str
    type: str  # behavioral, technical, situational
    tip: str

# 问题模板库
QUESTION_TEMPLATES = {
    "技术技能": [
        ("请描述一次你使用{skill}解决复杂问题的经历", "behavioral", "使用STAR法则：情境-任务-行动-结果"),
        ("如果让你现在用{skill}设计一个{scenario}，你会怎么做？", "technical", "展示系统思维和架构能力"),
        ("{skill}的最佳实践是什么？你是如何应用的？", "technical", "体现深度理解和实践经验"),
    ],
    "沟通能力": [
        ("请描述一次你需要说服团队接受你观点的经历", "behavioral", "展示影响力和沟通技巧"),
        ("如何向非技术背景的人解释{technical_topic}？", "situational", "测试简化复杂概念的能力"),
        ("收到负面反馈时，你如何处理？", "behavioral", "展示成熟度和接受反馈的能力"),
    ],
    "领导力": [
        ("描述一次你带领团队完成挑战的经历", "behavioral", "突出领导风格和团队管理"),
        ("团队成员表现不佳时，你会怎么做？", "situational", "展示管理技巧和同理心"),
        ("如何在资源有限的情况下完成项目？", "situational", "展示优先级管理和创造力"),
    ],
    "项目管理": [
     ("项目延期时，你如何处理？", "behavioral", "展示风险管理和应变能力"),
        ("如何确保项目质量同时按时交付？", "technical", "平衡质量和效率"),
        ("同时处理多个项目时，如何分配优先级？", "situational", "展示优先级管理能力"),
    ],
    "数据分析": [
        ("如何用数据说服团队改变方向？", "behavioral", "展示数据驱动决策能力"),
        ("发现数据异常时，你会怎么做？", "technical", "展示问题诊断能力"),
        ("如何将数据洞察转化为业务行动？", "situational", "展示商业思维"),
    ],
    "产品思维": [
        ("如何平衡用户需求和业务目标？", "situational", "展示产品思维和权衡能力"),
        ("描述一次你推动产品改进的经历", "behavioral", "展示主动性和用户导向"),
        ("如何判断一个功能是否值得做？", "technical", "展示价值评估能力"),
    ],
    "问题解决": [
     ("遇到从未见过的问题，你会怎么解决？", "situational", "展示问题解决框架和方法论"),
        ("描述一次你创新解决某个问题的经历", "behavioral", "展示创造力和执行力"),
        ("何时知道问题已经解决了？", "technical", "展示验证和问题闭环思维"),
    ],
    "商业意识": [
        ("如何理解公司的商业模式？", "situational", "展示对业务的理解深度"),
        ("你的工作如何影响公司收入？", "situational", "展示商业连接意识"),
        ("如何衡量工作的商业价值？", "technical", "展示价值导向思维"),
    ]
}

def generate_questions(gaps: List, achievements: List[str]) -> List[InterviewQuestion]:
    """根据差距生成面试题"""
    questions = []

    for gap in gaps[:5]:  # 取前5个差距
        skill = gap.skill
        templates = QUESTION_TEMPLATES.get(skill, QUESTION_TEMPLATES["问题解决"])

        for i, (q_template, q_type, tip) in enumerate(templates):
            questions.append(InterviewQuestion(
                category=skill,
                priority=gap.priority,
                question=q_template,
                type=q_type,
                tip=tip
            ))

    return questions

def generate_star_tips(achievements: List[str]) -> List[str]:
    """根据简历成就生成STAR提示"""
    tips = []

    if achievements:
        tips.append(f"从你的简历中看到：{achievements[0][:50]}... 可作为STAR示例")

    tips.extend([
        "S (Situation): 描述具体情境和背景",
        "T (Task): 说明你的任务和职责",
        "A (Action): 详细说明你采取的行动",
        "R (Result): 用数据和成果量化结果"
    ])

    return tips
