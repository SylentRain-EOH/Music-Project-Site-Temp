// 根布局：锁定视口高度，全局挂载播放器状态，页面内容统一放入 <main>。
import type { Metadata } from "next";

import SiteHeader from "@/components/site-header";
import { PlayerProvider } from "@/components/player/player-provider";
import { siteConfig } from "@/lib/site";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="flex h-screen flex-col overflow-hidden">
        <PlayerProvider>
          <SiteHeader />
          <main className="min-h-0 flex-1 overflow-hidden">{children}</main>
        </PlayerProvider>
      </body>
    </html>
  );
}
