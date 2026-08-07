import type { Metadata } from "next";

import AlbumCard from "@/components/albums/album-card";
import PageTransition from "@/components/page-transition";
import { getAlbums } from "@/lib/api";

export const metadata: Metadata = {
  title: "专辑",
  description: "浏览 Soul Searching 企划下已发布的所有专辑。",
};

export default async function AlbumsPage() {
  const albums = await getAlbums();

  return (
    <PageTransition>
      <div className="mx-auto flex h-[calc(100vh-7.5rem)] max-w-5xl flex-col justify-center overflow-hidden px-4 py-6">
        <h1 className="text-2xl font-bold tracking-tight">专辑</h1>
        {albums.length === 0 ? (
          <p className="mt-6 text-sm text-zinc-400">还没有已发布的专辑。</p>
        ) : (
          <div className="mt-8 flex gap-6 overflow-x-auto pb-2">
            {albums.map((album) => (
              <div key={album.id} className="w-56 shrink-0 snap-start">
                <AlbumCard album={album} />
              </div>
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
