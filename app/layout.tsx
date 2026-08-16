// 根布局：锁定视口高度，全局挂载播放器状态，页面内容统一放入 <main>。
import type { Metadata } from "next";

import SiteBackground from "@/components/site-background";
import SiteHeader from "@/components/site-header";
import { PlayerProvider } from "@/components/player/player-provider";
import { getAlbum, getTrack } from "@/lib/api";
import { siteConfig } from "@/lib/site";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 构建时读取配置的自动播放曲目，并加载其所在专辑的完整曲目列表。
  // 若曲目/专辑不存在或后端暂时不可用，则保持不播放，不影响页面生成。
  const autoPlayTrackId = siteConfig.player.autoPlayTrackId;
  const initialTrack =
    autoPlayTrackId === null
      ? null
      : await getTrack(autoPlayTrackId).catch(() => null);
  const initialQueue =
    initialTrack === null
      ? []
      : ((await getAlbum(initialTrack.album_slug).catch(() => null))
          ?.tracks ?? [initialTrack]);

  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="flex h-screen flex-col overflow-hidden">
        <SiteBackground />
        <PlayerProvider initialTrack={initialTrack} initialQueue={initialQueue}>
          <SiteHeader />
          <main className="min-h-0 flex-1 overflow-hidden">{children}</main>
        </PlayerProvider>
      </body>
    </html>
  );
}
