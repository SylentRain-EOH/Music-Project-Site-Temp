"use client";

import { useState } from "react";

import { MutedIcon, VolumeIcon } from "@/components/player/icons";
import { usePlayer } from "@/components/player/player-provider";

export default function VolumeControl() {
  const { volume, muted, setVolume, toggleMute } = usePlayer();
  const [open, setOpen] = useState(false);
  const isMuted = muted || volume === 0;

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
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
            className="h-1 w-28 cursor-pointer accent-zinc-400"
            aria-label="音量"
          />
        </div>
      ) : null}
    </div>
  );
}
