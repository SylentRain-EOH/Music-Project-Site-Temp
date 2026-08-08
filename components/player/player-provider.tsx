"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";

import type { Track } from "@/lib/music";

type PlayerContextValue = {
  currentTrack: Track | null;
  queue: Track[];
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playMode: "sequence" | "single" | "shuffle";
  volume: number;
  muted: boolean;
  audioRef: RefObject<HTMLAudioElement | null>;
  playTrack: (track: Track, queue?: Track[]) => void;
  togglePlay: () => void;
  playNext: () => void;
  playPrevious: () => void;
  seekTo: (time: number) => void;
  cyclePlayMode: () => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
};

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [queue, setQueue] = useState<Track[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playMode, setPlayMode] = useState<"sequence" | "single" | "shuffle">(
    "sequence"
  );
  const [volume, setVolumeState] = useState(1);
  const [muted, setMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.muted = muted;
    }
  }, [volume, muted]);

  function playTrack(track: Track, nextQueue: Track[] = []) {
    const resolvedQueue = nextQueue.length > 0 ? nextQueue : [track];
    setQueue(resolvedQueue);
    setCurrentTrack(track);
    setCurrentTime(0);
    setDuration(0);
  }

  function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      void audio.play();
    } else {
      audio.pause();
    }
  }

  function playNext() {
    if (!currentTrack || queue.length === 0) return;
    const index = queue.findIndex((track) => track.id === currentTrack.id);
    let nextIndex = (index + 1) % queue.length;
    if (playMode === "shuffle" && queue.length > 1) {
      do {
        nextIndex = Math.floor(Math.random() * queue.length);
      } while (nextIndex === index);
    }
    const nextTrack = queue[nextIndex] ?? queue[0];
    setCurrentTime(0);
    setDuration(0);
    setCurrentTrack(nextTrack);
  }

  function playPrevious() {
    if (!currentTrack || queue.length === 0) return;
    const index = queue.findIndex((track) => track.id === currentTrack.id);
    const previousTrack =
      queue[(index - 1 + queue.length) % queue.length] ?? queue[0];
    setCurrentTime(0);
    setDuration(0);
    setCurrentTrack(previousTrack);
  }

  function handleEnded() {
    if (playMode === "single") {
      const audio = audioRef.current;
      if (audio) {
        audio.currentTime = 0;
        void audio.play();
      }
      return;
    }
    playNext();
  }

  function cyclePlayMode() {
    setPlayMode((mode) => {
      if (mode === "sequence") return "single";
      if (mode === "single") return "shuffle";
      return "sequence";
    });
  }

  function setVolume(value: number) {
    const next = Math.min(Math.max(value, 0), 1);
    setVolumeState(next);
    if (next > 0) setMuted(false);
  }

  function toggleMute() {
    setMuted((current) => !current);
  }

  function seekTo(time: number) {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(time)) return;
    audio.currentTime = Math.min(Math.max(time, 0), duration || time);
    setCurrentTime(audio.currentTime);
  }

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        queue,
        isPlaying,
        currentTime,
        duration,
        playMode,
        volume,
        muted,
        audioRef,
        playTrack,
        togglePlay,
        playNext,
        playPrevious,
        seekTo,
        cyclePlayMode,
        setVolume,
        toggleMute,
      }}
    >
      {children}
      <audio
        ref={audioRef}
        src={currentTrack?.audio_url}
        autoPlay={currentTrack !== null}
        crossOrigin="anonymous"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onLoadedMetadata={(event) => {
          const value = event.currentTarget.duration;
          if (Number.isFinite(value)) setDuration(value);
        }}
        onDurationChange={(event) => {
          const value = event.currentTarget.duration;
          if (Number.isFinite(value)) setDuration(value);
        }}
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
        onEnded={handleEnded}
      />
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error("usePlayer must be used within PlayerProvider");
  }
  return context;
}
