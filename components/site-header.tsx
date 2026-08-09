// 顶部导航栏：左侧站点名（后续可替换为 Logo）、中间内嵌播放器、右侧导航链接。
import Link from "next/link";

import GlobalPlayer from "@/components/player/global-player";
import NavLinks from "@/components/nav-links";
import { siteConfig } from "@/lib/site";

export default function SiteHeader() {
  return (
    <header
      style={{ viewTransitionName: "site-header" }}
      className="relative z-40 shrink-0 border-b border-zinc-800 bg-background/90 backdrop-blur"
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4">
        <Link href="/" className="text-base font-semibold tracking-wide">
          {/* 以后在这里替换为 Logo 组件 */}
          {siteConfig.name}
        </Link>
        <div className="flex min-w-0 flex-1 justify-center">
          <GlobalPlayer />
        </div>
        <NavLinks />
      </div>
    </header>
  );
}
