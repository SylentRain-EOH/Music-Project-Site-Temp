// 导航链接：根据当前路径高亮对应页面；切页前先让当前内容淡出再跳转。
"use client";

import {
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
} from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { siteConfig } from "@/lib/site";

// 高亮下划线相对于导航文字宽度的比例，避免标记与文字等宽显得过长。
const NAV_INDICATOR_WIDTH_RATIO = 0.75;

function isNavItemActive(href: string, pathname: string) {
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

export default function NavLinks() {
  const pathname = usePathname();
  const router = useRouter();
  const navRef = useRef<HTMLElement | null>(null);
  const linkRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });
  // 首屏服务端 HTML 先使用原生 underline 作为无 JS 兜底；
  // 客户端量好位置后再切换为可滑动的下划线指示器。
  const [indicatorReady, setIndicatorReady] = useState(false);

  const activeHref = useMemo(
    () =>
      siteConfig.nav.find((item) => isNavItemActive(item.href, pathname))
        ?.href ?? null,
    [pathname]
  );

  function isActive(href: string) {
    return isNavItemActive(href, pathname);
  }

  // 测量当前高亮链接的位置与宽度，让下划线指示器在切换时平滑滑动。
  useLayoutEffect(() => {
    const updateIndicator = () => {
      const nav = navRef.current;
      const link = activeHref ? linkRefs.current[activeHref] : null;
      if (!nav || !link) {
        setIndicator({ left: 0, width: 0 });
        return;
      }
      const width = link.offsetWidth * NAV_INDICATOR_WIDTH_RATIO;
      const left = link.offsetLeft + (link.offsetWidth - width) / 2;
      setIndicator({ left, width });
      setIndicatorReady(true);
    };

    updateIndicator();

    window.addEventListener("resize", updateIndicator);
    const observer = new ResizeObserver(updateIndicator);
    const nav = navRef.current;
    if (nav) observer.observe(nav);

    return () => {
      window.removeEventListener("resize", updateIndicator);
      observer.disconnect();
    };
  }, [activeHref]);

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
    <nav ref={navRef} className="relative flex items-center gap-6 text-sm">
      {siteConfig.nav.map((item) => {
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            ref={(element) => {
              linkRefs.current[item.href] = element;
            }}
            onClick={(event) => handleNavigate(event, item.href)}
            className={`transition-colors duration-base hover:text-foreground ${
              active
                ? `text-foreground ${
                    indicatorReady ? "" : "underline underline-offset-8"
                  }`
                : "text-foreground-soft"
            }`}
          >
            {item.label}
          </Link>
        );
      })}

      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-1.5 left-0 h-px rounded-full bg-foreground transition-[width,transform] duration-base ease-out"
        style={{
          width: `${indicator.width}px`,
          transform: `translateX(${indicator.left}px)`,
        }}
      />
    </nav>
  );
}
