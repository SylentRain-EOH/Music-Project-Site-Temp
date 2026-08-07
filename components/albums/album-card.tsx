import Image from "next/image";
import Link from "next/link";

import type { AlbumSummary } from "@/lib/music";

export default function AlbumCard({ album }: { album: AlbumSummary }) {
  return (
    <Link
      href={`/albums/${album.slug}`}
      className="group block rounded-lg transition-colors"
    >
      <div className="relative aspect-square overflow-hidden rounded-lg bg-zinc-800">
        {album.cover_url ? (
          <Image
            src={album.cover_url}
            alt={album.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-zinc-500">
            暂无封面
          </div>
        )}
      </div>
      <h2 className="mt-3 truncate font-medium">{album.title}</h2>
      {album.release_date ? (
        <p className="mt-1 text-xs text-zinc-400">{album.release_date}</p>
      ) : null}
    </Link>
  );
}
