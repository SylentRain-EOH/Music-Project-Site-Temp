import Image from "next/image";
import Link from "next/link";
import { ViewTransition } from "react";

import type { AlbumSummary } from "@/lib/music";

export default function AlbumCard({ album }: { album: AlbumSummary }) {
  return (
    <Link
      href={`/albums/${album.slug}`}
      transitionTypes={["nav-forward"]}
      title={album.title}
      className="group block rounded-lg ring-1 ring-transparent transition-all duration-300 hover:-translate-y-1 hover:scale-[1.03] hover:shadow-xl hover:shadow-black/40 hover:ring-zinc-700"
    >
      <ViewTransition
        name={`album-cover-${album.slug}`}
        share="morph"
        default="none"
      >
        <div className="relative aspect-square overflow-hidden rounded-lg bg-zinc-800">
          {album.cover_url ? (
            <Image
              src={album.cover_url}
              alt={album.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-zinc-500">
              暂无封面
            </div>
          )}
        </div>
      </ViewTransition>
    </Link>
  );
}
