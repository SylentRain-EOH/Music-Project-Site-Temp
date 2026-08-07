"use client";

import { useRouter } from "next/navigation";

import { usePlayer } from "@/components/player/player-provider";
import type { Track } from "@/lib/music";

function formatDuration(seconds: number | null): string {
  if (seconds === null) return "--:--";
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  return `${minutes}:${remaining.toString().padStart(2, "0")}`;
}

export default function AlbumTrackList({ tracks }: { tracks: Track[] }) {
  const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayer();
  const router = useRouter();

  return (
    <ol className="divide-y divide-zinc-800 border-y border-zinc-800">
      {tracks.map((track) => {
        const isCurrent = currentTrack?.id === track.id;
        return (
          <li key={track.id} className="flex items-center gap-4 py-3">
            <button
              type="button"
              onClick={() => {
                if (isCurrent) {
                  togglePlay();
                  return;
                } else {
                  playTrack(track, tracks);
                }
                router.push(`/tracks/${track.id}`, {
                  transitionTypes: ["nav-forward"],
                });
              }}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-zinc-700 text-xs transition-colors hover:border-zinc-400"
              aria-label={
                isCurrent && isPlaying
                  ? `暂停 ${track.title}`
                  : `播放 ${track.title}`
              }
            >
              {isCurrent && isPlaying
                ? "暂停"
                : isCurrent
                  ? "播放中"
                  : track.track_number}
            </button>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{track.title}</p>
              {track.credits.length > 0 ? (
                <p className="mt-0.5 truncate text-xs text-zinc-400">
                  {track.credits
                    .map(
                      (credit) =>
                        `${credit.artist.name}（${credit.role}）`
                    )
                    .join(" / ")}
                </p>
              ) : null}
            </div>
            <span className="text-xs tabular-nums text-zinc-400">
              {formatDuration(track.duration_seconds)}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
