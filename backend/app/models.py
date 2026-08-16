"""数据模型：专辑、曲目、制作人与 credits 关联表。"""

from datetime import date, datetime

from sqlalchemy import (
    Boolean,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
    func,
    text,
)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    pass


class Album(Base):
    """专辑：slug 用于 URL，cover_path 指向封面文件，download_path 指向 zip 下载包。"""

    __tablename__ = "albums"

    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(String(120), unique=True, index=True)
    title: Mapped[str] = mapped_column(String(200))
    cover_path: Mapped[str | None] = mapped_column(String(500), nullable=True)
    release_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    download_path: Mapped[str | None] = mapped_column(String(500), nullable=True)
    downloadable: Mapped[bool] = mapped_column(
        Boolean, default=False, server_default=text("false")
    )
    published: Mapped[bool] = mapped_column(
        Boolean, default=True, server_default=text("true")
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    tracks: Mapped[list["Track"]] = relationship(
        back_populates="album",
        cascade="all, delete-orphan",
        order_by="Track.track_number",
    )
    credits: Mapped[list["Credit"]] = relationship(
        back_populates="album", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        """管理后台下拉框的显示文本。"""
        return self.title


class Track(Base):
    """曲目：audio_path 指向音频文件，lyrics 支持纯文本或 [mm:ss.xx] 时间戳歌词。"""

    __tablename__ = "tracks"
    __table_args__ = (
        UniqueConstraint("album_id", "track_number", name="uq_track_album_number"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    album_id: Mapped[int] = mapped_column(
        ForeignKey("albums.id", ondelete="CASCADE"), index=True
    )
    title: Mapped[str] = mapped_column(String(200))
    track_number: Mapped[int] = mapped_column(Integer)
    duration_seconds: Mapped[int | None] = mapped_column(Integer, nullable=True)
    audio_path: Mapped[str] = mapped_column(String(500))
    lyrics: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    album: Mapped[Album] = relationship(back_populates="tracks")
    credits: Mapped[list["Credit"]] = relationship(
        back_populates="track", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        """管理后台下拉框的显示文本。"""
        return f"{self.track_number}. {self.title}"


class Artist(Base):
    """制作人/音乐人。"""

    __tablename__ = "artists"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(200), unique=True, index=True)

    credits: Mapped[list["Credit"]] = relationship(back_populates="artist")

    def __repr__(self) -> str:
        """管理后台下拉框的显示文本。"""
        return self.name


class Credit(Base):
    """专辑或单曲与制作人的关联。"""

    __tablename__ = "credits"

    id: Mapped[int] = mapped_column(primary_key=True)
    album_id: Mapped[int | None] = mapped_column(
        ForeignKey("albums.id", ondelete="CASCADE"), nullable=True, index=True
    )
    track_id: Mapped[int | None] = mapped_column(
        ForeignKey("tracks.id", ondelete="CASCADE"), nullable=True, index=True
    )
    artist_id: Mapped[int] = mapped_column(
        ForeignKey("artists.id", ondelete="RESTRICT"), index=True
    )
    # 保留字段用于兼容旧数据；当前前端与后台不再区分制作角色。
    role: Mapped[str] = mapped_column(String(100), default="")

    album: Mapped[Album | None] = relationship(back_populates="credits")
    track: Mapped[Track | None] = relationship(back_populates="credits")
    artist: Mapped[Artist] = relationship(back_populates="credits")
