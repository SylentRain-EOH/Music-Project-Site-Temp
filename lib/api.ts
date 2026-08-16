// 服务端 API 客户端：构建时从 FastAPI 拉取专辑/曲目数据，
// 并把后端返回的相对媒体路径解析为可访问的 URL。
import { cache } from "react";

import type {
  AlbumDetail,
  AlbumSummary,
  Track,
  TrackDetail,
} from "@/lib/music";

const apiBaseUrl = process.env.API_BASE_URL ?? "http://localhost:8000";
const mediaBaseUrl = (process.env.NEXT_PUBLIC_MEDIA_BASE_URL ?? "").replace(
  /\/$/,
  ""
);
// 每次构建追加不同 query，强制 force-cache 使用新 key，
// 避免增量构建复用旧的 API 响应，同时保持静态导出可构建。
const fetchCacheBust = Date.now().toString(36);

async function fetchJson<T>(path: string): Promise<T> {
  const url = new URL(`${apiBaseUrl}${path}`);
  url.searchParams.set("build", fetchCacheBust);
  const response = await fetch(url, { cache: "force-cache" });
  if (!response.ok) {
    throw new Error(`API 请求失败（${response.status}）：${path}`);
  }
  return response.json() as Promise<T>;
}

function resolveMediaUrl(url: string | null): string | null {
  if (!url || /^https?:\/\//.test(url)) return url;
  return mediaBaseUrl ? `${mediaBaseUrl}${url}` : url;
}

function mapAlbumSummary(album: AlbumSummary): AlbumSummary {
  return {
    ...album,
    cover_url: resolveMediaUrl(album.cover_url),
  };
}

function mapTrack(track: Track): Track {
  return {
    ...track,
    cover_url: resolveMediaUrl(track.cover_url),
    audio_url: resolveMediaUrl(track.audio_url) ?? "",
  };
}

export const getAlbums = cache(async (): Promise<AlbumSummary[]> => {
  const albums = await fetchJson<AlbumSummary[]>("/api/v1/albums");
  return albums.map(mapAlbumSummary);
});

export const getAlbum = cache(async (slug: string): Promise<AlbumDetail> => {
  const album = await fetchJson<AlbumDetail>(
    `/api/v1/albums/${encodeURIComponent(slug)}`
  );
  return {
    ...album,
    cover_url: resolveMediaUrl(album.cover_url),
    tracks: album.tracks.map(mapTrack),
  };
});

export const getTrack = cache(
  async (trackId: string | number): Promise<TrackDetail> => {
    const track = await fetchJson<TrackDetail>(
      `/api/v1/tracks/${encodeURIComponent(String(trackId))}`
    );
    return {
      ...track,
      cover_url: resolveMediaUrl(track.cover_url),
      audio_url: resolveMediaUrl(track.audio_url) ?? "",
    };
  }
);
