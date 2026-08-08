"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  BackIcon,
  ListIcon,
  NextIcon,
  PauseIcon,
  PlayIcon,
  PlayModeIcon,
  PrevIcon,
} from "@/components/player/icons";
import { usePlayer } from "@/components/player/player-provider";
import type { Track, TrackDetail } from "@/lib/music";

const playModeLabels = {
  sequence: "顺序播放",
  single: "单曲循环",
  shuffle: "随机播放",
} as const;

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const remaining = Math.floor(seconds % 60);
  return `${minutes}:${remaining.toString().padStart(2, "0")}`;
}

export default function PlayerView({ track }: { track: TrackDetail }) {
  const router = useRouter();
  const [playlistOpen, setPlaylistOpen] = useState(false);
  const {
    currentTrack,
    queue,
    isPlaying,
    currentTime,
    duration,
    playMode,
    playTrack,
    togglePlay,
    playNext,
    playPrevious,
    seekTo,
    cyclePlayMode,
  } = usePlayer();

  useEffect(() => {
    if (currentTrack?.id !== track.id) {
      playTrack(track, [track]);
    }
    // playTrack 引用每次渲染都会变化，这里只需要在曲目切换时同步一次
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [track.id]);

  useEffect(() => {
    if (currentTrack && currentTrack.id !== track.id) {
      router.replace(`/tracks/${currentTrack.id}`);
    }
    // 页面曲目跟随播放器当前曲目变化
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTrack?.id]);

  function playFromQueue(nextTrack: Track) {
    playTrack(nextTrack, queue);
    setPlaylistOpen(false);
    router.replace(`/tracks/${nextTrack.id}`);
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-6rem)] max-w-6xl flex-col px-6 py-4">
      <div className="shrink-0">
        <Link
          href={`/albums/${track.album_slug}`}
          aria-label="返回专辑详情"
          className="inline-flex h-9 w-9 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-foreground"
        >
          <BackIcon className="h-5 w-5" />
        </Link>
      </div>

      <div className="grid min-h-0 flex-1 items-center gap-16 md:grid-cols-[minmax(0,420px)_1fr]">
        <div className="min-h-0">
          <div className="relative aspect-square overflow-hidden rounded-lg bg-zinc-800">
            {track.cover_url ? (
              <Image
                src={track.cover_url}
                alt={track.album_title}
                fill
                sizes="(max-width: 768px) 100vw, 420px"
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-zinc-500">
                暂无封面
              </div>
            )}
          </div>

          <div className="mt-5 flex items-center gap-3">
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
        </div>

        <div className="flex min-h-0 flex-col justify-center">
          <div key={track.id} className="track-switch">
            <h1 className="truncate text-3xl font-bold tracking-tight">
              {track.title}
            </h1>
            <p className="mt-2 truncate text-sm text-zinc-400">
              {track.album_title}
            </p>
            {track.credits.length > 0 ? (
              <p className="mt-3 truncate text-sm text-zinc-300">
                {track.credits
                  .map(
                    (credit) => `${credit.artist.name}（${credit.role}）`
                  )
                  .join(" / ")}
              </p>
            ) : null}

            {track.lyrics ? (
              <div className="mt-5 max-h-44 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm leading-8 text-zinc-300">
                  {track.lyrics}
                </pre>
              </div>
            ) : null}
          </div>

          <div className="mt-8 flex items-center justify-between">
            <button
              type="button"
              onClick={cyclePlayMode}
              className="flex h-10 w-10 items-center justify-center rounded-md text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-foreground"
              aria-label={`播放模式：${playModeLabels[playMode]}`}
            >
              <PlayModeIcon mode={playMode} className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={playPrevious}
                className="flex h-11 w-11 items-center justify-center rounded-md text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-foreground"
                aria-label="上一首"
              >
                <PrevIcon className="h-5 w-5" />
              </button>

              <button
                type="button"
                onClick={togglePlay}
                className="flex h-16 w-16 items-center justify-center rounded-full border border-zinc-600 text-zinc-100 transition-colors hover:border-zinc-400"
                aria-label={isPlaying ? "暂停" : "播放"}
              >
                {isPlaying ? (
                  <PauseIcon className="h-6 w-6" />
                ) : (
                  <PlayIcon className="h-6 w-6" />
                )}
              </button>

              <button
                type="button"
                onClick={playNext}
                className="flex h-11 w-11 items-center justify-center rounded-md text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-foreground"
                aria-label="下一首"
              >
                <NextIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => setPlaylistOpen((open) => !open)}
                className="flex h-10 w-10 items-center justify-center rounded-md text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-foreground"
                aria-label="播放列表"
                aria-expanded={playlistOpen}
              >
                <ListIcon className="h-4 w-4" />
              </button>

              {playlistOpen ? (
                <div className="absolute bottom-full right-0 z-50 mb-2 max-h-64 w-64 overflow-y-auto rounded-lg border border-zinc-800 bg-background p-2 shadow-xl">
                  {queue.length === 0 ? (
                    <p className="px-2 py-3 text-sm text-zinc-400">
                      播放列表为空
                    </p>
                  ) : (
                    queue.map((item) => {
                      const isCurrent = item.id === currentTrack?.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => playFromQueue(item)}
                          className={`flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm transition-colors hover:bg-zinc-800 ${
                            isCurrent ? "text-foreground" : "text-zinc-300"
                          }`}
                        >
                          <span className="w-5 shrink-0 text-right text-xs text-zinc-500">
                            {item.track_number}
                          </span>
                          <span className="truncate">{item.title}</span>
                        </button>
                      );
                    })
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
