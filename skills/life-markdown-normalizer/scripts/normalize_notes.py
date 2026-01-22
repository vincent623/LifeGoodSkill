#!/usr/bin/env python3
"""
笔记标准化脚本
- 统一命名为 YYYYMMDDHHmmss.md
- 添加/更新 YAML 元数据
"""

import os
import re
from datetime import datetime
from pathlib import Path
import yaml

# 工作目录 - 使用当前工作目录或命令行参数指定
NOTES_DIR = None  # 将在main函数中设置

def extract_yaml_frontmatter(content):
    """提取 YAML frontmatter（可能在文件任意位置）"""
    # 尝试匹配文件开头的YAML
    pattern = r'^---\s*\n(.*?)\n---\s*\n'
    match = re.match(pattern, content, re.DOTALL)
    if match:
        yaml_content = match.group(1)
        body = content[match.end():]
        try:
            metadata = yaml.safe_load(yaml_content)
            return metadata, body
        except:
            pass

    # 尝试在文件任意位置查找YAML
    pattern = r'\n---\s*\n(.*?)\n---\s*\n'
    match = re.search(pattern, content, re.DOTALL)
    if match:
        yaml_content = match.group(1)
        # 移除YAML块，保留其他内容
        body = content[:match.start()] + content[match.end():]
        try:
            metadata = yaml.safe_load(yaml_content)
            return metadata, body
        except:
            pass

    return {}, content

def generate_tags_from_content(title, content):
    """根据标题和内容生成3个标签"""
    tags = []
    text = title + ' ' + content[:500]  # 标题 + 前500字符

    # 关键词到标签的映射
    keyword_map = {
        'AI': ['AI', 'LLM', 'Claude', 'GPT', '大模型', '人工智能', '机器学习', 'Transformer'],
        '认知科学': ['认知', '学习', '记忆', '注意力', '思维', '心理', '大脑', '神经'],
        '产品设计': ['产品', '设计', 'UX', 'UI', '用户体验', '交互'],
        '商业': ['商业', '经济', '市场', '营销', '销售', '增长', 'GDP'],
        '管理': ['管理', '组织', '团队', '领导', '项目', '协作'],
        '技术': ['编程', '代码', '开发', '工程', '架构', 'Python', 'JavaScript', 'API'],
        '数据': ['数据', '分析', '可视化', '统计', '指标'],
        '教育': ['教育', '教学', '培训', '学校', '老师', '学生'],
        '社会': ['社会', '文化', '历史', '政治', '人文'],
        '哲学': ['哲学', '思考', '观点', '理论', '方法论'],
        '工具': ['工具', '软件', '应用', '平台', 'App'],
        '写作': ['写作', '文章', '笔记', '文档', '内容'],
    }

    # 匹配关键词
    for tag, keywords in keyword_map.items():
        if any(kw in text for kw in keywords):
            if tag not in tags:
                tags.append(tag)
                if len(tags) >= 3:
                    break

    # 如果还不够3个，补充默认标签
    default_tags = ['笔记', '知识管理', '思考', '学习', '总结']
    for tag in default_tags:
        if tag not in tags:
            tags.append(tag)
            if len(tags) >= 3:
                break

    return tags[:3]

def parse_timestamp_from_string(ts_str):
    """从字符串解析时间戳"""
    # 清理可能的异常字符
    ts_str = re.sub(r'[^\d]', '', str(ts_str))

    # 尝试多种格式和对应的长度
    formats = [
        ("%Y%m%d%H%M%S", 14),  # 20250401181743
        ("%Y%m%d%H%M", 12),    # 202504011817
        ("%Y%m%d", 8),         # 20250401
    ]

    for fmt, expected_len in formats:
        try:
            if len(ts_str) >= expected_len:
                return datetime.strptime(ts_str[:expected_len], fmt)
        except:
            continue
    return None

def get_file_timestamps(filepath, metadata):
    """获取文件的创建和修改时间"""
    created = None
    modified = None

    # 1. 优先从文件名提取时间戳（如果是时间戳格式）
    if re.match(r'^\d{14}', filepath.stem):
        created = parse_timestamp_from_string(filepath.stem[:14])

    # 2. 从YAML元数据提取
    if not created and metadata:
        date_created_str = metadata.get('date created') or metadata.get('date_created')
        if date_created_str:
            created = parse_timestamp_from_string(date_created_str)

    # 3. 从文件系统获取
    if not created:
        stat = os.stat(filepath)
        created = datetime.fromtimestamp(stat.st_birthtime)

    # 修改时间：优先YAML，然后文件系统
    if metadata:
        date_modified_str = metadata.get('date modified') or metadata.get('date_modified')
        if date_modified_str:
            modified = parse_timestamp_from_string(date_modified_str)

    if not modified:
        stat = os.stat(filepath)
        modified = datetime.fromtimestamp(stat.st_mtime)

    return created, modified

def format_timestamp(dt):
    """格式化时间戳为 YYYYMMDDHHmmss"""
    return dt.strftime("%Y%m%d%H%M%S")

def extract_title(filepath, metadata, body):
    """提取标题"""
    # 1. 优先从YAML元数据
    title = metadata.get('title', '')
    if title:
        return title

    # 2. 从内容第一个标题提取
    lines = body.strip().split('\n')
    for line in lines:
        if line.startswith('# '):
            return line[2:].strip()

    # 3. 使用文件名（如果不是时间戳）
    if not re.match(r'^\d{14}', filepath.stem):
        return filepath.stem

    # 4. 默认使用时间戳
    return f"笔记_{filepath.stem}"

def clean_body_content(body, title):
    """清理正文内容，移除所有一级标题行"""
    lines = body.strip().split('\n')
    cleaned_lines = []

    # 移除所有一级标题（因为会在生成时统一添加）
    for line in lines:
        # 跳过所有一级标题
        if line.strip().startswith('# ') and not line.strip().startswith('## '):
            continue
        cleaned_lines.append(line)

    return '\n'.join(cleaned_lines).strip()

def generate_file_content(metadata, body, title):
    """生成标准格式的文件内容"""
    # 清理正文
    cleaned_body = clean_body_content(body, title)

    # 生成YAML frontmatter
    yaml_content = f"""---
title: {metadata['title']}
date_created: {metadata['date_created']}
date_modified: {metadata['date_modified']}
tags: {metadata['tags']}
---

# {title}

{cleaned_body}
"""
    return yaml_content

def process_file(filepath):
    """处理单个文件"""
    print(f"处理: {filepath.name}")

    # 读取文件内容
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 提取现有元数据
    metadata, body = extract_yaml_frontmatter(content)

    # 获取文件时间戳
    created, modified = get_file_timestamps(filepath, metadata)

    # 提取标题
    title = extract_title(filepath, metadata, body)

    # 生成标签
    existing_tags = metadata.get('tags', [])
    if isinstance(existing_tags, list) and len(existing_tags) >= 3:
        tags = existing_tags[:3]
    else:
        tags = generate_tags_from_content(title, body)

    # 构建新的元数据
    new_metadata = {
        'title': title,
        'date_created': format_timestamp(created),
        'date_modified': format_timestamp(modified),
        'tags': tags
    }

    # 生成新的文件名（时间戳格式）
    new_filename = f"{format_timestamp(created)}.md"

    # 生成新的文件内容
    new_content = generate_file_content(new_metadata, body, title)

    return new_metadata, new_filename, new_content

def main():
    """主函数"""
    import sys
    global NOTES_DIR

    # 检查命令行参数
    if len(sys.argv) < 2:
        print("用法: python normalize_notes.py [--dry-run|--execute] [--dir PATH] [--limit N]")
        print("  --dry-run: 预览模式，不实际修改文件")
        print("  --execute: 执行模式，实际修改文件")
        print("  --dir PATH: 指定工作目录（默认为当前目录）")
        print("  --limit N: 只处理前N个文件（用于测试）")
        sys.exit(1)

    mode = sys.argv[1]
    limit = None
    work_dir = None

    # 解析命令行参数
    if '--limit' in sys.argv:
        limit_idx = sys.argv.index('--limit')
        if limit_idx + 1 < len(sys.argv):
            limit = int(sys.argv[limit_idx + 1])

    if '--dir' in sys.argv:
        dir_idx = sys.argv.index('--dir')
        if dir_idx + 1 < len(sys.argv):
            work_dir = sys.argv[dir_idx + 1]

    # 设置工作目录
    if work_dir:
        NOTES_DIR = Path(work_dir)
    else:
        NOTES_DIR = Path.cwd()

    print(f"工作目录: {NOTES_DIR}")

    # 获取所有 markdown 文件（排除特殊目录）
    md_files = []
    for f in NOTES_DIR.glob("*.md"):
        # 排除changelog目录和.claude目录中的文件
        if 'changelog' not in str(f) and '.claude' not in str(f):
            md_files.append(f)

    print(f"找到 {len(md_files)} 个笔记文件")

    if limit:
        md_files = md_files[:limit]
        print(f"限制处理前 {limit} 个文件")

    print(f"\n模式: {mode}")
    print("=" * 60)

    # 处理每个文件
    processed = 0
    errors = 0
    rename_log = []  # 记录文件重命名信息

    for filepath in md_files:
        try:
            metadata, new_filename, new_content = process_file(filepath)
            print(f"  标题: {metadata['title']}")
            print(f"  标签: {metadata['tags']}")
            print(f"  原文件名: {filepath.name}")
            print(f"  新文件名: {new_filename}")

            if mode == '--execute':
                # 实际执行文件更新
                new_filepath = filepath.parent / new_filename

                # 检查文件名冲突，如果冲突则添加序号
                if new_filepath != filepath and new_filepath.exists():
                    # 生成带序号的文件名
                    base_name = new_filename[:-3]  # 移除 .md
                    counter = 1
                    while new_filepath.exists():
                        new_filename = f"{base_name}_{counter}.md"
                        new_filepath = filepath.parent / new_filename
                        counter += 1
                    print(f"  ⚠️  文件名冲突，使用: {new_filename}")

                # 写入新内容
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)

                # 如果需要重命名
                if filepath.name != new_filename:
                    # 记录重命名信息
                    rename_log.append({
                        'old_name': filepath.name,
                        'new_name': new_filename,
                        'title': metadata['title'],
                        'date': metadata['date_created']
                    })
                    filepath.rename(new_filepath)
                    print(f"  ✅ 已更新并重命名")
                else:
                    print(f"  ✅ 已更新")

                processed += 1
            else:
                print(f"  [预览模式，未实际修改]")
                processed += 1

            print()
        except Exception as e:
            print(f"  ❌ 错误: {e}")
            print()
            errors += 1

    print("=" * 60)
    print(f"处理完成: {processed} 个文件")
    if errors > 0:
        print(f"错误: {errors} 个文件")

    # 生成文件名变更清单
    if mode == '--execute' and rename_log:
        changelog_dir = NOTES_DIR / 'changelog'
        changelog_dir.mkdir(exist_ok=True)

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        changelog_file = changelog_dir / f'文件名变更清单_{timestamp}.md'

        with open(changelog_file, 'w', encoding='utf-8') as f:
            f.write(f"# 文件名变更清单\n\n")
            f.write(f"**生成时间**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write(f"**变更数量**: {len(rename_log)} 个文件\n\n")
            f.write("---\n\n")
            f.write("## 变更列表\n\n")
            f.write("| 原文件名 | 新文件名 | 标题 | 创建时间 |\n")
            f.write("|---------|---------|------|----------|\n")

            for item in rename_log:
                f.write(f"| {item['old_name']} | {item['new_name']} | {item['title']} | {item['date']} |\n")

        print(f"\n✅ 文件名变更清单已生成: {changelog_file}")
        print(f"   共记录 {len(rename_log)} 个文件的重命名操作")

if __name__ == "__main__":
    main()
