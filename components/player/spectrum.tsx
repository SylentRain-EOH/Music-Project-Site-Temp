"use client";

import { useEffect, useRef } from "react";

import { usePlayer } from "@/components/player/player-provider";

const BAR_COUNT = 13;
const WIDTH = 80;
const HEIGHT = 24;
const GAP = 3;
const BAR_WIDTH = (WIDTH - GAP * (BAR_COUNT - 1)) / BAR_COUNT;
const EMPTY_DATA = new Uint8Array(new ArrayBuffer(0));

const sourceCache = new WeakMap<
  HTMLAudioElement,
  MediaElementAudioSourceNode
>();

function getSource(
  audio: HTMLAudioElement,
  context: AudioContext
): MediaElementAudioSourceNode {
  const cached = sourceCache.get(audio);
  if (cached) return cached;
  const source = context.createMediaElementSource(audio);
  sourceCache.set(audio, source);
  return source;
}

function drawSpectrum(
  canvas: HTMLCanvasElement,
  data: Uint8Array<ArrayBuffer>,
  playing: boolean
) {
  const dpr = window.devicePixelRatio || 1;
  if (canvas.width !== WIDTH * dpr) canvas.width = WIDTH * dpr;
  if (canvas.height !== HEIGHT * dpr) canvas.height = HEIGHT * dpr;
  const context = canvas.getContext("2d");
  if (!context) return;
  context.setTransform(dpr, 0, 0, dpr, 0, 0);
  context.clearRect(0, 0, WIDTH, HEIGHT);
  context.fillStyle = "#a1a1aa";

  const binCount = data.length;
  for (let index = 0; index < BAR_COUNT; index += 1) {
    let value = 0;
    if (playing) {
      const binIndex = Math.min(
        binCount - 1,
        Math.floor((index / BAR_COUNT) * binCount)
      );
      value = data[binIndex] ?? 0;
    }
    const barHeight = Math.max(3, (value / 255) * HEIGHT);
    const x = index * (BAR_WIDTH + GAP);
    context.fillRect(x, HEIGHT - barHeight, BAR_WIDTH, barHeight);
  }
}

export default function Spectrum({ active }: { active: boolean }) {
  const { audioRef } = usePlayer();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const contextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataRef = useRef<Uint8Array<ArrayBuffer> | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    const canvas = canvasRef.current;
    if (!audio || !canvas) return;

    if (active && !contextRef.current) {
      try {
        const context = new AudioContext();
        const source = getSource(audio, context);
        const analyser = context.createAnalyser();
        analyser.fftSize = 128;
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

    function draw() {
      const analyser = analyserRef.current;
      if (!analyser || !dataRef.current || !canvasRef.current) return;
      analyser.getByteFrequencyData(dataRef.current);
      drawSpectrum(canvasRef.current, dataRef.current, true);
      rafRef.current = requestAnimationFrame(draw);
    }

    if (active && analyserRef.current) {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(draw);
    } else {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      drawSpectrum(canvas, EMPTY_DATA, false);
    }

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [active, audioRef]);

  return (
    <canvas
      ref={canvasRef}
      className="h-6 w-20"
      style={{ width: WIDTH, height: HEIGHT }}
      aria-hidden="true"
    />
  );
}
