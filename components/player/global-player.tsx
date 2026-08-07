"use client";

import { usePlayer } from "./player-provider";

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const remaining = Math.floor(seconds % 60);
  return `${minutes}:${remaining.toString().padStart(2, "0")}`;
}

export default function GlobalPlayer() {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    togglePlay,
    playNext,
    playPrevious,
    seekTo,
  } = usePlayer();

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-zinc-800 bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-5xl flex-col justify-center gap-2 px-4">
        {currentTrack ? (
          <>
            <div className="flex items-center gap-3">
              <span className="w-10 shrink-0 text-right text-xs tabular-nums text-zinc-400">
                {formatTime(currentTime)}
              </span>
              <input
                type="range"
                min={0}
                max={duration || 0}
                step={0.1}
                value={Math.min(currentTime, duration || 0)}
                onChange={(event) => seekTo(Number(event.target.value))}
                className="h-1 w-full cursor-pointer accent-zinc-400"
                aria-label="播放进度"
              />
              <span className="w-10 shrink-0 text-xs tabular-nums text-zinc-400">
                {formatTime(duration)}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {currentTrack.title}
                </p>
                <p className="truncate text-xs text-zinc-400">
                  {currentTrack.album_title}
                </p>
              </div>
              <button
                type="button"
                onClick={playPrevious}
                className="rounded-md px-3 py-2 text-sm text-zinc-300 transition-colors hover:text-foreground"
                aria-label="上一首"
              >
                上一首
              </button>
              <button
                type="button"
                onClick={togglePlay}
                className="rounded-md border border-zinc-700 px-4 py-2 text-sm transition-colors hover:border-zinc-500"
                aria-label={isPlaying ? "暂停" : "播放"}
              >
                {isPlaying ? "暂停" : "播放"}
              </button>
              <button
                type="button"
                onClick={playNext}
                className="rounded-md px-3 py-2 text-sm text-zinc-300 transition-colors hover:text-foreground"
                aria-label="下一首"
              >
                下一首
              </button>
            </div>
          </>
        ) : (
          <p className="text-center text-sm text-zinc-400">
            还没有正在播放的曲目
          </p>
        )}
      </div>
    </div>
  );
}
