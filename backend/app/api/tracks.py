from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_db
from app.models import Track

router = APIRouter(prefix="/tracks", tags=["tracks"])

MEDIA_TYPES = {
    ".mp3": "audio/mpeg",
    ".wav": "audio/wav",
    ".flac": "audio/flac",
    ".m4a": "audio/mp4",
    ".ogg": "audio/ogg",
}


@router.get("/{track_id}/stream")
async def stream_track(
    track_id: int, db: AsyncSession = Depends(get_db)
) -> FileResponse:
    track = await db.get(Track, track_id)
    if track is None:
        raise HTTPException(status_code=404, detail="曲目不存在")

    media_root = settings.media_root.resolve()
    media_path = (media_root / track.audio_path).resolve()
    if not media_path.is_relative_to(media_root) or not media_path.is_file():
        raise HTTPException(status_code=404, detail="音频文件不存在")

    return FileResponse(
        media_path,
        media_type=MEDIA_TYPES.get(
            Path(track.audio_path).suffix.lower(), "application/octet-stream"
        ),
        filename=Path(track.audio_path).name,
    )
