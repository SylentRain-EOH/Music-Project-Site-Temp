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
  const [entering, setEntering] = useState(true);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useLayoutEffect(() => {
    const transition = takeCoverTransition();
    if (!transition) return;
    const cover = cardRefs.current[transition.slug];
    if (cover) {
      flipFromRect(cover, transition.rect);
    }
    const raf = requestAnimationFrame(() => {
      setReturningSlug(transition.slug);
      setEntering(false);
      requestAnimationFrame(() => setEntering(true));
    });
    const timer = window.setTimeout(() => setReturningSlug(null), 520);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
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

  const headingHidden =
    leavingSlug !== null || (returningSlug !== null && !entering);

  return (
    <>
      <h1
        className={`text-2xl font-bold tracking-tight transition-opacity duration-300 ${
          headingHidden ? "opacity-0" : "opacity-100"
        }`}
      >
        专辑
      </h1>
      <div className="mt-6 grid grid-cols-2 content-start grid-rows-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {albums.map((album) => {
          const isTarget =
            album.slug === leavingSlug || album.slug === returningSlug;
          const hidden =
            (leavingSlug !== null && album.slug !== leavingSlug) ||
            (returningSlug !== null &&
              !entering &&
              album.slug !== returningSlug);
          return (
            <button
              key={album.id}
              type="button"
              onClick={() => handleSelect(album.slug)}
              title={album.title}
              className={`group rounded-lg transition-all duration-300 ${
                isTarget
                  ? "shadow-none ring-0"
                  : "ring-1 ring-transparent hover:-translate-y-1 hover:scale-[1.03] hover:shadow-xl hover:shadow-black/40 hover:ring-zinc-700"
              } ${hidden ? "opacity-0" : "opacity-100"}`}
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
