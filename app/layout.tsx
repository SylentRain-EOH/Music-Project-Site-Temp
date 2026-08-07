import type { Metadata } from "next";

import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";
import GlobalPlayer from "@/components/player/global-player";
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
      <body className="flex min-h-full flex-col pb-20">
        <PlayerProvider>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
          <GlobalPlayer />
        </PlayerProvider>
      </body>
    </html>
  );
}
