import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ViewTransition } from "react";

import AlbumPlayButton from "@/components/albums/album-play-button";
import PageTransition from "@/components/page-transition";
import { BackIcon } from "@/components/player/icons";
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

  return (
    <PageTransition>
      <div className="mx-auto flex h-[calc(100vh-6rem)] max-w-6xl flex-col px-6 py-4">
        <div className="shrink-0">
        <Link
          href={`/albums?album=${album.slug}`}
          aria-label="返回专辑列表"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-foreground"
          >
            <BackIcon className="h-5 w-5" />
          </Link>
        </div>
        <div className="grid min-h-0 flex-1 items-center gap-14 md:grid-cols-[minmax(0,340px)_1fr]">
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
                  sizes="(max-width: 768px) 100vw, 320px"
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
            <h1 className="text-3xl font-bold tracking-tight">{album.title}</h1>
            {album.release_date ? (
              <p className="mt-2 text-sm text-zinc-400">
                发行日期：{album.release_date}
              </p>
            ) : null}
            {album.description ? (
              <p className="mt-4 line-clamp-3 text-sm leading-7 text-zinc-300">
                {album.description}
              </p>
            ) : null}
            {album.credits.length > 0 ? (
              <div className="mt-5">
                <h2 className="text-sm font-medium text-zinc-400">制作人员</h2>
                <ul className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm">
                  {album.credits.map((credit, index) => (
                    <li key={`${credit.artist.id}-${credit.role}-${index}`}>
                      {credit.artist.name}（{credit.role}）
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            <div className="-m-2 mt-8 p-2">
              <AlbumPlayButton tracks={album.tracks} />
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
