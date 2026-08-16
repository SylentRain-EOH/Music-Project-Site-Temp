// 独立播放器页视图：封面 FLIP、进度控制、播放模式、播放列表与歌词展示。
"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
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
import VolumeControl from "@/components/player/volume-control";
import {
  flipFromRect,
  hasCoverTransition,
  saveCoverTransition,
  takeCoverTransition,
} from "@/lib/cover-transition";
import {
  getActiveLyricIndex,
  hasTimedLyrics,
  parseLyrics,
} from "@/lib/lyrics";
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

// 歌词视口为 h-44(176px)，行高为 leading-8(32px)。
// 在时间戳歌词上下增加 padding，使首行和末行也能滚动到视口中心。
const LYRIC_CENTER_PADDING_PX = (176 - 32) / 2;

export default function PlayerView({ track }: { track: TrackDetail }) {
  const router = useRouter();
  const [playlistOpen, setPlaylistOpen] = useState(false);
  const [entered, setEntered] = useState(() => {
    if (typeof window === "undefined") return true;
    return hasCoverTransition() ? false : true;
  });
  const [leaving, setLeaving] = useState(false);
  const coverRef = useRef<HTMLDivElement | null>(null);
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
  const lyricLineRefs = useRef<Array<HTMLParagraphElement | null>>([]);
  const lyricsViewportRef = useRef<HTMLDivElement | null>(null);
  const lyricLines = useMemo(() => parseLyrics(track.lyrics), [track.lyrics]);
  const timedLyrics = hasTimedLyrics(lyricLines);
  const activeLyricIndex = timedLyrics
    ? getActiveLyricIndex(lyricLines, currentTime)
    : -1;

  useEffect(() => {
    // 直接打开 URL 时，让播放器同步到当前曲目。
    if (currentTrack?.id !== track.id) {
      playTrack(track, [track]);
    }
    // playTrack 引用每次渲染都会变化，这里只需要在曲目切换时同步一次
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [track.id]);

  useEffect(() => {
    // 底部播放器或播放列表切歌时，跟随当前曲目跳转到对应 URL。
    if (currentTrack && currentTrack.id !== track.id) {
      router.replace(`/tracks/${currentTrack.id}`);
    }
    // 页面曲目跟随播放器当前曲目变化
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTrack?.id]);

  useEffect(() => {
    // 预取返回的专辑详情页与队列中的其他曲目，减少切换等待。
    router.prefetch(`/albums/${track.album_slug}`);
    for (const item of queue) {
      router.prefetch(`/tracks/${item.id}`);
    }
  }, [track.album_slug, queue, router]);

  useLayoutEffect(() => {
    // 时间戳歌词：当前高亮行变化时，在绘制前把该行滚动到歌词视口中部。
    if (!timedLyrics || activeLyricIndex < 0) return;
    const viewport = lyricsViewportRef.current;
    const line = lyricLineRefs.current[activeLyricIndex];
    if (!viewport || !line) return;
    const viewportRect = viewport.getBoundingClientRect();
    const lineRect = line.getBoundingClientRect();
    const lineTop = viewport.scrollTop + lineRect.top - viewportRect.top;
    const targetTop =
      lineTop - viewport.clientHeight / 2 + line.clientHeight / 2;
    viewport.scrollTo({
      top: Math.max(0, targetTop),
      behavior: "smooth",
    });
  }, [activeLyricIndex, timedLyrics]);

  useLayoutEffect(() => {
    // 从详情/返回进入时，封面从记录的位置 FLIP 到播放器位置。
    const transition = takeCoverTransition();
    if (transition && coverRef.current) {
      flipFromRect(coverRef.current, transition.rect);
    }
    const raf = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  function handleBack() {
    // 返回专辑详情：记录封面位置并淡出当前页面。
    const cover = coverRef.current;
    if (cover) {
      const rect = cover.getBoundingClientRect();
      saveCoverTransition({
        slug: track.album_slug,
        rect: {
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height,
        },
      });
    }
    setLeaving(true);
    window.setTimeout(() => router.push(`/albums/${track.album_slug}`), 240);
  }

  function playFromQueue(nextTrack: Track) {
    // 播放列表选曲：切换播放并跳转到对应 URL。
    playTrack(nextTrack, queue);
    setPlaylistOpen(false);
    router.replace(`/tracks/${nextTrack.id}`);
  }

  return (
    <div
      className={`mx-auto flex h-[calc(100vh-6rem)] max-w-6xl flex-col px-6 pt-10 pb-4 transition-opacity duration-base ${
        entered && !leaving ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="shrink-0">
        <button
          type="button"
          onClick={handleBack}
          aria-label="返回专辑详情"
          className="inline-flex h-9 w-9 items-center justify-center rounded-md text-foreground-faint transition-colors hover:bg-surface-raised hover:text-foreground"
        >
          <BackIcon className="h-5 w-5" />
        </button>
      </div>

      <div className="mt-6 flex min-h-0 flex-1 items-center justify-center">
        <div className="grid w-[80%] max-w-5xl items-center gap-x-40 gap-y-10 md:grid-cols-[minmax(0,360px)_1fr]">
        <div
          ref={coverRef}
          className="relative aspect-square self-start overflow-hidden rounded-lg bg-surface-raised"
        >
          {track.cover_url ? (
            <Image
              src={track.cover_url}
              alt={track.album_title}
              fill
              sizes="(max-width: 768px) 100vw, 360px"
              className="object-cover"
              priority
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-foreground-muted">
              暂无封面
            </div>
          )}
        </div>

        <div className="flex min-h-0 min-w-0 flex-col justify-center self-start">
          <div key={track.id} className="track-switch">
            <h1 className="truncate text-3xl font-bold tracking-tight">
              {track.title}
            </h1>
            <p className="mt-2 truncate text-sm text-foreground-faint">
              {track.album_title}
            </p>
            {track.credits.length > 0 ? (
              <p className="mt-3 truncate text-sm text-foreground-soft">
                {track.credits
                  .map((credit) => credit.artist.name)
                  .join(" / ")}
              </p>
            ) : null}

            <div
              key={track.id}
              ref={lyricsViewportRef}
              className="mt-5 h-44 overflow-y-auto scroll-smooth scrollbar-hidden"
            >
              {timedLyrics ? (
                <div
                  style={{
                    paddingTop: LYRIC_CENTER_PADDING_PX,
                    paddingBottom: LYRIC_CENTER_PADDING_PX,
                  }}
                >
                  {lyricLines.map((line, index) => {
                    const isActive = index === activeLyricIndex;
                    return (
                      <p
                        key={`${line.time ?? "meta"}-${index}`}
                        ref={(element) => {
                          lyricLineRefs.current[index] = element;
                        }}
                        className={`text-sm leading-8 transition-colors duration-base ${
                          line.time === null
                            ? "text-foreground-muted"
                            : isActive
                              ? "text-foreground"
                              : "text-foreground-faint"
                        }`}
                      >
                        {line.text || "♪"}
                      </p>
                    );
                  })}
                </div>
              ) : track.lyrics?.trim() ? (
                <pre className="whitespace-pre-wrap text-sm leading-8 text-foreground-soft">
                  {track.lyrics}
                </pre>
              ) : track.album_description?.trim() ? (
                <pre className="whitespace-pre-wrap text-sm leading-8 text-foreground-soft">
                  {track.album_description}
                </pre>
              ) : (
                <p className="text-sm leading-8 text-foreground-muted">
                  暂无歌词
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex min-w-0 items-center gap-3 md:w-[calc(100%+96px)] md:justify-self-center">
          <span className="w-10 shrink-0 text-right text-xs tabular-nums text-foreground-faint">
            {formatTime(currentTime)}
          </span>
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={Math.min(currentTime, duration || 0)}
            onChange={(event) => seekTo(Number(event.target.value))}
            className="h-1 w-full cursor-pointer accent-foreground-faint"
            aria-label="播放进度"
          />
          <span className="w-10 shrink-0 text-xs tabular-nums text-foreground-faint">
            {formatTime(duration)}
          </span>
        </div>

        <div className="-ml-3 flex min-w-0 items-center justify-start gap-4">
          <button
            type="button"
            onClick={cyclePlayMode}
            className="flex h-9 w-9 items-center justify-center rounded-md text-foreground-soft transition-colors hover:bg-surface-raised hover:text-foreground"
            aria-label={`播放模式：${playModeLabels[playMode]}`}
          >
            <PlayModeIcon mode={playMode} className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={playPrevious}
              className="flex h-10 w-10 items-center justify-center rounded-md text-foreground-soft transition-colors hover:bg-surface-raised hover:text-foreground"
              aria-label="上一首"
            >
              <PrevIcon className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={togglePlay}
              className="flex h-14 w-14 items-center justify-center rounded-full text-foreground transition-colors hover:bg-surface-raised"
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
              className="flex h-10 w-10 items-center justify-center rounded-md text-foreground-soft transition-colors hover:bg-surface-raised hover:text-foreground"
              aria-label="下一首"
            >
              <NextIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="flex items-center gap-4">
            <VolumeControl vertical />
            <div className="relative">
              <button
                type="button"
                onClick={() => setPlaylistOpen((open) => !open)}
                className="flex h-9 w-9 items-center justify-center rounded-md text-foreground-soft transition-colors hover:bg-surface-raised hover:text-foreground"
                aria-label="播放列表"
                aria-expanded={playlistOpen}
              >
                <ListIcon className="h-4 w-4" />
              </button>

              {playlistOpen ? (
                <div className="absolute bottom-full right-0 z-50 mb-2 max-h-64 w-64 overflow-y-auto rounded-lg border border-line-subtle bg-background p-2 shadow-xl">
                  {queue.length === 0 ? (
                    <p className="px-2 py-3 text-sm text-foreground-faint">
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
                          className={`flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm transition-colors ${
                            isCurrent
                              ? "bg-surface-raised font-medium text-foreground"
                              : "text-foreground-soft hover:bg-surface-raised"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                              isCurrent ? "bg-foreground" : "bg-transparent"
                            }`}
                          />
                          <span className="w-5 shrink-0 text-right text-xs text-foreground-muted">
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
    </div>
  );
}
