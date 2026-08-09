// 专辑列表：负责卡片网格、封面 FLIP 过渡、搜索与分页。
"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import {
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@/components/player/icons";
import {
  flipFromRect,
  saveCoverTransition,
  takeCoverTransition,
} from "@/lib/cover-transition";
import type { AlbumDetail } from "@/lib/music";

// 每页固定两行 × 4 列。
const PAGE_SIZE = 8;

export default function AlbumList({ albums }: { albums: AlbumDetail[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [leavingSlug, setLeavingSlug] = useState<string | null>(null);
  const [returningSlug, setReturningSlug] = useState<string | null>(null);
  const [settledSlug, setSettledSlug] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // 按专辑标题或制作人姓名过滤。
  const filteredAlbums = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return albums;
    return albums.filter(
      (album) =>
        album.title.toLowerCase().includes(keyword) ||
        album.credits.some((credit) =>
          credit.artist.name.toLowerCase().includes(keyword)
        )
    );
  }, [albums, query]);

  const pageCount = Math.max(1, Math.ceil(filteredAlbums.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const currentAlbums = filteredAlbums.slice(
    safePage * PAGE_SIZE,
    (safePage + 1) * PAGE_SIZE
  );

  // 挂载时若存在“从详情返回”的过渡记录，让对应封面飞回原位，并触发列表淡入。
  useLayoutEffect(() => {
    const transition = takeCoverTransition();
    let timer: number | undefined;
    if (transition) {
      const cover = cardRefs.current[transition.slug];
      if (cover) {
        flipFromRect(cover, transition.rect);
        cover.closest("button")?.classList.add("ring-0", "shadow-none");
      }
      const targetIndex = albums.findIndex(
        (album) => album.slug === transition.slug
      );
      const targetPage =
        targetIndex >= 0 ? Math.floor(targetIndex / PAGE_SIZE) : 0;
      timer = window.setTimeout(() => {
        setReturningSlug(null);
        setSettledSlug(transition.slug);
      }, 520);
      requestAnimationFrame(() => setPage(targetPage));
    }
    const raf = requestAnimationFrame(() => {
      if (transition) setReturningSlug(transition.slug);
      setVisible(false);
      requestAnimationFrame(() => setVisible(true));
    });
    return () => {
      cancelAnimationFrame(raf);
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [albums]);

  function handleSelect(slug: string) {
    // 记录卡片封面位置，淡出其余内容后跳转到详情页。
    const cover = cardRefs.current[slug];
    if (!cover) return;
    saveCoverTransition({
      slug,
      rect: {
        left: cover.getBoundingClientRect().left,
        top: cover.getBoundingClientRect().top,
        width: cover.getBoundingClientRect().width,
        height: cover.getBoundingClientRect().height,
      },
    });
    setLeavingSlug(slug);
    window.setTimeout(() => router.push(`/albums/${slug}`), 220);
  }

  const headingClassName = `text-2xl font-bold tracking-tight transition-opacity duration-300 ${
    leavingSlug !== null
      ? "opacity-0"
      : visible
        ? "heading-rise opacity-100"
        : "opacity-0"
  }`;

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className={headingClassName}>专辑</h1>
        <input
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setPage(0);
          }}
          placeholder="搜索专辑或制作人"
          className="w-56 rounded-md border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-sm text-zinc-200 placeholder:text-zinc-500 focus:border-zinc-500 focus:outline-none"
        />
      </div>

      <div className="mt-6 flex items-center gap-4">
        <button
          type="button"
          onClick={() => setPage(safePage - 1)}
          disabled={safePage === 0}
          aria-label="上一页"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-zinc-700 text-zinc-300 transition-colors hover:border-zinc-500 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronLeftIcon className="h-5 w-5" />
        </button>

        <div className="grid min-w-0 flex-1 grid-cols-4 content-start grid-rows-2 gap-5">
          {currentAlbums.length === 0 ? (
            <p className="col-span-full text-sm text-zinc-400">
              未找到相关专辑
            </p>
          ) : null}
          {currentAlbums.map((album, index) => {
            const isLeaveTarget = leavingSlug === album.slug;
            const isReturnTarget = returningSlug === album.slug;
            let className =
              "group rounded-lg transition-all duration-300 ";
            let animationDelay: string | undefined;

            if (isLeaveTarget || isReturnTarget) {
              className += "shadow-none ring-0 opacity-100";
            } else if (leavingSlug !== null || !visible) {
              className += "opacity-0 ring-1 ring-transparent";
            } else if (settledSlug === album.slug) {
              className +=
                "opacity-100 ring-1 ring-transparent hover:-translate-y-1 hover:scale-[1.03] hover:shadow-xl hover:shadow-black/40 hover:ring-zinc-700";
            } else {
              className +=
                "card-fade-in opacity-100 ring-1 ring-transparent hover:-translate-y-1 hover:scale-[1.03] hover:shadow-xl hover:shadow-black/40 hover:ring-zinc-700";
              animationDelay = `${index * 40}ms`;
            }

            return (
              <button
                key={album.id}
                type="button"
                onClick={() => handleSelect(album.slug)}
                title={album.title}
                className={className}
                style={animationDelay ? { animationDelay } : undefined}
              >
                <div
                  ref={(element) => {
                    cardRefs.current[album.slug] = element;
                  }}
                  className="relative aspect-square overflow-hidden rounded-lg bg-zinc-800"
                >
                  {album.cover_url ? (
                    <Image
                      src={album.cover_url}
                      alt={album.title}
                      fill
                      sizes="(max-width: 640px) 50vw, 25vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-zinc-500">
                      暂无封面
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => setPage(safePage + 1)}
          disabled={safePage >= pageCount - 1}
          aria-label="下一页"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-zinc-700 text-zinc-300 transition-colors hover:border-zinc-500 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronRightIcon className="h-5 w-5" />
        </button>
      </div>

      {pageCount > 1 ? (
        <div className="mt-4 flex items-center justify-center gap-2">
          {Array.from({ length: pageCount }, (_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setPage(index)}
              className={`flex h-8 w-8 items-center justify-center rounded-md text-sm transition-colors ${
                index === safePage
                  ? "bg-zinc-700 text-foreground"
                  : "text-zinc-400 hover:bg-zinc-800 hover:text-foreground"
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      ) : null}
    </>
  );
}
