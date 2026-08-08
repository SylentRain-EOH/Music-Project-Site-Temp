import type { Metadata } from "next";

import AlbumGrid from "@/components/albums/album-grid";
import PageTransition from "@/components/page-transition";
import { getAlbum, getAlbums } from "@/lib/api";

export const metadata: Metadata = {
  title: "专辑",
  description: "浏览 Soul Searching 企划下已发布的所有专辑。",
};

export default async function AlbumsPage() {
  const summaries = await getAlbums();
  const albums = await Promise.all(
    summaries.map((album) => getAlbum(album.slug))
  );

  return (
    <PageTransition>
      <div className="mx-auto h-[calc(100vh-6rem)] max-w-6xl overflow-hidden px-4 py-6">
        <h1 className="text-2xl font-bold tracking-tight">专辑</h1>
        {albums.length === 0 ? (
          <p className="mt-6 text-sm text-zinc-400">还没有已发布的专辑。</p>
        ) : (
          <div className="mt-6">
            <AlbumGrid albums={albums} />
          </div>
        )}
      </div>
    </PageTransition>
  );
}
