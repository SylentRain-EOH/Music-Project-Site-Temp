"use client";

import Image from "next/image";
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
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-zinc-800 bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-5xl items-center gap-4 px-4">
        {currentTrack ? (
          <>
            <div className="h-10 w-10 shrink-0 overflow-hidden rounded bg-zinc-800">
              {currentTrack.cover_url ? (
                <Image
                  src={currentTrack.cover_url}
                  alt=""
                  width={40}
                  height={40}
                  className="h-full w-full object-cover"
                />
              ) : null}
            </div>
            <Link
              href={`/tracks/${currentTrack.id}`}
              transitionTypes={["nav-forward"]}
              className="min-w-0 flex-1"
            >
              <p className="truncate text-sm font-medium transition-colors hover:text-zinc-200">
                {currentTrack.title}
              </p>
              <p className="truncate text-xs text-zinc-400">
                {currentTrack.album_title}
              </p>
            </Link>
            <Spectrum active={isPlaying} />
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={playPrevious}
                className="rounded-md px-2 py-2 text-sm text-zinc-300 transition-colors hover:text-foreground"
                aria-label="上一首"
              >
                <PrevIcon className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={togglePlay}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-700 text-sm transition-colors hover:border-zinc-500"
                aria-label={isPlaying ? "暂停" : "播放"}
              >
                {isPlaying ? (
                  <PauseIcon className="h-4 w-4" />
                ) : (
                  <PlayIcon className="h-4 w-4" />
                )}
              </button>
              <button
                type="button"
                onClick={playNext}
                className="rounded-md px-2 py-2 text-sm text-zinc-300 transition-colors hover:text-foreground"
                aria-label="下一首"
              >
                <NextIcon className="h-4 w-4" />
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
