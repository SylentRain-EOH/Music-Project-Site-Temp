import type { Metadata } from "next";

type AlbumDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: AlbumDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `专辑：${slug}`,
  };
}

export default async function AlbumDetailPage({
  params,
}: AlbumDetailPageProps) {
  const { slug } = await params;

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight">专辑详情</h1>
      <p className="mt-3 text-sm text-zinc-400">专辑标识：{slug}</p>
      <p className="mt-6 text-sm text-zinc-300">
        接入后端 API 后，这里将展示专辑封面、简介、制作人信息和可播放的曲目列表。
      </p>
    </div>
  );
}
