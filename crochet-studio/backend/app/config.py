import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = os.getenv("DATABASE_URL", "sqlite:///./dev.db")
    secret_key: str = os.getenv("SECRET_KEY", "please-change-this-secret-key")
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24 * 7  # 7 days
    upload_dir: str = os.getenv("UPLOAD_DIR", os.path.join(os.path.dirname(__file__), "uploads"))
    cors_origins_raw: str = os.getenv("CORS_ORIGINS", "*")

    @property
    def cors_origins(self):
        if self.cors_origins_raw == "*":
            return ["*"]
        return [o.strip() for o in self.cors_origins_raw.split(",") if o.strip()]

    class Config:
        env_file = ".env"


settings = Settings()
os.makedirs(settings.upload_dir, exist_ok=True)
