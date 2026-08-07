import { cache } from "react";

import type { AlbumDetail, AlbumSummary, TrackDetail } from "@/lib/music";

const apiBaseUrl = process.env.API_BASE_URL ?? "http://localhost:8000";

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`API 请求失败（${response.status}）：${path}`);
  }
  return response.json() as Promise<T>;
}

export const getAlbums = cache(async (): Promise<AlbumSummary[]> => {
  return fetchJson<AlbumSummary[]>("/api/v1/albums");
});

export const getAlbum = cache(async (slug: string): Promise<AlbumDetail> => {
  return fetchJson<AlbumDetail>(`/api/v1/albums/${encodeURIComponent(slug)}`);
});

export const getTrack = cache(
  async (trackId: string | number): Promise<TrackDetail> => {
    return fetchJson<TrackDetail>(
      `/api/v1/tracks/${encodeURIComponent(String(trackId))}`
    );
  }
);
