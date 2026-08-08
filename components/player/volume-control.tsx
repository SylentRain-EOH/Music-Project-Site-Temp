// 音量控制：点击切换静音，悬停弹出滑杆；关闭带延迟以便鼠标移入滑杆。
"use client";

import { useEffect, useRef, useState } from "react";

import { MutedIcon, VolumeIcon } from "@/components/player/icons";
import { usePlayer } from "@/components/player/player-provider";

export default function VolumeControl({
  vertical = false,
}: {
  vertical?: boolean;
}) {
  const { volume, muted, setVolume, toggleMute } = usePlayer();
  const [open, setOpen] = useState(false);
  const closeTimerRef = useRef<number | null>(null);
  const isMuted = muted || volume === 0;

  function handleMouseEnter() {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setOpen(true);
  }

  function handleMouseLeave() {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
    }
    closeTimerRef.current = window.setTimeout(() => setOpen(false), 180);
  }

  useEffect(
    () => () => {
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current);
      }
    },
    []
  );

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        type="button"
        onClick={toggleMute}
        className="flex h-8 w-8 items-center justify-center rounded-md text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-foreground"
        aria-label={isMuted ? "取消静音" : "静音"}
      >
        {isMuted ? (
          <MutedIcon className="h-4 w-4" />
        ) : (
          <VolumeIcon className="h-4 w-4" />
        )}
      </button>

      {open ? (
        <div className="absolute bottom-full right-0 z-50 mb-2 rounded-lg border border-zinc-800 bg-background p-3 shadow-xl">
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={isMuted ? 0 : volume}
            onChange={(event) => setVolume(Number(event.target.value))}
            className={
              vertical
                ? "h-28 w-1 cursor-pointer accent-zinc-400"
                : "h-1 w-28 cursor-pointer accent-zinc-400"
            }
            style={
              vertical ? { writingMode: "vertical-lr", direction: "rtl" } : undefined
            }
            aria-label="音量"
          />
        </div>
      ) : null}
    </div>
  );
}
