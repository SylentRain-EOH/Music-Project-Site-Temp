"""应用配置：从环境变量或 backend/.env 读取。"""

from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    """数据库、媒体目录与 CORS 配置。"""

    app_name: str = "Soul Searching API"
    database_url: str = (
        "postgresql+psycopg://postgres:postgres@localhost:5432/soulsearching"
    )
    media_root: Path = BASE_DIR / "media"
    cors_origins: list[str] = ["http://localhost:3000"]

    model_config = SettingsConfigDict(
        env_file=BASE_DIR / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
