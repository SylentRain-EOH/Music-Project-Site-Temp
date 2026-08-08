"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { PlayIcon } from "@/components/player/icons";
import { usePlayer } from "@/components/player/player-provider";
import type { Track } from "@/lib/music";

export default function AlbumPlayButton({
  tracks,
  onBeforeNavigate,
}: {
  tracks: Track[];
  onBeforeNavigate?: () => void;
}) {
  const { playTrack } = usePlayer();
  const router = useRouter();
  const firstTrack = tracks[0];
  const firstTrackId = firstTrack?.id;

  useEffect(() => {
    if (firstTrackId) {
      router.prefetch(`/tracks/${firstTrackId}`);
    }
  }, [firstTrackId, router]);

  if (!firstTrack) {
    return <p className="text-sm text-zinc-400">暂无曲目</p>;
  }

  function handlePlay() {
    if (onBeforeNavigate) {
      onBeforeNavigate();
      window.setTimeout(() => {
        playTrack(firstTrack, tracks);
        router.push(`/tracks/${firstTrack.id}`);
      }, 240);
      return;
    }
    playTrack(firstTrack, tracks);
    router.push(`/tracks/${firstTrack.id}`);
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
