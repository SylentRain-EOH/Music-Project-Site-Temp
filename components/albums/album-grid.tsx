"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import { ViewTransition } from "react";

import AlbumPlayButton from "@/components/albums/album-play-button";
import { CloseIcon } from "@/components/player/icons";
import type { AlbumDetail } from "@/lib/music";

type Rect = {
  left: number;
  top: number;
  width: number;
  height: number;
};

export default function AlbumGrid({ albums }: { albums: AlbumDetail[] }) {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    const slug = new URLSearchParams(window.location.search).get("album");
    return slug && albums.some((album) => album.slug === slug) ? slug : null;
  });
  const [originRect, setOriginRect] = useState<Rect | null>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const overlayCoverRef = useRef<HTMLDivElement | null>(null);
  const selectedAlbum =
    albums.find((album) => album.slug === selectedSlug) ?? null;

  useEffect(() => {
    if (!selectedSlug) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closeOverlay();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedSlug]);

  useLayoutEffect(() => {
    const cover = overlayCoverRef.current;
    if (!selectedSlug || !originRect || !cover) return;
    const final = cover.getBoundingClientRect();
    const dx = originRect.left - final.left;
    const dy = originRect.top - final.top;
    const scaleX = originRect.width / final.width;
    const scaleY = originRect.height / final.height;
    cover.style.transition = "none";
    cover.style.transformOrigin = "top left";
    cover.style.transform = `translate(${dx}px, ${dy}px) scale(${scaleX}, ${scaleY})`;
    cover.getBoundingClientRect();
    cover.style.transition = "transform 450ms cubic-bezier(0.22, 1, 0.36, 1)";
    cover.style.transform = "translate(0, 0) scale(1)";
  }, [selectedSlug, originRect]);

  function openAlbum(slug: string) {
    const cover = cardRefs.current[slug];
    const rect = cover?.getBoundingClientRect();
    if (rect) {
      setOriginRect({
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
      });
    }
    setSelectedSlug(slug);
    window.history.replaceState(null, "", `/albums?album=${slug}`);
  }

  function closeOverlay() {
    setSelectedSlug(null);
    setOriginRect(null);
    window.history.replaceState(null, "", "/albums");
  }

  return (
    <>
      <div className="grid grid-cols-2 content-start grid-rows-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {albums.map((album) => (
          <button
            key={album.id}
            type="button"
            onClick={() => openAlbum(album.slug)}
            title={album.title}
            className={`group rounded-lg ring-1 ring-transparent transition-all duration-300 hover:-translate-y-1 hover:scale-[1.03] hover:shadow-xl hover:shadow-black/40 hover:ring-zinc-700 ${
              selectedSlug === album.slug ? "invisible" : ""
            }`}
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
        ))}
      </div>

      {selectedAlbum ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={closeOverlay}
          />
          <div className="overlay-in relative max-h-[calc(100vh-8rem)] w-full max-w-3xl overflow-y-auto rounded-2xl border border-zinc-800 bg-background p-6 shadow-2xl">
            <button
              type="button"
              onClick={closeOverlay}
              aria-label="关闭"
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-foreground"
            >
              <CloseIcon className="h-5 w-5" />
            </button>

            <div className="grid gap-8 md:grid-cols-[minmax(0,260px)_1fr]">
              <ViewTransition
                name={`album-cover-${selectedAlbum.slug}`}
                share="morph"
                default="none"
              >
                <div
                  ref={overlayCoverRef}
                  className="relative aspect-square overflow-hidden rounded-lg bg-zinc-800"
                >
                  {selectedAlbum.cover_url ? (
                    <Image
                      src={selectedAlbum.cover_url}
                      alt={selectedAlbum.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 260px"
                      className="object-cover"
                      priority
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-zinc-500">
                      暂无封面
                    </div>
                  )}
                </div>
              </ViewTransition>

              <div className="min-h-0">
                <h2 className="text-2xl font-bold tracking-tight">
                  {selectedAlbum.title}
                </h2>
                {selectedAlbum.release_date ? (
                  <p className="mt-2 text-sm text-zinc-400">
                    发行日期：{selectedAlbum.release_date}
                  </p>
                ) : null}
                {selectedAlbum.description ? (
                  <p className="mt-4 line-clamp-3 text-sm leading-7 text-zinc-300">
                    {selectedAlbum.description}
                  </p>
                ) : null}
                {selectedAlbum.credits.length > 0 ? (
                  <div className="mt-5">
                    <h3 className="text-sm font-medium text-zinc-400">
                      制作人员
                    </h3>
                    <ul className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm">
                      {selectedAlbum.credits.map((credit, index) => (
                        <li key={`${credit.artist.id}-${credit.role}-${index}`}>
                          {credit.artist.name}（{credit.role}）
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                <div className="-m-2 mt-8 p-2">
                  <AlbumPlayButton tracks={selectedAlbum.tracks} />
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
