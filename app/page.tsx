import Link from "next/link";

import PageTransition from "@/components/page-transition";
import { siteConfig } from "@/lib/site";

export default function HomePage() {
  return (
    <PageTransition>
      <div className="mx-auto flex min-h-[70vh] max-w-5xl flex-col items-center justify-center px-4 py-16 text-center">
        <p className="text-xs uppercase tracking-[0.35em] text-zinc-400">
          A Music Project
        </p>
        <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">
          {siteConfig.name}
        </h1>
        <p className="mt-6 max-w-xl text-base leading-7 text-zinc-300">
          {siteConfig.description}
        </p>
        <Link
          href="/albums"
          transitionTypes={["nav-forward"]}
          className="mt-10 rounded-full border border-zinc-700 px-6 py-3 text-sm transition-colors hover:border-zinc-500"
        >
          浏览专辑
        </Link>
      </div>
    </PageTransition>
  );
}
