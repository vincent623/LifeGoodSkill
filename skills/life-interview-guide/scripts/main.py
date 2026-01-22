#!/usr/bin/env python3
"""
Interview Guide Generator - Main Entry
Usage: python main.py -r <resume> -j <job-desc> [-o output.html]
"""
import sys
import json
from pathlib import Path
from datetime import datetime
from analyzer import extract_skills, analyze_gaps, detect_level_from_jd, read_files, extract_achievements
from generator import generate_questions, generate_star_tips

SKILL_DIR = Path(__file__).parent.parent

def generate_html_report(resume_text: str, jd_text: str, output_path: str, gaps=None, questions=None):
    """生成HTML面试指南报告"""

    # 分析
    if gaps is None:
        resume_skills = extract_skills(resume_text)
        job_skills = extract_skills(jd_text)

        # 检测职位级别
        level = detect_level_from_jd(jd_text)

        # 调整职位技能要求
        for skill in job_skills:
            if skill in ["技术技能", "领导力", "项目管理"]:
                job_skills[skill] = min(10, job_skills[skill] + 1)

        gaps = analyze_gaps(resume_skills, job_skills)

    if questions is None:
        achievements = extract_achievements(resume_text)
        questions = generate_questions(gaps, achievements)

    # 准备雷达图数据
    radar_items = ""
    for gap in gaps[:6]:
        bar_width = gap.required_level * 10
        cand_width = gap.candidate_level * 10
        gap_width = gap.gap * 10
        radar_items += f'''
        <div class="radar-item">
            <div class="radar-label">{gap.skill}</div>
            <div class="radar-bar-wrap">
                <div class="radar-bar radar-required" style="width:{bar_width}%"></div>
            </div>
            <div class="radar-bar-wrap">
                <div class="radar-bar radar-candidate" style="width:{cand_width}%"></div>
            </div>
            <div class="radar-value">{gap.gap:.1f}</div>
        </div>'''

    # 准备问题列表HTML
    question_items = ""
    for i, q in enumerate(questions[:15], 1):
        type_class = {"behavioral": "star", "technical": "tech", "situational": "sit"}[q.type]
        question_items += f'''
        <div class="question-item">
            <div class="q-header">
                <span class="q-priority">P{q.priority}</span>
                <span class="q-type {type_class}">{q.type}</span>
                <span class="q-category">{q.category}</span>
            </div>
            <div class="q-content">{q.question}</div>
            <div class="q-tip">💡 {q.tip}</div>
        </div>'''

    # 差距统计
    high_gap = len([g for g in gaps if g.gap >= 3])
    medium_gap = len([g for g in gaps if 1 <= g.gap < 3])

    html = f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>面试准备指南</title>
    <style>
    * {{ margin: 0; padding: 0; box-sizing: border-box; }}
    body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f7fa; padding: 20px; line-height: 1.6; }}
    .container {{ max-width: 900px; margin: 0 auto; }}
    h1 {{ text-align: center; color: #333; margin-bottom: 10px; }}
    .meta {{ text-align: center; color: #888; font-size: 14px; margin-bottom: 30px; }}
    .card {{ background: #fff; border-radius: 12px; padding: 24px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }}
    .card h2 {{ color: #444; font-size: 18px; margin-bottom: 16px; border-left: 4px solid #10b981; padding-left: 12px; }}
    .summary {{ background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #fff; }}
    .summary h2 {{ color: #fff; border-left-color: #fff; }}
    .summary p {{ font-size: 14px; opacity: 0.9; }}
    .stats {{ display: flex; gap: 20px; margin-top: 15px; }}
    .stat {{ text-align: center; }}
    .stat-num {{ font-size: 28px; font-weight: bold; }}
    .stat-label {{ font-size: 12px; opacity: 0.8; }}
    .radar-item {{ display: flex; align-items: center; gap: 10px; margin: 10px 0; }}
    .radar-label {{ width: 90px; font-size: 13px; text-align: right; flex-shrink: 0; }}
    .radar-bar-wrap {{ flex: 1; height: 18px; background: #f0f0f0; border-radius: 9px; overflow: hidden; }}
    .radar-bar {{ height: 100%; border-radius: 9px; }}
    .radar-required {{ background: linear-gradient(90deg, #f59e0b, #d97706); }}
    .radar-candidate {{ background: linear-gradient(90deg, #10b981, #059669); }}
    .radar-value {{ width: 40px; font-size: 12px; color: #ef4444; text-align: center; font-weight: bold; }}
    .legend {{ display: flex; gap: 20px; justify-content: center; margin-bottom: 15px; font-size: 12px; }}
    .legend-item {{ display: flex; align-items: center; gap: 6px; }}
    .legend-color {{ width: 16px; height: 10px; border-radius: 5px; }}
    .question-item {{ padding: 16px; background: #f8f9fa; border-radius: 10px; margin: 12px 0; border-left: 4px solid #6366f1; }}
    .q-header {{ display: flex; gap: 10px; align-items: center; margin-bottom: 10px; }}
    .q-priority {{ background: #ef4444; color: #fff; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }}
    .q-type {{ padding: 2px 8px; border-radius: 4px; font-size: 11px; text-transform: uppercase; }}
    .q-type.star {{ background: #dbeafe; color: #1d4ed8; }}
    .q-type.tech {{ background: #d1fae5; color: #059669; }}
    .q-type.sit {{ background: #fef3c7; color: #d97706; }}
    .q-category {{ color: #888; font-size: 12px; margin-left: auto; }}
    .q-content {{ font-size: 15px; color: #333; margin-bottom: 8px; }}
    .q-tip {{ font-size: 12px; color: #10b981; background: #ecfdf5; padding: 8px; border-radius: 6px; }}
    .timeline {{ display: flex; gap: 10px; margin-top: 15px; }}
    .timeline-item {{ flex: 1; text-align: center; padding: 15px 10px; background: #f0f9ff; border-radius: 8px; }}
    .timeline-day {{ font-size: 20px; font-weight: bold; color: #0ea5e9; }}
    .timeline-task {{ font-size: 12px; color: #555; margin-top: 5px; }}
    .star-tips {{ background: #fffbeb; border-left-color: #f59e0b; }}
    .star-tips h2 {{ color: #b45309; }}
    .star-tips ol {{ padding-left: 20px; color: #78350f; font-size: 14px; }}
    .gap-high {{ color: #ef4444; }}
    .gap-medium {{ color: #f59e0b; }}
    </style>
</head>
<body>
    <div class="container">
        <h1>面试准备指南</h1>
        <p class="meta">生成时间: {datetime.now().strftime('%Y-%m-%d %H:%M')}</p>

        <div class="card summary">
            <h2>差距分析摘要</h2>
            <p>共识别 {len(gaps)} 个技能差距需要准备</p>
            <div class="stats">
                <div class="stat">
                    <div class="stat-num">{high_gap}</div>
                    <div class="stat-label">高优先级</div>
                </div>
                <div class="stat">
                    <div class="stat-num">{medium_gap}</div>
                    <div class="stat-label">中优先级</div>
                </div>
                <div class="stat">
                    <div class="stat-num">{len(questions)}</div>
                    <div class="stat-label">面试问题</div>
                </div>
            </div>
        </div>

        <div class="card">
            <h2>技能差距雷达</h2>
            <div class="legend">
                <div class="legend-item"><span class="legend-color" style="background:linear-gradient(90deg, #f59e0b, #d97706)"></span>目标要求</div>
                <div class="legend-item"><span class="legend-color" style="background:linear-gradient(90deg, #10b981, #059669)"></span>当前水平</div>
                <div class="legend-item"><span class="legend-color" style="background:#ef4444"></span>差距值</div>
            </div>
            <div class="radar-chart">
                {radar_items if radar_items else '<p style="color:#888">未识别到明显技能差距</p>'}
            </div>
        </div>

        <div class="card">
            <h2>优先级面试问题</h2>
            <p style="font-size:12px;color:#888;margin-bottom:15px;">P1=最高优先级 | Star=行为题 Tech=技术题 Sit=情境题</p>
            {question_items if question_items else '<p style="color:#888">根据差距自动生成</p>'}
        </div>

        <div class="card">
            <h2>准备时间线</h2>
            <div class="timeline">
                <div class="timeline-item">
                    <div class="timeline-day">D-7</div>
                    <div class="timeline-task">梳理项目经历</div>
                </div>
                <div class="timeline-item">
                    <div class="timeline-day">D-5</div>
                    <div class="timeline-task">准备高优先级问题</div>
                </div>
                <div class="timeline-item">
                    <div class="timeline-day">D-3</div>
                    <div class="timeline-task">模拟面试练习</div>
                </div>
                <div class="timeline-item">
                    <div class="timeline-day">D-1</div>
                    <div class="timeline-task">放松休息</div>
                </div>
            </div>
        </div>

        <div class="card star-tips">
            <h2>STAR法则提示</h2>
            <ol>
                <li><strong>S</strong>ituation: 描述具体情境和背景</li>
                <li><strong>T</strong>ask: 说明你的任务和职责</li>
                <li><strong>A</strong>ction: 详细说明你采取的行动</li>
                <li><strong>R</strong>esult: 用数据和成果量化结果</li>
            </ol>
        </div>
    </div>
</body>
</html>"""

    Path(output_path).write_text(html)

def main():
    resumes = []
    jd_file = None
    output_file = "interview-guide.html"

    i = 1
    while i < len(sys.argv):
        if sys.argv[i] == "-r" and i + 1 < len(sys.argv):
            resumes.append(sys.argv[i + 1])
        elif sys.argv[i] == "-j" and i + 1 < len(sys.argv):
            jd_file = sys.argv[i + 1]
        elif sys.argv[i] == "-o" and i + 1 < len(sys.argv):
            output_file = sys.argv[i + 1]
        elif sys.argv[i] == "--sample":
            sample_resume = """## 工作经历

ABC公司 | 高级产品经理 | 2020-2023
- 负责核心产品迭代，用户增长50%
- 带领5人团队，完成多个重大功能上线
- 与技术团队协作，优化产品流程

XYZ公司 | 产品经理 | 2018-2020
- 实现用户留存提升20%
- 主导用户调研和产品规划
"""
            sample_jd = """
高级产品经理
要求：
- 5年以上产品经验
- 3年以上团队管理经验
- 具备数据分析能力
- 熟悉敏捷开发流程
- 优秀的沟通和跨部门协作能力
"""
            Path("sample-resume.md").write_text(sample_resume)
            Path("sample-jd.md").write_text(sample_jd)
            generate_html_report(sample_resume, sample_jd, "sample-interview-guide.html")
            print(f"示例报告: sample-interview-guide.html")
            return
        i += 1

    if not resumes:
        print("请提供简历: -r <resume-file>")
        print("请提供职位描述: -j <job-description-file>")
        print("示例: python main.py -r ./resume.md -j ./jd.md -o guide.html")
        return

    if not jd_file:
        print("请提供职位描述: -j <job-description-file>")
        return

    # 读取文件
    resume_text = ""
    for r in resumes:
        files = read_files(r)
        resume_text += "\n".join(files.values()) + "\n"

    jd_text = read_files(jd_file)
    jd_content = "\n".join(jd_text.values())

    if not resume_text.strip() or not jd_content.strip():
        print("未找到可读的文件内容")
        return

    # 生成报告
    generate_html_report(resume_text, jd_content, output_file)
    print(f"报告已生成: {output_file}")

if __name__ == "__main__":
    main()
