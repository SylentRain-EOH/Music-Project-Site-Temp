// 站点 Logo：从 siteConfig 读取图片与尺寸，点击返回首页。
import Image from "next/image";
import Link from "next/link";

import { siteConfig } from "@/lib/site";

export default function SiteLogo() {
  const { logo, name } = siteConfig;

  return (
    <Link
      href="/"
      aria-label={logo.alt || name}
      className="flex h-16 shrink-0 items-center gap-3"
    >
      {logo.src ? (
        <Image
          src={logo.src}
          alt={logo.alt}
          width={logo.width}
          height={logo.height}
          priority
          className="h-9 w-auto rounded object-contain"
        />
      ) : null}
      {logo.showWordmark ? (
        <span className="text-base font-semibold tracking-wide">{name}</span>
      ) : null}
    </Link>
  );
}
