#!/usr/bin/env python3
import json
import re
from datetime import timedelta
from pathlib import Path

class BatchSlicer:
    def __init__(self):
        pass

    def parse_time(self, time_str):
        pattern = r'(\d{2}):(\d{2}):(\d{2}),(\d{3})'
        match = re.match(pattern, time_str.strip())
        if not match:
            raise ValueError(f"Invalid time: {time_str}")
        h, m, s, ms = map(int, match.groups())
        return h * 3600 + m * 60 + s + ms / 1000

    def format_time(self, seconds):
        td = timedelta(seconds=seconds)
        total = int(td.total_seconds())
        h = total // 3600
        m = (total % 3600) // 60
        s = total % 60
        return f"{h:02d}:{m:02d}:{s:02d}"

    def parse_file(self, file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        segments = []
        paragraphs = content.split('\n\n')

        for para in paragraphs:
            if not para.strip():
                continue
            lines = para.strip().split('\n')
            timestamp = None
            text_lines = []

            for line in lines:
                line = line.strip()
                if line.startswith('##'):
                    continue
                if '-->' in line:
                    timestamp = line
                elif line and not line.startswith('##'):
                    text_lines.append(line)

            if timestamp and text_lines:
                try:
                    start_str, end_str = timestamp.split('-->')
                    start_time = self.parse_time(start_str)
                    end_time = self.parse_time(end_str)
                    text = ' '.join(text_lines)
                    segments.append({
                        'start_time': start_time,
                        'end_time': end_time,
                        'text': text
                    })
                except ValueError:
                    continue

        video_title = Path(file_path).stem
        return segments, video_title

    def create_slices(self, segments, video_title, source_file):
        if not segments:
            return {}

        total_duration = int(segments[-1]['end_time'])
        
        # Always create 6 slices for good granularity
        slice_count = 6
        slice_duration = total_duration // slice_count

        slices = []
        for i in range(slice_count):
            start_time = i * slice_duration
            end_time = min((i + 1) * slice_duration, total_duration)

            slice_texts = []
            for seg in segments:
                if start_time <= seg['start_time'] <= end_time or start_time <= seg['end_time'] <= end_time:
                    slice_texts.append(seg['text'])

            combined_text = ' '.join(slice_texts)[:800] if slice_texts else ""

            # Enhanced keyword extraction
            keywords = []
            if any(word in combined_text for word in ['计算', '公式', '算法', '求解']):
                keywords.append('计算方法')
            if any(word in combined_text for word in ['概念', '定义', '含义']):
                keywords.append('基本概念')
            if any(word in combined_text for word in ['案例', '例题', '应用']):
                keywords.append('案例分析')
            if any(word in combined_text for word in ['总结', '回顾', '要点']):
                keywords.append('知识点总结')
            if any(word in combined_text for word in ['背景', '导入', '导学']):
                keywords.append('背景导入')

            if not keywords:
                keywords = [f"核心知识点{i+1}"]

            # Determine knowledge type
            if any(word in combined_text for word in ['计算', '公式', '算法']):
                knowledge_type = "计算方法"
            elif any(word in combined_text for word in ['案例', '例题', '应用']):
                knowledge_type = "案例分析"
            elif i == 0:
                knowledge_type = "章节导学"
            elif i == slice_count - 1:
                knowledge_type = "知识点总结"
            else:
                knowledge_type = "知识点讲解"

            # Generate slice name based on index
            slice_names = [
                f"{video_title} - 导学与背景",
                f"{video_title} - 基础概念",
                f"{video_title} - 计算方法",
                f"{video_title} - 实际应用",
                f"{video_title} - 深入分析",
                f"{video_title} - 总结回顾"
            ]
            slice_name = slice_names[i] if i < len(slice_names) else f"{video_title} - 第{i+1}部分"

            # Generate brief intro
            intros = [
                f"本片段介绍{video_title}的课程背景、学习目标和整体框架",
                f"本片段讲解{video_title}的基础概念和核心定义",
                f"本片段详细演示{video_title}的计算方法和公式应用",
                f"本片段通过实例展示{video_title}的实际应用",
                f"本片段深入分析{video_title}的难点和注意事项",
                f"本片段总结{video_title}的核心要点和关键知识点"
            ]
            brief_intro = intros[i] if i < len(intros) else f"本片段深入讲解{video_title}的第{i+1}部分核心内容"

            slices.append({
                "slice_id": i + 1,
                "slice_name": slice_name,
                "start_time_seconds": start_time,
                "end_time_seconds": end_time,
                "duration_seconds": end_time - start_time,
                "start_time_formatted": self.format_time(start_time),
                "end_time_formatted": self.format_time(end_time),
                "knowledge_type": knowledge_type,
                "key_keywords": keywords,
                "brief_intro": brief_intro
            })

        video_intro = f"本视频是关于{video_title}的教学内容，包含{slice_count}个知识点切片，系统讲解相关知识，适合系统学习和复习。"

        return {
            "source_file": source_file,
            "video_title": video_title,
            "total_duration_seconds": total_duration,
            "slice_count": slice_count,
            "video_intro": video_intro,
            "slices": slices
        }

    def is_subtitle_file(self, file_path):
        """Check if file is a subtitle file"""
        exclude_files = [
            'prompt.md', 'CLAUDE.md', 'README.md', 'LICENSE', 
            '.gitignore', '.env.example', 'config.py',
            'DEVELOPMENT_REPORT.md', 'PROJECT_SUMMARY.md', 
            'DEFAULT_CONFIG.md', 'SLICING_RESULTS.md'
        ]
        
        if file_path.name in exclude_files:
            return False
        
        if file_path.name.endswith('_slices.json') or file_path.name.endswith('_slices_simple.json') or file_path.name.endswith('_slices_final.json'):
            return False
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                if '-->' in f.read(1024):
                    return True
        except Exception:
            pass
        
        return False

    def process_file(self, file_path):
        file_path = Path(file_path)
        if not file_path.exists():
            print(f"Error: File not found - {file_path}")
            return False

        print(f"\n{'='*60}")
        print(f"Processing: {file_path.name}")
        print(f"{'='*60}")

        try:
            print("Parsing subtitle file...")
            segments, video_title = self.parse_file(str(file_path))
            print(f"  ✓ Parsed {len(segments)} segments")

            if not segments:
                print("  ✗ No valid segments found")
                return False

            total_duration = segments[-1]['end_time']
            print(f"  ✓ Total duration: {total_duration:.1f}s ({total_duration/60:.1f}min)")

            print("\nCreating 6 slices...")
            result = self.create_slices(segments, video_title, file_path.name)
            print(f"  ✓ Created {result['slice_count']} slices")

            print("\nSaving results...")
            output_dir = Path("slices_output_final")
            output_dir.mkdir(exist_ok=True)
            timestamp = "20251208_150000"
            output_file = output_dir / f"{video_title}_{timestamp}_slices_final.json"

            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(result, f, ensure_ascii=False, indent=2)

            print(f"  ✓ Saved: {output_file}")
            return True

        except Exception as e:
            print(f"  ✗ Failed: {e}")
            import traceback
            traceback.print_exc()
            return False

    def process_all(self):
        """Process all subtitle files in current directory"""
        print("\n" + "="*60)
        print("  Batch Subtitle Slicer")
        print("  Processing All Files")
        print("="*60 + "\n")
        
        # Get all .md files
        md_files = [f for f in Path('.').glob('*.md') if self.is_subtitle_file(f)]
        
        if not md_files:
            print("No subtitle files found!")
            return
        
        print(f"Found {len(md_files)} subtitle files\n")
        
        success = 0
        failed = 0
        
        for i, file_path in enumerate(md_files, 1):
            print(f"[{i}/{len(md_files)}] ", end="")
            if self.process_file(file_path):
                success += 1
            else:
                failed += 1
        
        print(f"\n{'='*60}")
        print(f"Batch Processing Complete!")
        print(f"{'='*60}")
        print(f"Success: {success} files")
        print(f"Failed: {failed} files")
        print(f"Total: {len(md_files)} files")
        print(f"\nOutput directory: slices_output_final/")
        print(f"View results: ls -lah slices_output_final/")
        print(f"{'='*60}\n")

if __name__ == "__main__":
    slicer = BatchSlicer()
    slicer.process_all()
