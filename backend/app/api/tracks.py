from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.config import settings
from app.database import get_db
from app.models import Credit, Track
from app.schemas import ArtistOut, CreditOut, TrackDetail

router = APIRouter(prefix="/tracks", tags=["tracks"])

MEDIA_TYPES = {
    ".mp3": "audio/mpeg",
    ".wav": "audio/wav",
    ".flac": "audio/flac",
    ".m4a": "audio/mp4",
    ".ogg": "audio/ogg",
}


@router.get("/{track_id}", response_model=TrackDetail)
async def get_track(track_id: int, db: AsyncSession = Depends(get_db)) -> TrackDetail:
    result = await db.execute(
        select(Track)
        .options(
            selectinload(Track.album),
            selectinload(Track.credits).selectinload(Credit.artist),
        )
        .where(Track.id == track_id)
    )
    track = result.scalar_one_or_none()
    if track is None:
        raise HTTPException(status_code=404, detail="曲目不存在")

    album = track.album
    return TrackDetail(
        id=track.id,
        album_id=album.id,
        album_title=album.title,
        album_slug=album.slug,
        cover_url=f"/media/{album.cover_path}" if album.cover_path else None,
        title=track.title,
        track_number=track.track_number,
        duration_seconds=track.duration_seconds,
        audio_url=f"/api/v1/tracks/{track.id}/stream",
        credits=[
            CreditOut(
                role=credit.role, artist=ArtistOut.model_validate(credit.artist)
            )
            for credit in track.credits
        ],
        lyrics=track.lyrics,
    )


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
