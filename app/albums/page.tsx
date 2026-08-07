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
      <div className="mx-auto max-w-5xl px-4 py-12">
        <h1 className="text-3xl font-bold tracking-tight">专辑</h1>
        {albums.length === 0 ? (
          <p className="mt-6 text-sm text-zinc-400">还没有已发布的专辑。</p>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {albums.map((album) => (
              <AlbumCard key={album.id} album={album} />
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
