import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "专辑",
  description: "浏览 Soul Searching 企划下已发布的所有专辑。",
};

export default function AlbumsPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight">专辑</h1>
      <p className="mt-3 text-sm text-zinc-400">
        专辑列表将在这里展示，接入后端 API 后改为真实数据。
      </p>
    </div>
  );
}
