// 顶部导航栏：左侧 Logo、中间内嵌播放器、右侧导航链接。
import GlobalPlayer from "@/components/player/global-player";
import NavLinks from "@/components/nav-links";
import SiteLogo from "@/components/site-logo";

export default function SiteHeader() {
  return (
    <header
      style={{ viewTransitionName: "site-header" }}
      className="relative z-40 shrink-0 border-b border-line-subtle bg-background/60 backdrop-blur-md"
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4">
        <SiteLogo />
        <div className="flex min-w-0 flex-1 justify-center">
          <GlobalPlayer />
        </div>
        <NavLinks />
      </div>
    </header>
  );
}
