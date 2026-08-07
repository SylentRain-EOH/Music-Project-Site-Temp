"use client";

import { useRouter } from "next/navigation";

import { PlayIcon } from "@/components/player/icons";
import { usePlayer } from "@/components/player/player-provider";
import type { Track } from "@/lib/music";

export default function AlbumPlayButton({ tracks }: { tracks: Track[] }) {
  const { playTrack } = usePlayer();
  const router = useRouter();
  const firstTrack = tracks[0];

  if (!firstTrack) {
    return <p className="text-sm text-zinc-400">暂无曲目</p>;
  }

  function handlePlay() {
    playTrack(firstTrack, tracks);
    router.push(`/tracks/${firstTrack.id}`, {
      transitionTypes: ["nav-forward"],
    });
  }

  return (
    <button
      type="button"
      onClick={handlePlay}
      aria-label="播放专辑"
      className="flex h-16 w-16 items-center justify-center rounded-full border border-zinc-600 text-zinc-100 transition-all hover:scale-105 hover:border-zinc-400"
    >
      <PlayIcon className="h-6 w-6" />
    </button>
  );
}
