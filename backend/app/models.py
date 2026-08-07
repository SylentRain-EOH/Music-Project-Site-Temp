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
    __tablename__ = "albums"

    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(String(120), unique=True, index=True)
    title: Mapped[str] = mapped_column(String(200))
    cover_path: Mapped[str | None] = mapped_column(String(500), nullable=True)
    release_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
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


class Track(Base):
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
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    album: Mapped[Album] = relationship(back_populates="tracks")
    credits: Mapped[list["Credit"]] = relationship(
        back_populates="track", cascade="all, delete-orphan"
    )


class Artist(Base):
    __tablename__ = "artists"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(200), unique=True, index=True)

    credits: Mapped[list["Credit"]] = relationship(back_populates="artist")


class Credit(Base):
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
    role: Mapped[str] = mapped_column(String(100))

    album: Mapped[Album | None] = relationship(back_populates="credits")
    track: Mapped[Track | None] = relationship(back_populates="credits")
    artist: Mapped[Artist] = relationship(back_populates="credits")
