#!/usr/bin/env python3
"""
Interview Guide - Gap Analysis Engine
"""
from pathlib import Path
import re
from dataclasses import dataclass, field
from typing import List, Dict, Tuple

@dataclass
class SkillGap:
    skill: str
    required_level: float  # 1-10
    candidate_level: float  # 1-10
    gap: float
    priority: int  # 1-5, 1=highest

@dataclass
class Experience:
    company: str
    role: str
    duration: str
    achievements: List[str] = field(default_factory=list)

# 技能关键词映射
SKILL_CATEGORIES = {
    "技术技能": ["python", "java", "javascript", "react", "node", "sql", "aws", "docker", "kubernetes", "api", "架构", "算法", "开发", "编程"],
    "沟通能力": ["沟通", "演讲", "汇报", "协作", "跨部门", " stakeholder", "客户"],
    "领导力": ["管理", "领导", "团队", "指导", "决策", "负责人", "带领"],
    "项目管理": ["项目", "敏捷", "scrum", "计划", "交付", "里程碑", "风险"],
    "数据分析": ["分析", "数据", "指标", "洞察", "可视化", "报表", "bi"],
    "产品思维": ["产品", "用户", "需求", "迭代", "上线", "体验"],
    "问题解决": ["问题", "解决", "优化", "改进", "创新", "突破"],
    "商业意识": ["业务", "收入", "增长", "市场", "竞争", "盈利", "kpi"]
}

# 职位级别要求
LEVEL_REQUIREMENTS = {
    "初级": 4,
    "中级": 6,
    "高级": 8,
    "专家": 9,
    "管理": 7
}

def extract_skills(text: str) -> Dict[str, float]:
    """从文本中提取技能及熟练度"""
    skills = {}
    text_lower = text.lower()

    for category, keywords in SKILL_CATEGORIES.items():
        count = 0
        matched = []
        for kw in keywords:
            if kw.lower() in text_lower:
                count += 1
                matched.append(kw)

        if count > 0:
            # 基于出现次数估算熟练度
            level = min(10, 4 + count * 0.5)
            skills[category] = level

    return skills

def extract_experience(text: str) -> List[Experience]:
    """从简历中提取经历"""
    experiences = []

    # 简单模式匹配
    patterns = [
        (r"(\d{4}[-–]\d{4})\s*(.*?公司)", "company"),
        (r"(.*?公司)\s*(\d{4}[-–]\d{4})", "company"),
    ]

    # 简化处理：提取带数字的行作为时间线
    lines = text.split("\n")
    current_exp = None

    for line in lines:
        if re.search(r"\d{4}", line):
            # 尝试提取公司名
            company_match = re.search(r"([^\n]+公司[^\n]*)", line)
            if company_match:
                current_exp = Experience(
                    company=company_match.group(1),
                    role="待识别",
                    duration=re.search(r"\d{4}[-–]\d{4}", line).group() if re.search(r"\d{4}[-–]\d{4}", line) else ""
                )
                experiences.append(current_exp)

    return experiences

def extract_achievements(text: str) -> List[str]:
    """提取成就描述"""
    achievements = []
    lines = text.split("\n")

    for line in lines:
        # 匹配成就关键词
        if any(kw in line for kw in ["完成", "实现", "提升", "增长", "带领", "负责", "主导"]):
            achievements.append(line.strip())

    return achievements

def analyze_gaps(resume_skills: Dict[str, float], job_skills: Dict[str, float]) -> List[SkillGap]:
    """分析技能差距"""
    gaps = []
    priority = 1

    # 分析每个职位要求的技能
    for skill, required_level in job_skills.items():
        candidate_level = resume_skills.get(skill, 0)
        gap = required_level - candidate_level

        if gap > 0:  # 只关注有差距的
            gaps.append(SkillGap(
                skill=skill,
                required_level=required_level,
                candidate_level=candidate_level,
                gap=gap,
                priority=min(5, priority)
            ))
            priority += 1

    # 按差距大小排序
    gaps.sort(key=lambda x: x.gap, reverse=True)

    # 重新分配优先级
    for i, gap in enumerate(gaps):
        gap.priority = min(5, i + 1)

    return gaps

def detect_level_from_jd(text: str) -> str:
    """从职位描述检测级别要求"""
    text_lower = text.lower()

    if any(kw in text_lower for kw in ["10年", "资深专家", "架构师", "principal"]):
        return "专家"
    elif any(kw in text_lower for kw in ["5年", "高级", "senior", "lead"]):
        return "高级"
    elif any(kw in text_lower for kw in ["3年", "中级", "middle"]):
        return "中级"
    elif any(kw in text_lower for kw in ["1年", "初级", "junior", "应届"]):
        return "初级"
    else:
        return "中级"  # 默认

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
