// 真实频谱：用 Web Audio AnalyserNode 读取音频频段数据，canvas 逐帧绘制。
// 外观参数全部从 siteConfig.spectrum 读取；开启 peak.enabled 后绘制柱顶峰值元件。
"use client";

import { useEffect, useRef } from "react";

import { usePlayer } from "@/components/player/player-provider";
import { siteConfig } from "@/lib/site";

const spectrumConfig = siteConfig.spectrum;
const BAR_WIDTH =
  (spectrumConfig.width - spectrumConfig.gap * (spectrumConfig.barCount - 1)) /
  spectrumConfig.barCount;
const EMPTY_DATA = new Uint8Array(new ArrayBuffer(0));

type SpectrumSettings = typeof spectrumConfig;
type SpectrumColors = {
  bar: string;
  peak: string;
};

const sourceCache = new WeakMap<
  HTMLAudioElement,
  MediaElementAudioSourceNode
>();

function getSource(
  audio: HTMLAudioElement,
  context: AudioContext
): MediaElementAudioSourceNode {
  // 同一 audio 元素只能创建一次 MediaElementSource，缓存复用。
  const cached = sourceCache.get(audio);
  if (cached) return cached;
  const source = context.createMediaElementSource(audio);
  sourceCache.set(audio, source);
  return source;
}

function resolveSpectrumColor(value: string, fallback: string): string {
  // Canvas 不能直接使用 var(--token)，这里把简单的 CSS 变量解析为实际色值。
  const match = /^var\((--[\w-]+)\)$/.exec(value.trim());
  if (!match) return value || fallback;
  const resolved = getComputedStyle(document.documentElement)
    .getPropertyValue(match[1])
    .trim();
  return resolved || fallback;
}

function ensurePeakHeights(
  current: Float32Array | null,
  barCount: number
): Float32Array {
  if (current && current.length === barCount) return current;
  return new Float32Array(barCount);
}

function hasVisiblePeak(peaks: Float32Array, idleHeight: number): boolean {
  for (let index = 0; index < peaks.length; index += 1) {
    if (peaks[index] > idleHeight) return true;
  }
  return false;
}

function drawSpectrumFrame(
  canvas: HTMLCanvasElement,
  data: Uint8Array<ArrayBuffer>,
  playing: boolean,
  config: SpectrumSettings,
  peaks: Float32Array | null,
  colors: SpectrumColors,
  dt: number
) {
  // 将频域数据映射为频谱柱；未播放时绘制低平条。
  const dpr = window.devicePixelRatio || 1;
  if (canvas.width !== config.width * dpr) canvas.width = config.width * dpr;
  if (canvas.height !== config.height * dpr) {
    canvas.height = config.height * dpr;
  }
  const context = canvas.getContext("2d");
  if (!context) return;
  context.setTransform(dpr, 0, 0, dpr, 0, 0);
  context.clearRect(0, 0, config.width, config.height);

  const binCount = data.length;
  const peakEnabled = config.peak.enabled && peaks !== null;

  for (let index = 0; index < config.barCount; index += 1) {
    let value = 0;
    if (playing) {
      const binIndex = Math.min(
        binCount - 1,
        Math.floor((index / config.barCount) * binCount)
      );
      value = data[binIndex] ?? 0;
    }

    const barHeight = playing
      ? Math.max(config.minBarHeight, (value / 255) * config.height)
      : config.minBarHeight;

    if (peakEnabled && peaks) {
      if (playing && barHeight >= peaks[index]) {
        // 柱体上升时，峰值元件同步顶上。
        peaks[index] = barHeight;
      } else {
        // 柱体回落或暂停后，峰值元件按配置速度缓慢下落。
        peaks[index] = Math.max(
          config.peak.idleHeight,
          peaks[index] - config.peak.fallSpeed * dt
        );
      }
    }

    const x = index * (BAR_WIDTH + config.gap);

    context.fillStyle = colors.bar;
    context.fillRect(x, config.height - barHeight, BAR_WIDTH, barHeight);

    if (peakEnabled && peaks) {
      const peakX = x + (BAR_WIDTH - config.peak.width) / 2;
      // 低频柱可能达到画布顶部，把峰值元件限制在画布内，
      // 避免 y 为负数被裁剪，或被满高柱体视觉上遮挡。
      const maxPeakY = Math.max(0, config.height - config.peak.height);
      const peakY = Math.min(
        maxPeakY,
        Math.max(0, config.height - peaks[index] - config.peak.height / 2)
      );
      context.fillStyle = colors.peak;
      context.fillRect(
        peakX,
        peakY,
        config.peak.width,
        config.peak.height
      );
    }
  }
}

export default function Spectrum({ active }: { active: boolean }) {
  const { audioRef } = usePlayer();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const contextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataRef = useRef<Uint8Array<ArrayBuffer> | null>(null);
  const rafRef = useRef<number | null>(null);
  const peakHeightsRef = useRef<Float32Array | null>(null);
  const lastFrameTimeRef = useRef(0);

  useEffect(() => {
    // 首次播放时创建 AudioContext/Analyser，并保持音频输出连通。
    const audio = audioRef.current;
    const canvas = canvasRef.current;
    if (!audio || !canvas) return;

    const fallbackColor = getComputedStyle(canvas).color;
    const colors: SpectrumColors = {
      bar: resolveSpectrumColor(spectrumConfig.color, fallbackColor),
      peak: resolveSpectrumColor(spectrumConfig.peak.color, fallbackColor),
    };

    if (spectrumConfig.peak.enabled) {
      peakHeightsRef.current = ensurePeakHeights(
        peakHeightsRef.current,
        spectrumConfig.barCount
      );
    }

    if (active && !contextRef.current) {
      try {
        const context = new AudioContext();
        const source = getSource(audio, context);
        const analyser = context.createAnalyser();
        analyser.fftSize = spectrumConfig.fftSize;
        source.connect(analyser);
        source.connect(context.destination);
        contextRef.current = context;
        analyserRef.current = analyser;
        dataRef.current = new Uint8Array(
          new ArrayBuffer(analyser.frequencyBinCount)
        );
        void context.resume();
      } catch {
        // 浏览器不支持或音频被跨域限制时保持空白
      }
    } else if (active && contextRef.current) {
      void contextRef.current.resume();
    }

    function cancelLoop() {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    }

    function draw(now: number) {
      const analyser = analyserRef.current;
      if (!analyser || !dataRef.current || !canvasRef.current) return;
      const previous = lastFrameTimeRef.current;
      lastFrameTimeRef.current = now;
      const dt =
        previous === 0 ? 0 : Math.min((now - previous) / 1000, 0.05);
      analyser.getByteFrequencyData(dataRef.current);
      drawSpectrumFrame(
        canvasRef.current,
        dataRef.current,
        true,
        spectrumConfig,
        peakHeightsRef.current,
        colors,
        dt
      );
      rafRef.current = requestAnimationFrame(draw);
    }

    function drawIdleFall(now: number) {
      if (!canvasRef.current) return;
      const peaks = peakHeightsRef.current;
      const previous = lastFrameTimeRef.current;
      lastFrameTimeRef.current = now;
      const dt =
        previous === 0 ? 0 : Math.min((now - previous) / 1000, 0.05);
      drawSpectrumFrame(
        canvasRef.current,
        EMPTY_DATA,
        false,
        spectrumConfig,
        peaks,
        colors,
        dt
      );
      if (peaks && hasVisiblePeak(peaks, spectrumConfig.peak.idleHeight)) {
        rafRef.current = requestAnimationFrame(drawIdleFall);
      } else {
        rafRef.current = null;
      }
    }

    if (active && analyserRef.current) {
      cancelLoop();
      lastFrameTimeRef.current = 0;
      rafRef.current = requestAnimationFrame(draw);
    } else {
      cancelLoop();
      if (
        spectrumConfig.peak.enabled &&
        peakHeightsRef.current &&
        hasVisiblePeak(
          peakHeightsRef.current,
          spectrumConfig.peak.idleHeight
        )
      ) {
        // 暂停后让峰值元件继续缓慢回落，直到全部落到 idle 高度。
        lastFrameTimeRef.current = 0;
        rafRef.current = requestAnimationFrame(drawIdleFall);
      } else {
        drawSpectrumFrame(
          canvas,
          EMPTY_DATA,
          false,
          spectrumConfig,
          peakHeightsRef.current,
          colors,
          0
        );
      }
    }

    return cancelLoop;
  }, [active, audioRef]);

  return (
    <canvas
      ref={canvasRef}
      className="text-foreground-faint"
      style={{ width: spectrumConfig.width, height: spectrumConfig.height }}
      aria-hidden="true"
    />
  );
}
