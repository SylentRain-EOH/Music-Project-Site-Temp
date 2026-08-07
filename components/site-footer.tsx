import { siteConfig } from "@/lib/site";

export default function SiteFooter() {
  return (
    <footer className="border-t border-zinc-800">
      <div className="mx-auto max-w-5xl px-4 py-8 text-center text-sm text-zinc-400">
        <p>
          © {new Date().getFullYear()} {siteConfig.name}
        </p>
      </div>
    </footer>
  );
}
