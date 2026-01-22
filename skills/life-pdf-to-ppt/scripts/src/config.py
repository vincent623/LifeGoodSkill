"""配置管理模块"""
import os
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

# API 配置
API_KEY = os.getenv("OPENROUTER_API_KEY")
MODEL_NAME = os.getenv("MODEL_NAME", "google/gemini-3-pro-preview")
MAX_WORKERS = int(os.getenv("MAX_WORKERS", "3"))

# 验证 API Key
if not API_KEY:
    raise ValueError("❌ 未找到 API Key，请在 .env 文件中配置 OPENROUTER_API_KEY")
