"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

import PageTransition from "@/components/page-transition";
import { usePlayer } from "@/components/player/player-provider";
import type { TrackDetail } from "@/lib/music";

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const remaining = Math.floor(seconds % 60);
  return `${minutes}:${remaining.toString().padStart(2, "0")}`;
}

export default function PlayerView({ track }: { track: TrackDetail }) {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    playTrack,
    togglePlay,
    playNext,
    playPrevious,
    seekTo,
  } = usePlayer();

  useEffect(() => {
    if (currentTrack?.id !== track.id) {
      playTrack(track, [track]);
    }
    // playTrack 引用每次渲染都会变化，这里只需要在曲目切换时同步一次
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [track.id]);

  return (
    <PageTransition>
      <div className="mx-auto max-w-5xl px-4 py-12">
        <Link
          href={`/albums/${track.album_slug}`}
          transitionTypes={["nav-back"]}
          className="inline-flex items-center gap-1 text-sm text-zinc-400 transition-colors hover:text-foreground"
        >
          ← 返回专辑详情
        </Link>

        <div className="mt-8 grid gap-10 md:grid-cols-[minmax(0,320px)_1fr]">
          <div className="relative aspect-square overflow-hidden rounded-lg bg-zinc-800">
            {track.cover_url ? (
              <Image
                src={track.cover_url}
                alt={track.album_title}
                fill
                sizes="(max-width: 768px) 100vw, 320px"
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-zinc-500">
                暂无封面
              </div>
            )}
          </div>

          <div className="flex flex-col justify-center">
            <h1 className="text-3xl font-bold tracking-tight">{track.title}</h1>
            <p className="mt-2 text-sm text-zinc-400">{track.album_title}</p>
            {track.credits.length > 0 ? (
              <p className="mt-3 text-sm text-zinc-300">
                {track.credits
                  .map(
                    (credit) => `${credit.artist.name}（${credit.role}）`
                  )
                  .join(" / ")}
              </p>
            ) : null}

            <div className="mt-8">
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

              <div className="mt-6 flex items-center justify-center gap-6">
                <button
                  type="button"
                  onClick={playPrevious}
                  className="rounded-md px-4 py-2 text-sm text-zinc-300 transition-colors hover:text-foreground"
                  aria-label="上一首"
                >
                  上一首
                </button>
                <button
                  type="button"
                  onClick={togglePlay}
                  className="flex h-16 w-16 items-center justify-center rounded-full border border-zinc-600 text-base transition-colors hover:border-zinc-400"
                  aria-label={isPlaying ? "暂停" : "播放"}
                >
                  {isPlaying ? "暂停" : "播放"}
                </button>
                <button
                  type="button"
                  onClick={playNext}
                  className="rounded-md px-4 py-2 text-sm text-zinc-300 transition-colors hover:text-foreground"
                  aria-label="下一首"
                >
                  下一首
                </button>
              </div>
            </div>
          </div>
        </div>

        {track.lyrics ? (
          <section className="mx-auto mt-12 max-w-2xl">
            <h2 className="text-sm font-medium text-zinc-400">歌词</h2>
            <pre className="mt-4 whitespace-pre-wrap text-sm leading-8 text-zinc-200">
              {track.lyrics}
            </pre>
          </section>
        ) : null}
      </div>
    </PageTransition>
  );
}
