"""应用配置：从环境变量或 backend/.env 读取。"""

import logging
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

logger = logging.getLogger("uvicorn.error")

BASE_DIR = Path(__file__).resolve().parent.parent

# 开发默认值：生产环境（APP_ENV=production）下使用它们会拒绝启动。
DEFAULT_SECRET_KEY = "dev-secret-change-me"
DEFAULT_ADMIN_USERNAME = "admin"
DEFAULT_ADMIN_PASSWORD = "admin"


class Settings(BaseSettings):
    """数据库、媒体目录与 CORS 配置。"""

    app_name: str = "Soul Searching API"
    # 运行环境：development（默认）或 production。
    app_env: str = "development"
    database_url: str = (
        "postgresql+psycopg://postgres:postgres@localhost:5432/soulsearching"
    )
    media_root: Path = BASE_DIR / "media"
    # 上传文件大小上限，防止误传或恶意上传耗尽磁盘。
    max_upload_mb: int = 512
    cors_origins: list[str] = ["http://localhost:3000"]
    secret_key: str = DEFAULT_SECRET_KEY
    admin_username: str = DEFAULT_ADMIN_USERNAME
    admin_password: str = DEFAULT_ADMIN_PASSWORD

    model_config = SettingsConfigDict(
        env_file=BASE_DIR / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


def validate_security_settings(settings: Settings) -> None:
    """启动时校验默认密钥与默认账号：生产环境拒绝启动，开发环境输出告警。"""
    if settings.app_env == "production":
        if settings.secret_key == DEFAULT_SECRET_KEY:
            raise RuntimeError(
                "SECRET_KEY 仍为默认值，拒绝启动；"
                "请在 backend/.env 中设置随机 SECRET_KEY"
            )
        if (
            settings.admin_username == DEFAULT_ADMIN_USERNAME
            or settings.admin_password == DEFAULT_ADMIN_PASSWORD
        ):
            raise RuntimeError(
                "ADMIN_USERNAME/ADMIN_PASSWORD 仍为默认值，拒绝启动；"
                "请在 backend/.env 中修改管理账号"
            )
    else:
        if settings.secret_key == DEFAULT_SECRET_KEY:
            logger.warning(
                "SECRET_KEY 使用开发默认值（会话可被伪造），仅供本地开发；"
                "生产部署请设置 APP_ENV=production 并修改 SECRET_KEY"
            )
        if (
            settings.admin_username == DEFAULT_ADMIN_USERNAME
            and settings.admin_password == DEFAULT_ADMIN_PASSWORD
        ):
            logger.warning(
                "管理账号使用开发默认值 admin/admin，仅供本地开发；"
                "生产部署请设置 APP_ENV=production 并修改账号密码"
            )


settings = Settings()
