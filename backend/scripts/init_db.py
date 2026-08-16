"""建表脚本：根据模型创建数据库表，可重复执行。"""

import asyncio
import sys
from pathlib import Path

from sqlalchemy import text

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.database import engine
from app.models import Base


async def init_db() -> None:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        # 简单迁移：为已有数据库补充后续新增的专辑下载字段。
        await conn.execute(
            text(
                "ALTER TABLE albums "
                "ADD COLUMN IF NOT EXISTS download_path VARCHAR(500)"
            )
        )
        await conn.execute(
            text(
                "ALTER TABLE albums "
                "ADD COLUMN IF NOT EXISTS downloadable BOOLEAN "
                "NOT NULL DEFAULT false"
            )
        )
    print("数据库表已创建/更新")


if __name__ == "__main__":
    asyncio.run(init_db())
