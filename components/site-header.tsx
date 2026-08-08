import Link from "next/link";

import GlobalPlayer from "@/components/player/global-player";
import { siteConfig } from "@/lib/site";

export default function SiteHeader() {
  return (
    <header
      style={{ viewTransitionName: "site-header" }}
      className="shrink-0 border-b border-zinc-800 bg-background/90 backdrop-blur"
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4">
        <Link href="/" className="text-base font-semibold tracking-wide">
          {/* 以后在这里替换为 Logo 组件 */}
          {siteConfig.name}
        </Link>
        <div className="flex min-w-0 flex-1 justify-center">
          <GlobalPlayer />
        </div>
        <nav className="flex items-center gap-6 text-sm text-zinc-300">
          {siteConfig.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
