// 专辑详情页（SSG）：构建时为每张专辑生成独立静态页面。
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import AlbumDetailView from "@/components/albums/album-detail-view";
import { getAlbum, getAlbums } from "@/lib/api";

export const dynamicParams = false;

export async function generateStaticParams() {
  const albums = await getAlbums();
  return albums.map((album) => ({ slug: album.slug }));
}

type AlbumDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: AlbumDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const album = await getAlbum(slug);
    return {
      title: album.title,
      description: album.description ?? undefined,
    };
  } catch {
    return { title: "专辑不存在" };
  }
}

export default async function AlbumDetailPage({
  params,
}: AlbumDetailPageProps) {
  const { slug } = await params;
  let album;
  try {
    album = await getAlbum(slug);
  } catch {
    notFound();
  }

  const albums = await getAlbums();
  const index = albums.findIndex((item) => item.slug === slug);
  const previousAlbum = index > 0 ? albums[index - 1] : null;
  const nextAlbum =
    index >= 0 && index < albums.length - 1 ? albums[index + 1] : null;

  return (
    <AlbumDetailView
      album={album}
      previousAlbum={previousAlbum}
      nextAlbum={nextAlbum}
    />
  );
}
