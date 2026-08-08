"""FastAPI 应用入口：注册 CORS、API 路由与媒体静态目录。"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.middleware.sessions import SessionMiddleware

from app.admin import setup_admin
from app.api import albums, tracks, uploads
from app.config import settings

settings.media_root.mkdir(parents=True, exist_ok=True)

app = FastAPI(title=settings.app_name, version="0.1.0")

# 开发阶段允许前端跨域访问；生产同域部署时可按需收紧。
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 管理后台登录依赖 session，需要会话中间件。
app.add_middleware(SessionMiddleware, secret_key=settings.secret_key)

app.include_router(albums.router, prefix="/api/v1")
app.include_router(tracks.router, prefix="/api/v1")
app.include_router(uploads.router, prefix="/api/v1")


# 健康检查，便于部署后确认服务存活。
@app.get("/api/v1/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


# 封面等媒体文件由 /media 静态目录对外提供。
app.mount("/media", StaticFiles(directory=settings.media_root), name="media")

# 管理后台：http://<host>/admin
setup_admin(app)
