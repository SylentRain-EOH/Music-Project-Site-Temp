"use client";

import { usePlayer } from "./player-provider";

export default function GlobalPlayer() {
  const { currentTrack, isPlaying, togglePlay, playNext, playPrevious } =
    usePlayer();

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-zinc-800 bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-5xl items-center gap-4 px-4">
        {currentTrack ? (
          <>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {currentTrack.title}
              </p>
              <p className="truncate text-xs text-zinc-400">
                {currentTrack.albumTitle}
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
          </>
        ) : (
          <p className="text-sm text-zinc-400">还没有正在播放的曲目</p>
        )}
      </div>
    </div>
  );
}
