# Soul Searching Backend

FastAPI + SQLAlchemy（异步）+ PostgreSQL 的后端服务。

## 本地初始化

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

修改 `.env` 中的 `DATABASE_URL` 指向你的 PostgreSQL，然后创建表：

```bash
python scripts/init_db.py
```

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

- `GET /api/v1/albums`：专辑列表
- `GET /api/v1/albums/{slug}`：专辑详情（含曲目与制作人）
- `GET /api/v1/tracks/{track_id}/stream`：音频流（支持拖动进度条）
