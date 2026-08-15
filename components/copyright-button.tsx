// 联系页右下角版权按钮：点击弹出全宽底部信息栏，点击外部或再次点击按钮关闭。
"use client";

import { useEffect, useRef, useState } from "react";

import { siteConfig } from "@/lib/site";

export default function CopyrightButton() {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const closeTimerRef = useRef<number | null>(null);

  function closeSheet() {
    if (!open || closing) return;
    setClosing(true);
    closeTimerRef.current = window.setTimeout(() => {
      setOpen(false);
      setClosing(false);
      closeTimerRef.current = null;
    }, 240);
  }

  function toggleSheet() {
    if (open) {
      closeSheet();
      return;
    }
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setClosing(false);
    setOpen(true);
  }

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(event: PointerEvent) {
      if (
        sheetRef.current?.contains(event.target as Node) ||
        buttonRef.current?.contains(event.target as Node)
      ) {
        return;
      }
      closeSheet();
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(
    () => () => {
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current);
      }
    },
    []
  );

  return (
    <>
      {open || closing ? (
        <div
          ref={sheetRef}
          className={`fixed inset-x-0 bottom-0 z-40 border-t border-line-subtle bg-background px-6 py-4 shadow-[0_-8px_30px_rgba(0,0,0,0.4)] ${
            closing ? "sheet-down" : "sheet-up"
          }`}
        >
          <div className="mx-auto max-w-6xl">
            <h2 className="text-sm font-medium">版权信息</h2>
            <p className="mt-2 text-xs leading-6 text-foreground-faint">
              © {new Date().getFullYear()} {siteConfig.name}
              。本站展示的音乐作品及相关内容版权归 {siteConfig.name} 企划所有，未经授权请勿转载或用于商业用途。
            </p>
          </div>
        </div>
      ) : null}
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleSheet}
        className="fixed bottom-4 right-4 z-50 rounded-full border border-line px-4 py-2 text-xs text-foreground-soft transition-colors hover:border-line-hover hover:text-foreground"
      >
        © 版权信息
      </button>
    </>
  );
}
