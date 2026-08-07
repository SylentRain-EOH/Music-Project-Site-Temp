import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import AlbumTrackList from "@/components/albums/album-track-list";
import { getAlbum } from "@/lib/api";

export const dynamic = "force-dynamic";

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
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="grid gap-10 md:grid-cols-[minmax(0,320px)_1fr]">
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
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{album.title}</h1>
          {album.release_date ? (
            <p className="mt-2 text-sm text-zinc-400">
              发行日期：{album.release_date}
            </p>
          ) : null}
          {album.description ? (
            <p className="mt-4 text-sm leading-7 text-zinc-300">
              {album.description}
            </p>
          ) : null}
          {album.credits.length > 0 ? (
            <div className="mt-6">
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
        </div>
      </div>
      <section className="mt-10">
        <h2 className="text-xl font-semibold">曲目</h2>
        <div className="mt-4">
          <AlbumTrackList tracks={album.tracks} />
        </div>
      </section>
    </div>
  );
}
