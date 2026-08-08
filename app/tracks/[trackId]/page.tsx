// 播放器页（SSG）：构建时为每首曲目生成独立静态页面，数据交给 PlayerView 渲染。
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import PlayerView from "@/components/player/player-view";
import { getAlbum, getAlbums, getTrack } from "@/lib/api";

export const dynamicParams = false;

export async function generateStaticParams() {
  const albums = await getAlbums();
  const tracks: { trackId: string }[] = [];
  for (const album of albums) {
    const detail = await getAlbum(album.slug);
    for (const track of detail.tracks) {
      tracks.push({ trackId: String(track.id) });
    }
  }
  return tracks;
}

type TrackPageProps = {
  params: Promise<{ trackId: string }>;
};

export async function generateMetadata({
  params,
}: TrackPageProps): Promise<Metadata> {
  const { trackId } = await params;
  try {
    const track = await getTrack(trackId);
    return {
      title: track.title,
      description: `${track.album_title} · Soul Searching`,
    };
  } catch {
    return { title: "曲目不存在" };
  }
}

export default async function TrackPage({ params }: TrackPageProps) {
  const { trackId } = await params;
  let track;
  try {
    track = await getTrack(trackId);
  } catch {
    notFound();
  }

  return <PlayerView track={track} />;
}
