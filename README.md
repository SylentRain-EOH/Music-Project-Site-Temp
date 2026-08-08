# Music Project Website Template

一个可作为模板使用的音乐企划网站，功能参考塞壬唱片官网：专辑陈列与搜索、专辑详情、独立播放器页面、导航栏内嵌全局播放器（真实频谱、播放模式、播放列表），并带管理后台与静态导出部署。

## 技术栈

- 前端：Next.js 16（App Router + 静态导出）、React 19、Tailwind CSS 4、TypeScript
- 后端：FastAPI、SQLAlchemy 2（异步）、PostgreSQL（本地验收可用 SQLite）
- 部署形态：前端 `out/` 静态文件 + Nginx；`/api/v1` 与 `/media` 反向代理到 FastAPI

## 目录结构与文件功能

```text
soul-searching-site/
├── app/                        # Next.js 页面（App Router）
│   ├── layout.tsx              # 根布局：锁定视口高度，挂载全局播放器状态
│   ├── page.tsx                # 首页：企划介绍与入口
│   ├── albums/                 # 专辑列表页（静态生成）
│   ├── albums/[slug]/          # 专辑详情页（SSG，每个专辑一个静态页）
│   ├── tracks/[trackId]/       # 播放器页（SSG，每首曲目一个静态页）
│   ├── contact/                # 联系页（含版权信息栏）
│   └── globals.css             # 全局样式、动画与 View Transition 兜底规则
├── components/
│   ├── site-header.tsx         # 顶部导航栏：Logo 位 + 内嵌播放器 + 导航链接
│   ├── nav-links.tsx           # 导航高亮与切页前淡出
│   ├── page-transition.tsx     # 页面进入淡入（纯 CSS，避免闪烁）
│   ├── copyright-button.tsx    # 联系页右下角版权信息栏
│   ├── albums/
│   │   ├── album-list.tsx          # 专辑网格、封面 FLIP、进入/返回渐入渐出
│   │   ├── album-detail-view.tsx   # 详情视图：封面飞入/飞出、信息渐入渐出
│   │   └── album-play-button.tsx   # 播放专辑：整张专辑作为队列
│   └── player/
│       ├── player-provider.tsx  # 全局播放状态（audio、队列、模式、音量、进度）
│       ├── global-player.tsx    # 导航栏内嵌播放器（曲名方框 + 下拉播放列表）
│       ├── player-view.tsx      # 独立播放器页（进度、歌词、播放列表弹层）
│       ├── spectrum.tsx         # Web Audio AnalyserNode 真实频谱
│       ├── volume-control.tsx   # 音量调节（静音 + 滑杆）
│       └── icons.tsx            # 播放器 SVG 图标集
├── lib/
│   ├── api.ts               # 服务端 API 客户端（构建时拉取数据）
│   ├── music.ts             # 前端数据结构（与后端字段一致）
│   ├── site.ts              # 站点名称、邮箱、导航配置
│   └── cover-transition.ts  # 跨页面封面 FLIP 过渡工具
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI 入口：CORS、路由、/media 静态目录
│   │   ├── admin.py         # SQLAdmin 管理后台（/admin）
│   │   ├── config.py        # 配置（数据库、媒体目录、CORS）
│   │   ├── database.py      # SQLAlchemy 异步引擎与会话
│   │   ├── models.py        # albums / tracks / artists / credits 模型
│   │   ├── schemas.py       # API 响应模型
│   │   └── api/
│   │       ├── albums.py    # 专辑列表/详情接口
│   │       ├── tracks.py    # 曲目详情/音频流（支持 Range）
│   │       └── uploads.py   # 音频/封面上传（受管理员账号保护）
│   ├── scripts/
│   │   ├── init_db.py       # 建表脚本
│   │   └── seed_demo.py     # 演示数据（生成测试音频）
│   ├── media/               # 音频与封面文件（git 忽略）
│   └── README.md            # 后端运行说明
├── .env.example             # 前端环境变量示例
└── package.json             # 前端依赖与脚本（build 已固定 webpack）
```

## 本地运行

### 后端（终端 1）

无 PostgreSQL 时可用 SQLite 验收：

```bash
cd backend
source .venv/bin/activate
export DATABASE_URL="sqlite+aiosqlite:///./soulsearching_dev.db"
python scripts/init_db.py
python scripts/seed_demo.py
uvicorn app.main:app --reload --port 8000
```

有 PostgreSQL 时，复制 `backend/.env.example` 为 `.env` 并修改连接串，再执行同样的 init/seed 命令。

### 前端（终端 2）

```bash
cd ..
npm run dev
```

本地环境文件：`.env.local`（`API_BASE_URL`）与 `.env.development`（`NEXT_PUBLIC_MEDIA_BASE_URL`）已在当前机器生成；新环境按 `.env.example` 自行创建。

### 管理后台

启动后端后访问 http://localhost:8000/admin ，默认账号 `admin` / `admin`（生产环境务必通过环境变量修改）。后台可以增删改查专辑、曲目、制作人和署名。

## 构建与部署

静态导出构建会在构建时访问 FastAPI 生成全部页面，因此**构建前需要先启动后端**：

```bash
npm run build
```

产物位于 `out/`，用任意静态服务器托管即可。Nginx 参考配置：

```nginx
server {
  listen 80;
  server_name your-domain.com;
  root /var/www/soul-searching/out;

  location /api/v1/ {
    proxy_pass http://127.0.0.1:8000;
  }
  location /media/ {
    proxy_pass http://127.0.0.1:8000;
  }
  location / {
    try_files $uri $uri.html $uri/ =404;
  }
}
```

> 每次内容变化都需要重新构建前端（这是静态导出的特性）。

## 如何填充真实内容

### 0. 推荐流程：管理后台 + 上传接口

1. 用上传接口把音频和封面放入 `backend/media/`：

```bash
curl -u admin:admin -F "file=@song.mp3" http://localhost:8000/api/v1/uploads/audio
curl -u admin:admin -F "file=@cover.jpg" http://localhost:8000/api/v1/uploads/cover
```

接口会返回类似 `{"path": "audio/xxxx.mp3", "url": "/media/audio/xxxx.mp3"}` 的结果。

2. 打开 `/admin`，把返回的 `path` 填进对应专辑的 `cover_path` 或曲目的 `audio_path`，再填写标题、曲号、歌词、制作人等信息。

3. 重新构建前端即可发布：`npm run build`。

### 1. 音频与封面

- 音频文件放入 `backend/media/audio/`，例如 `backend/media/audio/album-a/01.mp3`
- 封面放入 `backend/media/covers/`
- 数据库中的 `tracks.audio_path` 与 `albums.cover_path` 存相对 `media/` 的路径，例如 `audio/album-a/01.mp3`

### 2. 数据库录入

四张核心表：

| 表 | 用途 | 关键字段 |
| --- | --- | --- |
| `albums` | 专辑 | `slug`（URL 标识）、`title`、`cover_path`、`release_date`、`published` |
| `tracks` | 曲目 | `album_id`、`title`、`track_number`、`duration_seconds`、`audio_path`、`lyrics` |
| `artists` | 制作人/音乐人 | `name` |
| `credits` | 专辑/曲目与制作人关联 | `album_id`/`track_id`、`artist_id`、`role`（作曲/编曲/制作等） |

`published` 设为 `false` 的专辑不会出现在前端。

### 3. 需要修改的占位内容

- 联系邮箱：编辑 `lib/site.ts` 中的 `email`
- 版权文案：编辑 `components/copyright-button.tsx`
- 站点简介：编辑 `lib/site.ts` 中的 `description`
- Logo：把 `components/site-header.tsx` 中的文字替换为 Logo 组件
- 演示数据：删除 `backend/soulsearching_dev.db` 后重新执行 `init_db.py` + `seed_demo.py`，或直接录入真实数据

### 4. 歌词

`tracks.lyrics` 存纯文本，播放器页按换行展示；没有歌词的曲目不显示歌词区域。

## 后续可扩展点

- 管理后台：用 SQLAdmin 或自定义页面上传专辑/曲目/封面，替代手工写库
- 艺术家页：按 `artists` 聚合作品
- 搜索：PostgreSQL 全文检索或简单标题匹配
- 播放列表历史/最近播放
- 真实歌词滚动高亮（根据 `currentTime` 同步当前行）
- 音频转码与多格式支持（MP3/AAC/FLAC）
- 流量增长后把 `backend/media` 迁移到 OSS + CDN，数据库路径不变

## 已知注意事项

- 开发模式下前端 3000、后端 8000 跨域；真实频谱依赖媒体响应带 CORS 头（FastAPI 已配置）
- `npm run build` 使用 webpack 模式（Turbopack 在当前机器构建会报环境错误），脚本已固定
- 静态导出不支持 `next start`，部署请使用 Nginx 等静态服务器
- 管理后台默认账号仅供本地开发，部署前务必设置 `ADMIN_USERNAME`、`ADMIN_PASSWORD` 与 `SECRET_KEY`
