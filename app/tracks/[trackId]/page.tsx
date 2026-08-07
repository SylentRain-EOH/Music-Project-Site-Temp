import type { Metadata } from "next";
import { notFound } from "next/navigation";

import PlayerView from "@/components/player/player-view";
import { getTrack } from "@/lib/api";

export const dynamic = "force-dynamic";

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
