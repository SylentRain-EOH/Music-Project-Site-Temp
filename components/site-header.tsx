import Link from "next/link";

import GlobalPlayer from "@/components/player/global-player";
import { siteConfig } from "@/lib/site";

export default function SiteHeader() {
  return (
    <header
      style={{ viewTransitionName: "site-header" }}
      className="shrink-0 border-b border-zinc-800 bg-background/90 backdrop-blur"
    >
      <nav className="mx-auto flex h-12 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="text-base font-semibold tracking-wide">
          {/* 以后在这里替换为 Logo 组件 */}
          {siteConfig.name}
        </Link>
        <ul className="flex items-center gap-6 text-sm text-zinc-300">
          {siteConfig.nav.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <GlobalPlayer />
    </header>
  );
}
