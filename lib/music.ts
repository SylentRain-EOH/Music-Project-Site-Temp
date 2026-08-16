// 前端数据结构：与 FastAPI 返回的字段保持一致。
export type Artist = {
  id: number;
  name: string;
};

export type Credit = {
  artist: Artist;
};

export type AlbumSummary = {
  id: number;
  slug: string;
  title: string;
  cover_url: string | null;
  release_date: string | null;
};

export type Track = {
  id: number;
  album_id: number;
  album_title: string;
  album_slug: string;
  cover_url: string | null;
  title: string;
  track_number: number;
  duration_seconds: number | null;
  audio_url: string;
  credits: Credit[];
};

export type TrackDetail = Track & {
  lyrics: string | null;
  album_description: string | null;
};

export type AlbumDetail = AlbumSummary & {
  description: string | null;
  credits: Credit[];
  tracks: Track[];
};
