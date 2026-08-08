"""专辑接口：列表与详情。"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models import Album, Credit, Track
from app.schemas import AlbumDetail, AlbumListItem, ArtistOut, CreditOut, TrackListItem

router = APIRouter(prefix="/albums", tags=["albums"])


def _cover_url(album: Album) -> str | None:
    return f"/media/{album.cover_path}" if album.cover_path else None


def _credit_out(credit: Credit) -> CreditOut:
    """把 Credit 模型转换为 API 响应结构。"""
    return CreditOut(role=credit.role, artist=ArtistOut.model_validate(credit.artist))


def _album_list_item(album: Album) -> AlbumListItem:
    """专辑列表项：封面路径转为 /media URL。"""
    return AlbumListItem(
        id=album.id,
        slug=album.slug,
        title=album.title,
        cover_url=_cover_url(album),
        release_date=album.release_date,
    )


def _album_detail(album: Album) -> AlbumDetail:
    """专辑详情：包含制作人与按曲号排序的曲目列表。"""
    return AlbumDetail(
        **_album_list_item(album).model_dump(),
        description=album.description,
        credits=[_credit_out(credit) for credit in album.credits],
        tracks=[
            TrackListItem(
                id=track.id,
                album_id=album.id,
                album_title=album.title,
                album_slug=album.slug,
                cover_url=_cover_url(album),
                title=track.title,
                track_number=track.track_number,
                duration_seconds=track.duration_seconds,
                audio_url=f"/api/v1/tracks/{track.id}/stream",
                credits=[_credit_out(credit) for credit in track.credits],
            )
            for track in album.tracks
        ],
    )


@router.get("", response_model=list[AlbumListItem])
async def list_albums(
    db: AsyncSession = Depends(get_db),
) -> list[AlbumListItem]:
    """返回所有已发布专辑，按发行日期从新到旧。"""
    result = await db.execute(
        select(Album)
        .where(Album.published.is_(True))
        .order_by(Album.release_date.desc().nulls_last(), Album.id.desc())
    )
    return [_album_list_item(album) for album in result.scalars().all()]


@router.get("/{slug}", response_model=AlbumDetail)
async def get_album(slug: str, db: AsyncSession = Depends(get_db)) -> AlbumDetail:
    """按 slug 返回专辑详情，不存在时返回 404。"""
    result = await db.execute(
        select(Album)
        .options(
            selectinload(Album.credits).selectinload(Credit.artist),
            selectinload(Album.tracks)
            .selectinload(Track.credits)
            .selectinload(Credit.artist),
        )
        .where(Album.slug == slug, Album.published.is_(True))
    )
    album = result.scalar_one_or_none()
    if album is None:
        raise HTTPException(status_code=404, detail="专辑不存在")
    return _album_detail(album)
