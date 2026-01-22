#!/usr/bin/env python3
"""
PDF Chart to Editable PPT Converter
将 PDF 图表通过 AI 矢量化转换为可编辑的 PowerPoint 演示文稿
"""
import os
import time
from src.batch_processor import process_single_pdf
from src.config import MAX_WORKERS, MODEL_NAME


def main():
    """批量处理 input 目录下的所有 PDF 文件"""
    INPUT_DIR = "input"
    OUTPUT_DIR = "output"

    # 确保输出目录存在
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)

    # 查找所有 PDF 文件
    pdf_files = sorted([f for f in os.listdir(INPUT_DIR) if f.lower().endswith(".pdf")])

    if not pdf_files:
        print(f"❌ 错误: {INPUT_DIR}/ 目录下未找到 PDF 文件，请放入文件。")
        return

    # 显示批量处理信息
    print("\n" + "=" * 60)
    print(f"🚀 PDF to Editable PPT Converter")
    print("=" * 60)
    print(f"📂 输入目录: {INPUT_DIR}/")
    print(f"📂 输出目录: {OUTPUT_DIR}/")
    print(f"📊 待处理文件: {len(pdf_files)} 个 PDF")
    print(f"⚙️  并发线程数: {MAX_WORKERS}")
    print(f"🤖 AI 模型: {MODEL_NAME}")
    print("=" * 60)

    total_start = time.time()
    success_count = 0
    fail_count = 0

    # 逐个处理 PDF
    for idx, pdf_file in enumerate(pdf_files, 1):
        pdf_path = os.path.join(INPUT_DIR, pdf_file)

        print(f"\n[{idx}/{len(pdf_files)}] 开始处理...")

        try:
            if process_single_pdf(pdf_path, OUTPUT_DIR):
                success_count += 1
            else:
                fail_count += 1
        except Exception as e:
            print(f"❌ 处理 {pdf_file} 时发生异常: {e}")
            fail_count += 1

    # 最终汇总报告
    total_duration = time.time() - total_start
    print("\n\n" + "=" * 60)
    print("📊 批量处理汇总报告")
    print("=" * 60)
    print(f"✅ 成功转换: {success_count} 个")
    print(f"❌ 失败: {fail_count} 个")
    print(f"⏱️  总耗时: {total_duration:.2f} 秒 ({total_duration/60:.1f} 分钟)")
    print(f"📁 输出目录: {OUTPUT_DIR}/")
    print("=" * 60)
    print("💡 提示: 打开 PPT 后，请对图片 [右键 -> 转换为形状] 以进行编辑。")
    print("\n✨ 所有任务完成！")


if __name__ == "__main__":
    main()
