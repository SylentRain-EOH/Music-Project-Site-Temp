// 专辑列表：负责卡片网格、封面 FLIP 过渡，以及进入/返回时的渐入渐出。
"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import {
  flipFromRect,
  saveCoverTransition,
  takeCoverTransition,
} from "@/lib/cover-transition";
import type { AlbumDetail } from "@/lib/music";

export default function AlbumList({ albums }: { albums: AlbumDetail[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
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
      timer = window.setTimeout(() => {
        setReturningSlug(null);
        setSettledSlug(transition.slug);
      }, 520);
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
  }, []);

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
          onChange={(event) => setQuery(event.target.value)}
          placeholder="搜索专辑或制作人"
          className="w-56 rounded-md border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-sm text-zinc-200 placeholder:text-zinc-500 focus:border-zinc-500 focus:outline-none"
        />
      </div>
      <div className="mt-6 grid grid-cols-2 content-start grid-rows-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {filteredAlbums.length === 0 ? (
          <p className="col-span-full text-sm text-zinc-400">
            未找到相关专辑
          </p>
        ) : null}
        {filteredAlbums.map((album, index) => {
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
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
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
    </>
  );
}
