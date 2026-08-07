"use client";

import {
  createContext,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";

import type { Track } from "@/lib/music";

type PlayerContextValue = {
  currentTrack: Track | null;
  queue: Track[];
  isPlaying: boolean;
  playTrack: (track: Track, queue?: Track[]) => void;
  togglePlay: () => void;
  playNext: () => void;
  playPrevious: () => void;
};

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [queue, setQueue] = useState<Track[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  function playTrack(track: Track, nextQueue: Track[] = []) {
    const resolvedQueue = nextQueue.length > 0 ? nextQueue : [track];
    setQueue(resolvedQueue);
    setCurrentTrack(track);
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
    const nextTrack = queue[(index + 1) % queue.length] ?? queue[0];
    setCurrentTrack(nextTrack);
  }

  function playPrevious() {
    if (!currentTrack || queue.length === 0) return;
    const index = queue.findIndex((track) => track.id === currentTrack.id);
    const previousTrack =
      queue[(index - 1 + queue.length) % queue.length] ?? queue[0];
    setCurrentTrack(previousTrack);
  }

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        queue,
        isPlaying,
        playTrack,
        togglePlay,
        playNext,
        playPrevious,
      }}
    >
      {children}
      <audio
        ref={audioRef}
        src={currentTrack?.audioUrl}
        autoPlay={currentTrack !== null}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={playNext}
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
