// 导航栏内嵌播放器：固定宽度布局，曲名方框点击弹出播放列表，频谱读取真实频段数据。
"use client";

import { useEffect, useRef, useState } from "react";

import {
  NextIcon,
  PauseIcon,
  PlayIcon,
  PrevIcon,
} from "@/components/player/icons";
import type { Track } from "@/lib/music";

import { usePlayer } from "./player-provider";
import Spectrum from "./spectrum";
import VolumeControl from "./volume-control";

export default function GlobalPlayer() {
  const {
    currentTrack,
    queue,
    isPlaying,
    togglePlay,
    playNext,
    playPrevious,
    playTrack,
  } = usePlayer();
  const [playlistOpen, setPlaylistOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // 点击播放列表外部时关闭下拉列表。
  useEffect(() => {
    if (!playlistOpen) return;
    function handlePointerDown(event: PointerEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setPlaylistOpen(false);
      }
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [playlistOpen]);

  function playFromQueue(track: Track) {
    // 从下拉列表选择曲目：切换播放并收起列表。
    playTrack(track, queue);
    setPlaylistOpen(false);
  }

  return (
    <div className="flex h-12 items-center gap-3">
      {currentTrack ? (
        <>
          <div className="flex w-20 shrink-0 justify-center">
            <Spectrum active={isPlaying} />
          </div>

          <div ref={dropdownRef} className="relative shrink-0">
            <button
              type="button"
              onClick={() => setPlaylistOpen((value) => !value)}
              aria-label="播放列表"
              aria-expanded={playlistOpen}
              className="block w-48 truncate rounded-md border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-left text-sm text-zinc-300 transition-colors hover:border-zinc-500 hover:text-foreground"
            >
              {currentTrack.title}
            </button>

            {playlistOpen ? (
              <div className="absolute left-0 top-full z-50 mt-2 max-h-64 w-48 overflow-y-auto rounded-lg border border-zinc-800 bg-background p-1 shadow-xl">
                {queue.length === 0 ? (
                  <p className="px-2 py-2 text-xs text-zinc-500">
                    播放列表为空
                  </p>
                ) : (
                  queue.map((item) => {
                    const isCurrent = item.id === currentTrack.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => playFromQueue(item)}
                        className={`flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-xs transition-colors ${
                          isCurrent
                            ? "bg-zinc-800 font-medium text-foreground"
                            : "text-zinc-300 hover:bg-zinc-800"
                        }`}
                      >
                        <span className="w-4 shrink-0 text-right text-zinc-500">
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

          <div className="flex shrink-0 items-center gap-1">
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
            <VolumeControl />
          </div>
        </>
      ) : (
        <p className="text-xs text-zinc-500">未在播放</p>
      )}
    </div>
  );
}
