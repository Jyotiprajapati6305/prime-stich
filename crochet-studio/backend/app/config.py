from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # Database - change password and host as needed
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/crochet_studio"

    # JWT
    SECRET_KEY: str = "change-this-to-a-very-long-random-secret-key-in-production-please-1234567890"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # App
    APP_NAME: str = "Crochet Studio"
    DEBUG: bool = True
    UPLOAD_DIR: str = "app/uploads"

    # CORS
    FRONTEND_URL: str = "http://localhost:5173"

    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
