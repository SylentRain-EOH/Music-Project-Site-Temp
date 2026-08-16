# Backend

FastAPI + SQLAlchemy（异步）+ PostgreSQL 的后端服务。

## 本地初始化

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

修改 `.env` 中的 `DATABASE_URL` 指向你的 PostgreSQL，然后创建/更新表：

```bash
python scripts/init_db.py
```

该脚本可重复执行，会在已有数据库上补齐后续新增字段。

写入演示数据（会生成两段可播放的测试音频）：

```bash
python scripts/seed_demo.py
```

启动开发服务器：

```bash
uvicorn app.main:app --reload --port 8000
```

健康检查：`GET http://localhost:8000/api/v1/health`

## 主要接口

- `GET /api/v1/health`：健康检查
- `GET /api/v1/albums`：专辑列表
- `GET /api/v1/albums/{slug}`：专辑详情（含曲目、制作人与下载信息）
- `GET /api/v1/albums/{slug}/download`：专辑 zip 下载
- `GET /api/v1/tracks/{track_id}`：曲目详情（含歌词与专辑简介）
- `GET /api/v1/tracks/{track_id}/stream`：音频流（支持拖动进度条）
- `POST /api/v1/uploads/audio`：上传音频（Basic Auth）
- `POST /api/v1/uploads/cover`：上传封面（Basic Auth）
- `POST /api/v1/uploads/download`：上传专辑 zip（Basic Auth）
