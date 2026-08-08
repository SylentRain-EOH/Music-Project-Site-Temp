import type { Metadata } from "next";

import AlbumList from "@/components/albums/album-list";
import { getAlbums } from "@/lib/api";

export const metadata: Metadata = {
  title: "专辑",
  description: "浏览 Soul Searching 企划下已发布的所有专辑。",
};

export default async function AlbumsPage() {
  const albums = await getAlbums();

  return (
    <div className="mx-auto h-[calc(100vh-6rem)] max-w-6xl overflow-hidden px-4 py-6">
      {albums.length === 0 ? (
        <p className="text-sm text-zinc-400">还没有已发布的专辑。</p>
      ) : (
        <AlbumList albums={albums} />
      )}
    </div>
  );
}
