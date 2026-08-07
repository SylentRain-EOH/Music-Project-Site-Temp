export type Artist = {
  id: number;
  name: string;
};

export type Credit = {
  role: string;
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
  title: string;
  track_number: number;
  duration_seconds: number | null;
  audio_url: string;
  credits: Credit[];
};

export type AlbumDetail = AlbumSummary & {
  description: string | null;
  credits: Credit[];
  tracks: Track[];
};
