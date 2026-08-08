"""API 响应模型：与前端数据结构一一对应。"""

from datetime import date

from pydantic import BaseModel, ConfigDict


class ArtistOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str


class CreditOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    role: str
    artist: ArtistOut


class AlbumListItem(BaseModel):
    id: int
    slug: str
    title: str
    cover_url: str | None
    release_date: date | None


class TrackListItem(BaseModel):
    id: int
    album_id: int
    album_title: str
    album_slug: str
    cover_url: str | None
    title: str
    track_number: int
    duration_seconds: int | None
    audio_url: str
    credits: list[CreditOut] = []


class TrackDetail(TrackListItem):
    lyrics: str | None = None


class AlbumDetail(AlbumListItem):
    description: str | None
    credits: list[CreditOut] = []
    tracks: list[TrackListItem] = []
