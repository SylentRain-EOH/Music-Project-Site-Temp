"use client";

import { useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import {
  flipFromRect,
  saveCoverTransition,
  takeCoverTransition,
} from "@/lib/cover-transition";
import type { AlbumSummary } from "@/lib/music";

export default function AlbumList({ albums }: { albums: AlbumSummary[] }) {
  const router = useRouter();
  const [leavingSlug, setLeavingSlug] = useState<string | null>(null);
  const [returningSlug, setReturningSlug] = useState<string | null>(null);
  const [settledSlug, setSettledSlug] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

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
      <h1 className={headingClassName}>专辑</h1>
      <div className="mt-6 grid grid-cols-2 content-start grid-rows-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {albums.map((album, index) => {
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
