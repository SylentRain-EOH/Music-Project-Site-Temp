"""把 SQLite 数据迁移到 PostgreSQL，保留 ID 与关联关系。

用法（在 backend 目录下）：
    export DATABASE_URL="postgresql+psycopg://user:pass@localhost:5432/soulsearching"
    python scripts/migrate_sqlite_to_postgres.py --replace
"""

import argparse
import asyncio
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from sqlalchemy import delete, select, text
from sqlalchemy.ext.asyncio import (
    async_sessionmaker,
    create_async_engine,
)

from app.models import Album, Artist, Base, Credit, Track


async def migrate(source_url: str, target_url: str, replace: bool) -> None:
    source = create_async_engine(source_url)
    target = create_async_engine(target_url)

    async with target.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        existing = (
            await conn.execute(select(Album.id).limit(1))
        ).scalar_one_or_none()
        if existing is not None and not replace:
            print("目标库已有专辑数据；如需覆盖请加 --replace")
            return
        if replace:
            # 先删子表再删主表，避免外键冲突。
            for model in (Credit, Track, Album, Artist):
                await conn.execute(delete(model))

    SourceSession = async_sessionmaker(source, expire_on_commit=False)
    async with SourceSession() as session:
        artists = (await session.scalars(select(Artist))).all()
        albums = (await session.scalars(select(Album))).all()
        tracks = (await session.scalars(select(Track))).all()
        credits = (await session.scalars(select(Credit))).all()

    async with target.begin() as tconn:
        for artist in artists:
            await tconn.execute(
                text("INSERT INTO artists (id, name) VALUES (:id, :name)"),
                {"id": artist.id, "name": artist.name},
            )
        for album in albums:
            await tconn.execute(
                text(
                    "INSERT INTO albums "
                    "(id, slug, title, cover_path, release_date, description, published) "
                    "VALUES (:id, :slug, :title, :cover_path, :release_date, "
                    ":description, :published)"
                ),
                {
                    "id": album.id,
                    "slug": album.slug,
                    "title": album.title,
                    "cover_path": album.cover_path,
                    "release_date": album.release_date,
                    "description": album.description,
                    "published": album.published,
                },
            )
        for track in tracks:
            await tconn.execute(
                text(
                    "INSERT INTO tracks "
                    "(id, album_id, title, track_number, duration_seconds, "
                    "audio_path, lyrics) "
                    "VALUES (:id, :album_id, :title, :track_number, "
                    ":duration_seconds, :audio_path, :lyrics)"
                ),
                {
                    "id": track.id,
                    "album_id": track.album_id,
                    "title": track.title,
                    "track_number": track.track_number,
                    "duration_seconds": track.duration_seconds,
                    "audio_path": track.audio_path,
                    "lyrics": track.lyrics,
                },
            )
        for credit in credits:
            await tconn.execute(
                text(
                    "INSERT INTO credits "
                    "(id, album_id, track_id, artist_id, role) "
                    "VALUES (:id, :album_id, :track_id, :artist_id, :role)"
                ),
                {
                    "id": credit.id,
                    "album_id": credit.album_id,
                    "track_id": credit.track_id,
                    "artist_id": credit.artist_id,
                    "role": credit.role,
                },
            )

    counts = {
        "artists": len(artists),
        "albums": len(albums),
        "tracks": len(tracks),
        "credits": len(credits),
    }
    print("迁移完成：", counts)
    await source.dispose()
    await target.dispose()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="迁移 SQLite 数据到 PostgreSQL")
    parser.add_argument(
        "--source",
        default="sqlite+aiosqlite:///./soulsearching_dev.db",
        help="SQLite 连接串",
    )
    parser.add_argument(
        "--target",
        default=os.environ.get("DATABASE_URL", ""),
        help="PostgreSQL 连接串（默认读取 DATABASE_URL）",
    )
    parser.add_argument(
        "--replace",
        action="store_true",
        help="目标库已有数据时先清空再迁移",
    )
    args = parser.parse_args()
    if not args.target:
        print("请先设置 DATABASE_URL 或传入 --target")
        sys.exit(1)
    asyncio.run(migrate(args.source, args.target, args.replace))
