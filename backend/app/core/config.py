import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PROJECT_NAME: str = "SRGEC Connect API"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "srgec_super_secret_key_change_me_in_production")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # SQLite fallback
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./srgec_connect.db")
    
    # Gemini API Key
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    
    # Uploads dir
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "./uploads")

settings = Settings()

# Ensure uploads directory exists
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
