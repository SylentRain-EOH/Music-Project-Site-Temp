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
      <div className="relative mx-auto flex h-16 max-w-6xl items-center gap-6 px-4">
        <SiteLogo />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <GlobalPlayer />
        </div>
        <div className="ml-auto">
          <NavLinks />
        </div>
      </div>
    </header>
  );
}
