"use client";

import type { MouseEvent } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { siteConfig } from "@/lib/site";

export default function NavLinks() {
  const pathname = usePathname();
  const router = useRouter();

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    if (href === "/albums") {
      return (
        pathname === "/albums" ||
        pathname.startsWith("/albums/") ||
        pathname.startsWith("/tracks/")
      );
    }
    return pathname === href;
  }

  function handleNavigate(
    event: MouseEvent<HTMLAnchorElement>,
    href: string
  ) {
    if (isActive(href)) return;
    event.preventDefault();
    const content = document.querySelector("main > div") as HTMLElement | null;
    if (content) {
      content.style.transition = "opacity 180ms ease";
      content.style.opacity = "0";
    }
    window.setTimeout(() => router.push(href), 180);
  }

  return (
    <nav className="flex items-center gap-6 text-sm">
      {siteConfig.nav.map((item) => {
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={(event) => handleNavigate(event, item.href)}
            className={`transition-colors hover:text-foreground ${
              active
                ? "text-foreground underline underline-offset-8"
                : "text-zinc-300"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
