"use client";

import Link from "next/link";

import {
  NextIcon,
  PauseIcon,
  PlayIcon,
  PrevIcon,
} from "@/components/player/icons";
import { usePlayer } from "./player-provider";
import Spectrum from "./spectrum";

export default function GlobalPlayer() {
  const { currentTrack, isPlaying, togglePlay, playNext, playPrevious } =
    usePlayer();

  return (
    <div className="border-t border-zinc-800/60">
      <div className="mx-auto flex h-12 max-w-6xl items-center gap-3 px-4">
        {currentTrack ? (
          <>
            <Link
              href={`/tracks/${currentTrack.id}`}
              transitionTypes={["nav-forward"]}
              className="min-w-0 flex-1"
            >
              <p className="truncate text-sm text-zinc-300 transition-colors hover:text-foreground">
                {currentTrack.title}
              </p>
            </Link>
            <Spectrum active={isPlaying} />
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={playPrevious}
                className="flex h-8 w-8 items-center justify-center rounded-md text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-foreground"
                aria-label="上一首"
              >
                <PrevIcon className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={togglePlay}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-700 text-zinc-200 transition-colors hover:border-zinc-500"
                aria-label={isPlaying ? "暂停" : "播放"}
              >
                {isPlaying ? (
                  <PauseIcon className="h-3.5 w-3.5" />
                ) : (
                  <PlayIcon className="h-3.5 w-3.5" />
                )}
              </button>
              <button
                type="button"
                onClick={playNext}
                className="flex h-8 w-8 items-center justify-center rounded-md text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-foreground"
                aria-label="下一首"
              >
                <NextIcon className="h-3.5 w-3.5" />
              </button>
            </div>
          </>
        ) : (
          <p className="text-xs text-zinc-500">未在播放</p>
        )}
      </div>
    </div>
  );
}
