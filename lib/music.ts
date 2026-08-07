export type Artist = {
  id: string;
  name: string;
  role?: string;
};

export type Track = {
  id: string;
  albumId: string;
  albumTitle: string;
  title: string;
  trackNumber: number;
  duration?: number;
  audioUrl: string;
  artists?: Artist[];
};

export type Album = {
  id: string;
  slug: string;
  title: string;
  coverUrl?: string;
  releaseDate?: string;
  description?: string;
  artists?: Artist[];
  tracks?: Track[];
};
