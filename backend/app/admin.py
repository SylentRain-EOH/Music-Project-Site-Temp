"""SQLAdmin 管理后台：受登录保护，可管理专辑、曲目、制作人与署名。"""

import hmac

from sqladmin import Admin, ModelView
from sqladmin.authentication import AuthenticationBackend
from sqladmin.filters import BooleanFilter, ForeignKeyFilter
from starlette.requests import Request

from app.config import settings
from app.database import engine
from app.models import Album, Artist, Credit, Track


class AdminAuth(AuthenticationBackend):
    """基于 session 的登录校验，账号密码来自环境变量。"""

    async def login(self, request: Request) -> bool:
        form = await request.form()
        username = form.get("username", "")
        password = form.get("password", "")
        # 恒定时间比较，避免凭据校验的计时侧信道。
        if (
            hmac.compare_digest(username, settings.admin_username)
            and hmac.compare_digest(password, settings.admin_password)
        ):
            request.session.update({"admin": username})
            return True
        return False

    async def logout(self, request: Request) -> bool:
        request.session.clear()
        return True

    async def authenticate(self, request: Request) -> bool:
        return request.session.get("admin") == settings.admin_username


class AlbumAdmin(ModelView, model=Album):
    name = "专辑"
    name_plural = "专辑"
    icon = "fa-solid fa-record-vinyl"
    column_list = [
        Album.id,
        Album.slug,
        Album.title,
        Album.release_date,
        Album.published,
    ]
    column_searchable_list = [Album.title, Album.slug]
    column_filters = [BooleanFilter(Album.published)]
    column_labels = {
        Album.id: "ID",
        Album.slug: "URL 标识",
        Album.title: "标题",
        Album.cover_path: "封面路径",
        Album.release_date: "发行日期",
        Album.description: "简介",
        Album.published: "已发布",
    }
    form_columns = [
        Album.slug,
        Album.title,
        Album.cover_path,
        Album.release_date,
        Album.description,
        Album.published,
    ]


class TrackAdmin(ModelView, model=Track):
    name = "曲目"
    name_plural = "曲目"
    icon = "fa-solid fa-music"
    column_list = [
        Track.id,
        Track.album_id,
        Track.title,
        Track.track_number,
        Track.duration_seconds,
    ]
    column_searchable_list = [Track.title]
    column_filters = [ForeignKeyFilter(Track.album_id, Album.title)]
    column_labels = {
        Track.id: "ID",
        Track.album_id: "专辑 ID",
        Track.title: "标题",
        Track.track_number: "曲号",
        Track.duration_seconds: "时长（秒）",
        Track.audio_path: "音频路径",
        Track.lyrics: "歌词（每行可加 [mm:ss.xx] 时间戳）",
    }
    form_columns = [
        Track.album,
        Track.title,
        Track.track_number,
        Track.duration_seconds,
        Track.audio_path,
        Track.lyrics,
    ]
    form_ajax_refs = {
        "album": {"fields": ["title"], "order_by": "title"},
    }


class ArtistAdmin(ModelView, model=Artist):
    name = "制作人"
    name_plural = "制作人"
    icon = "fa-solid fa-user"
    column_list = [Artist.id, Artist.name]
    column_searchable_list = [Artist.name]
    column_labels = {Artist.id: "ID", Artist.name: "姓名"}
    form_columns = [Artist.name]


class CreditAdmin(ModelView, model=Credit):
    name = "署名"
    name_plural = "署名"
    icon = "fa-solid fa-tag"
    column_list = [
        Credit.id,
        Credit.album_id,
        Credit.track_id,
        Credit.artist_id,
    ]
    column_filters = [ForeignKeyFilter(Credit.artist_id, Artist.name)]
    column_labels = {
        Credit.id: "ID",
        Credit.album_id: "专辑 ID",
        Credit.track_id: "曲目 ID",
        Credit.artist_id: "制作人 ID",
    }
    form_columns = [
        Credit.album,
        Credit.track,
        Credit.artist,
    ]
    form_ajax_refs = {
        "album": {"fields": ["title"], "order_by": "title"},
        "track": {"fields": ["title"], "order_by": "track_number"},
        "artist": {"fields": ["name"], "order_by": "name"},
    }


def setup_admin(app) -> Admin:
    """把 SQLAdmin 挂载到 /admin，并注册四个模型视图。"""
    admin = Admin(
        app,
        engine,
        authentication_backend=AdminAuth(secret_key=settings.secret_key),
    )
    admin.add_view(AlbumAdmin)
    admin.add_view(TrackAdmin)
    admin.add_view(ArtistAdmin)
    admin.add_view(CreditAdmin)
    return admin
