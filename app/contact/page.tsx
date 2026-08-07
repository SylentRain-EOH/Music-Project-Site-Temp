import type { Metadata } from "next";

import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "联系",
  description: "联系 Soul Searching 企划。",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight">联系</h1>
      <p className="mt-3 text-sm text-zinc-400">
        如果你对我们的音乐感兴趣，可以通过以下方式联系。
      </p>
      <ul className="mt-8 space-y-3 text-sm">
        <li>
          邮箱：
          <a
            href={`mailto:${siteConfig.email}`}
            className="text-zinc-300 underline-offset-4 hover:underline"
          >
            {siteConfig.email}
          </a>
        </li>
        <li className="text-zinc-400">社交媒体账号：待补充</li>
      </ul>
    </div>
  );
}
