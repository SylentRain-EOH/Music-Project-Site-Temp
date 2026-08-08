// 专辑详情视图：负责封面 FLIP 飞入/飞出，以及信息区渐入渐出。
"use client";

import { useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import AlbumPlayButton from "@/components/albums/album-play-button";
import { BackIcon } from "@/components/player/icons";
import {
  flipFromRect,
  saveCoverTransition,
  takeCoverTransition,
} from "@/lib/cover-transition";
import type { AlbumDetail } from "@/lib/music";

export default function AlbumDetailView({
  album,
}: {
  album: AlbumDetail;
}) {
  const router = useRouter();
  const coverRef = useRef<HTMLDivElement | null>(null);
  const [entered, setEntered] = useState(false);
  const [leavingMode, setLeavingMode] = useState<"list" | "player" | null>(
    null
  );

  // 挂载时若存在“从列表飞来”的过渡记录，封面从卡片位置 FLIP 到详情位置。
  useLayoutEffect(() => {
    const transition = takeCoverTransition();
    if (transition && coverRef.current) {
      flipFromRect(coverRef.current, transition.rect);
    }
    const raf = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  function handleBack() {
    // 返回列表：先淡出信息区并记录封面位置，再跳转。
    const cover = coverRef.current;
    if (cover) {
      saveCoverTransition({
        slug: album.slug,
        rect: {
          left: cover.getBoundingClientRect().left,
          top: cover.getBoundingClientRect().top,
          width: cover.getBoundingClientRect().width,
          height: cover.getBoundingClientRect().height,
        },
      });
    }
    setLeavingMode("list");
    window.setTimeout(() => router.push("/albums"), 240);
  }

  function handlePlayLeave() {
    // 进入播放器：让整个详情页淡出，播放按钮稍后执行跳转。
    setLeavingMode("player");
  }

  const pageHidden = !entered || leavingMode === "player";
  const infoHidden = !entered || leavingMode !== null;

  return (
    <div
      className={`mx-auto flex h-[calc(100vh-6rem)] max-w-6xl flex-col px-6 py-4 transition-opacity duration-300 ${
        pageHidden ? "opacity-0" : "opacity-100"
      }`}
    >
      <div
        className={`shrink-0 transition-opacity duration-200 ${
          infoHidden ? "opacity-0" : "opacity-100"
        }`}
      >
        <button
          type="button"
          onClick={handleBack}
          aria-label="返回专辑列表"
          className="inline-flex h-9 w-9 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-foreground"
        >
          <BackIcon className="h-5 w-5" />
        </button>
      </div>

      <div className="grid min-h-0 flex-1 items-center gap-14 md:grid-cols-[minmax(0,340px)_1fr]">
        <div
          ref={coverRef}
          className="relative aspect-square overflow-hidden rounded-lg bg-zinc-800"
        >
          {album.cover_url ? (
            <Image
              src={album.cover_url}
              alt={album.title}
              fill
              sizes="(max-width: 768px) 100vw, 340px"
              className="object-cover"
              priority
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-zinc-500">
              暂无封面
            </div>
          )}
        </div>

        <div
          className={`min-h-0 transition-opacity duration-300 ${
            infoHidden ? "opacity-0" : "opacity-100"
          }`}
        >
          <h1 className="text-3xl font-bold tracking-tight">{album.title}</h1>
          {album.release_date ? (
            <p className="mt-2 text-sm text-zinc-400">
              发行日期：{album.release_date}
            </p>
          ) : null}
          {album.description ? (
            <p className="mt-4 line-clamp-3 text-sm leading-7 text-zinc-300">
              {album.description}
            </p>
          ) : null}
          {album.credits.length > 0 ? (
            <div className="mt-5">
              <h2 className="text-sm font-medium text-zinc-400">制作人员</h2>
              <ul className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm">
                {album.credits.map((credit, index) => (
                  <li key={`${credit.artist.id}-${credit.role}-${index}`}>
                    {credit.artist.name}（{credit.role}）
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <div className="-m-2 mt-8 p-2">
            <AlbumPlayButton
              tracks={album.tracks}
              onBeforeNavigate={() => {
                handlePlayLeave();
                if (coverRef.current) {
                  const rect = coverRef.current.getBoundingClientRect();
                  saveCoverTransition({
                    slug: album.slug,
                    rect: {
                      left: rect.left,
                      top: rect.top,
                      width: rect.width,
                      height: rect.height,
                    },
                  });
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
