"use client";

import { useState } from "react";

import { CloseIcon } from "@/components/player/icons";
import { siteConfig } from "@/lib/site";

export default function CopyrightButton() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-40">
      {open ? (
        <div className="absolute bottom-full right-0 mb-2 w-80 rounded-lg border border-zinc-800 bg-background p-4 shadow-xl">
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-sm font-medium">版权信息</h2>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="关闭版权信息"
              className="flex h-8 w-8 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-foreground"
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-3 text-xs leading-6 text-zinc-400">
            © {new Date().getFullYear()} {siteConfig.name}
            。本站展示的音乐作品及相关内容版权归 Soul Searching 企划所有，未经授权请勿转载或用于商业用途。
          </p>
        </div>
      ) : null}
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="rounded-full border border-zinc-700 px-4 py-2 text-xs text-zinc-300 transition-colors hover:border-zinc-500 hover:text-foreground"
      >
        © 版权信息
      </button>
    </div>
  );
}
