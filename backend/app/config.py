from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql://englishapp:changeme123@db:5432/english_learning"

    # Security
    SECRET_KEY: str = "your-secret-key-change-this-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:5173"]

    # LLM
    LLM_PROVIDER: str = "openai"  # or "claude"

    # OpenAI
    OPENAI_API_KEY: str = ""
    OPENAI_API_BASE: str = "https://api.openai.com/v1"
    OPENAI_MODEL: str = "gpt-4"

    # Claude
    CLAUDE_API_KEY: str = ""
    CLAUDE_API_BASE: str = "https://api.anthropic.com"
    CLAUDE_MODEL: str = "claude-3-5-sonnet-20241022"

    # TTS
    TTS_ENABLED: bool = True

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
