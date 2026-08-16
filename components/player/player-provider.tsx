// 全局播放器状态：维护当前曲目、队列、播放模式、音量与进度，
// 并通过隐藏的 <audio> 元素驱动实际播放。
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
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

// 进入页面后延迟播放，给首屏内容留出呈现时间。
const AUTO_PLAY_DELAY_MS = 1000;

export function PlayerProvider({
  children,
  initialTrack = null,
  initialQueue = [],
}: {
  children: ReactNode;
  initialTrack?: Track | null;
  initialQueue?: Track[];
}) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(initialTrack);
  const [queue, setQueue] = useState<Track[]>(
    initialQueue.length > 0
      ? initialQueue
      : initialTrack
        ? [initialTrack]
        : []
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playMode, setPlayMode] = useState<"sequence" | "single" | "shuffle">(
    "sequence"
  );
  const [volume, setVolumeState] = useState(1);
  const [muted, setMuted] = useState(false);
  const [autoPlayBlocked, setAutoPlayBlocked] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const autoPlayTimerRef = useRef<number | null>(null);

  useLayoutEffect(() => {
    // 首次渲染后根据 audio 的真实状态同步一次，
    // 避免自动播放事件早于 React 事件挂载时按钮/频谱状态不同步。
    const audio = audioRef.current;
    if (audio) setIsPlaying(!audio.paused);
  }, []);

  useEffect(() => {
    // 音量/静音变化时同步到 audio 元素。
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.muted = muted;
    }
  }, [volume, muted]);

  const currentTrackId = currentTrack?.id;

  useEffect(() => {
    // 进入页面后延迟 1 秒再尝试自动播放。
    if (!initialTrack) return;
    autoPlayTimerRef.current = window.setTimeout(() => {
      autoPlayTimerRef.current = null;
      const audio = audioRef.current;
      if (audio?.paused) {
        void audio.play().catch(() => {
          // 浏览器自动播放策略可能阻止首次播放；等待用户首次交互后重试。
          if (audio?.paused) setAutoPlayBlocked(true);
        });
      }
    }, AUTO_PLAY_DELAY_MS);
    return () => {
      if (autoPlayTimerRef.current !== null) {
        window.clearTimeout(autoPlayTimerRef.current);
        autoPlayTimerRef.current = null;
      }
    };
  }, [initialTrack]);

  useEffect(() => {
    // 曲目变化后主动开始播放，保证在任何页面通过播放列表切歌都生效。
    if (!currentTrackId) return;
    // 初始自动播放的延迟计时尚未结束时不抢播，由定时器统一触发。
    if (autoPlayTimerRef.current !== null) return;
    void audioRef.current?.play().catch(() => {
      // 浏览器自动播放策略可能阻止播放；等待用户首次交互后重试。
      if (audioRef.current?.paused) setAutoPlayBlocked(true);
    });
  }, [currentTrackId]);

  useEffect(() => {
    // 自动播放被浏览器拦截时，在第一次点击/按键时恢复播放。
    if (!autoPlayBlocked) return;
    const resumePlayback = () => {
      setAutoPlayBlocked(false);
      const audio = audioRef.current;
      if (audio?.paused) {
        void audio.play().catch(() => setAutoPlayBlocked(true));
      }
    };
    window.addEventListener("pointerdown", resumePlayback, { once: true });
    window.addEventListener("keydown", resumePlayback, { once: true });
    return () => {
      window.removeEventListener("pointerdown", resumePlayback);
      window.removeEventListener("keydown", resumePlayback);
    };
  }, [autoPlayBlocked]);

  function cancelDeferredAutoPlay() {
    if (autoPlayTimerRef.current !== null) {
      window.clearTimeout(autoPlayTimerRef.current);
      autoPlayTimerRef.current = null;
    }
  }

  function playTrack(track: Track, nextQueue: Track[] = []) {
    // 用户主动选歌时取消进入页面时的延迟自动播放。
    cancelDeferredAutoPlay();
    // 播放指定曲目；未提供队列时只播放单曲。
    if (currentTrack?.id === track.id) {
      void audioRef.current?.play().catch(() => {});
      return;
    }
    const resolvedQueue = nextQueue.length > 0 ? nextQueue : [track];
    setQueue(resolvedQueue);
    setCurrentTrack(track);
    setCurrentTime(0);
    setDuration(0);
  }

  function togglePlay() {
    // 用户主动播放/暂停时不再执行延迟自动播放。
    cancelDeferredAutoPlay();
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      void audio.play();
    } else {
      audio.pause();
    }
  }

  function playNext() {
    cancelDeferredAutoPlay();
    // 下一首：顺序模式下循环，随机模式下随机跳到非当前曲目。
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
    cancelDeferredAutoPlay();
    // 上一首：始终按队列逆序回退。
    if (!currentTrack || queue.length === 0) return;
    const index = queue.findIndex((track) => track.id === currentTrack.id);
    const previousTrack =
      queue[(index - 1 + queue.length) % queue.length] ?? queue[0];
    setCurrentTime(0);
    setDuration(0);
    setCurrentTrack(previousTrack);
  }

  function handleEnded() {
    // 播放结束：单曲循环重播，其余模式交给下一首逻辑。
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
    // 顺序播放 → 单曲循环 → 随机播放 循环切换。
    setPlayMode((mode) => {
      if (mode === "sequence") return "single";
      if (mode === "single") return "shuffle";
      return "sequence";
    });
  }

  function setVolume(value: number) {
    // 音量变化；非 0 时自动取消静音。
    const next = Math.min(Math.max(value, 0), 1);
    setVolumeState(next);
    if (next > 0) setMuted(false);
  }

  function toggleMute() {
    // 切换静音。
    setMuted((current) => !current);
  }

  function seekTo(time: number) {
    // 拖动进度：更新 audio 元素播放位置。
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
