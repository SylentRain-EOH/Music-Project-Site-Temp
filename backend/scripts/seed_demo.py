"""演示数据脚本：生成两段测试音频并写入一张演示专辑。"""

import asyncio
import math
import struct
import sys
import wave
from datetime import date
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from sqlalchemy import select

from app.config import settings
from app.database import SessionLocal, engine
from app.models import Album, Artist, Base, Credit, Track

SAMPLE_RATE = 8000


def _write_demo_tone(path: Path, frequency: float, duration: float = 2.0) -> None:
    """用 wave 模块生成指定频率的短音，方便本地验收播放功能。"""
    if path.exists():
        return
    path.parent.mkdir(parents=True, exist_ok=True)
    frames = bytearray()
    for index in range(int(SAMPLE_RATE * duration)):
        value = int(
            12000 * math.sin(2 * math.pi * frequency * index / SAMPLE_RATE)
        )
        frames.extend(struct.pack("<h", value))
    with wave.open(str(path), "wb") as wav_file:
        wav_file.setnchannels(1)
        wav_file.setsampwidth(2)
        wav_file.setframerate(SAMPLE_RATE)
        wav_file.writeframes(bytes(frames))


async def seed_demo() -> None:
    """写入演示专辑、曲目、制作人与歌词；已存在时跳过。"""
    audio_dir = settings.media_root / "audio"
    first_path = audio_dir / "demo-01.wav"
    second_path = audio_dir / "demo-02.wav"
    _write_demo_tone(first_path, 440.0)
    _write_demo_tone(second_path, 550.0)

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with SessionLocal() as session:
        existing = await session.scalar(
            select(Album.id).where(Album.slug == "first-light")
        )
        if existing is not None:
            print("演示专辑已存在，跳过写入")
            return

        album = Album(
            slug="first-light",
            title="First Light",
            release_date=date(2026, 8, 8),
            published=True,
            description="用于本地验收的演示专辑，替换为你的真实内容即可。",
        )
        session.add(album)
        await session.flush()

        artist = Artist(name="请输入文本")
        session.add(artist)
        await session.flush()

        first_track = Track(
            album_id=album.id,
            title="Dawn",
            track_number=1,
            duration_seconds=2,
            audio_path="audio/demo-01.wav",
            lyrics="天光从云层边缘醒来\n我在寂静里听见心跳\n第一束光照进房间\nnew day, new way",
        )
        second_track = Track(
            album_id=album.id,
            title="Afterglow",
            track_number=2,
            duration_seconds=2,
            audio_path="audio/demo-02.wav",
            lyrics="余晖落在远山背后\n风把一天轻轻合上\n等夜色覆盖所有路\ntomorrow keeps its promise",
        )
        session.add_all([first_track, second_track])
        await session.flush()

        session.add_all(
            [
                Credit(album_id=album.id, artist_id=artist.id),
                Credit(track_id=first_track.id, artist_id=artist.id),
                Credit(track_id=second_track.id, artist_id=artist.id),
            ]
        )
        await session.commit()

    print("演示数据已写入，音频文件位于:", audio_dir)


if __name__ == "__main__":
    asyncio.run(seed_demo())
