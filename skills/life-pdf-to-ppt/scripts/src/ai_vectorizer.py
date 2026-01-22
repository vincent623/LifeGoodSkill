"""AI 矢量化模块"""
import base64
import time
from openai import OpenAI
from .config import API_KEY, MODEL_NAME


# 初始化 OpenRouter 客户端
client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=API_KEY,
)


def convert_image_to_svg(image_path, page_num, max_retries=3):
    """步骤 2: 调用 AI 将图片重绘为 SVG"""
    print(f"🤖 [2/5] 正在 AI 矢量化处理第 {page_num} 页 (Model: {MODEL_NAME})...")

    with open(image_path, "rb") as image_file:
        base64_image = base64.b64encode(image_file.read()).decode("utf-8")

    prompt = "转换成SVG，要求一模一样，不用解释，直接输出SVG代码。使用 <text> 标签来渲染文字，字体请使用通用的 sans-serif。不要包含 markdown 标记（如 ```xml），只返回纯代码。"

    for attempt in range(1, max_retries + 1):
        try:
            response = client.chat.completions.create(
                model=MODEL_NAME,
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": prompt},
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/png;base64,{base64_image}"
                                },
                            },
                        ],
                    }
                ],
            )

            # 检查返回内容是否有效
            if response and response.choices and len(response.choices) > 0:
                content = response.choices[0].message.content
                if content:
                    return content
                else:
                    raise ValueError("AI 返回内容为空")
            else:
                raise ValueError("AI 响应格式无效")

        except Exception as e:
            if attempt < max_retries:
                print(
                    f"    ⚠️ 第 {page_num} 页处理失败 (尝试 {attempt}/{max_retries}): {e}"
                )
                print(f"    🔄 {2 ** attempt} 秒后重试...")
                time.sleep(2**attempt)  # 指数退避：2秒、4秒、8秒
            else:
                print(f"    ❌ 第 {page_num} 页处理失败 (已重试 {max_retries} 次): {e}")
                return None

    return None
