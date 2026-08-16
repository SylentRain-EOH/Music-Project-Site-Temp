"""上传接口：受 Basic Auth 保护，保存音频/封面/专辑 zip 并返回相对路径。"""

import hmac
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from fastapi.security import HTTPBasic, HTTPBasicCredentials

from app.config import settings

router = APIRouter(prefix="/uploads", tags=["uploads"])
security = HTTPBasic()

AUDIO_EXTENSIONS = {".mp3", ".wav", ".flac", ".m4a", ".ogg"}
COVER_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
DOWNLOAD_EXTENSIONS = {".zip"}


def require_admin(credentials: HTTPBasicCredentials = Depends(security)) -> None:
    """上传接口与后台共用同一组管理员账号。"""
    # 两项都做恒定时间比较，避免短路运算造成可观测的时序差异。
    username_valid = hmac.compare_digest(
        credentials.username, settings.admin_username
    )
    password_valid = hmac.compare_digest(
        credentials.password, settings.admin_password
    )
    if not username_valid or not password_valid:
        raise HTTPException(status_code=401, detail="用户名或密码错误")


def _save_upload(file: UploadFile, subdir: str, allowed: set[str]) -> str:
    """校验扩展名并写入 media 目录，返回相对路径。"""
    ext = Path(file.filename or "").suffix.lower()
    if ext not in allowed:
        raise HTTPException(status_code=400, detail=f"不支持的文件类型：{ext}")
    target_dir = settings.media_root / subdir
    target_dir.mkdir(parents=True, exist_ok=True)
    filename = f"{uuid.uuid4().hex}{ext}"
    target = target_dir / filename
    max_bytes = settings.max_upload_mb * 1024 * 1024
    written = 0
    with target.open("wb") as out:
        while chunk := file.file.read(1024 * 1024):
            written += len(chunk)
            if written > max_bytes:
                out.close()
                target.unlink(missing_ok=True)
                raise HTTPException(
                    status_code=413,
                    detail=f"文件超过大小限制（{settings.max_upload_mb} MB）",
                )
            out.write(chunk)
    return f"{subdir}/{filename}"


@router.post("/audio", dependencies=[Depends(require_admin)])
async def upload_audio(file: UploadFile = File(...)) -> dict[str, str]:
    """上传音频文件，返回可填入 tracks.audio_path 的路径。"""
    path = _save_upload(file, "audio", AUDIO_EXTENSIONS)
    return {"path": path, "url": f"/media/{path}"}


@router.post("/cover", dependencies=[Depends(require_admin)])
async def upload_cover(file: UploadFile = File(...)) -> dict[str, str]:
    """上传封面文件，返回可填入 albums.cover_path 的路径。"""
    path = _save_upload(file, "covers", COVER_EXTENSIONS)
    return {"path": path, "url": f"/media/{path}"}


@router.post("/download", dependencies=[Depends(require_admin)])
async def upload_download(file: UploadFile = File(...)) -> dict[str, str]:
    """上传专辑 zip 下载包，返回可填入 albums.download_path 的路径。"""
    path = _save_upload(file, "downloads", DOWNLOAD_EXTENSIONS)
    return {"path": path, "url": f"/media/{path}"}
