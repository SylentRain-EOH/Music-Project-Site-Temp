// 专辑列表页（静态生成）：构建时拉取专辑摘要，交给 AlbumList 渲染。
import type { Metadata } from "next";

import AlbumList from "@/components/albums/album-list";
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
    <div className="mx-auto h-[calc(100vh-6rem)] max-w-6xl overflow-hidden px-4 py-6">
      {albums.length === 0 ? (
        <p className="text-sm text-zinc-400">还没有已发布的专辑。</p>
      ) : (
        <AlbumList albums={albums} />
      )}
    </div>
  );
}
