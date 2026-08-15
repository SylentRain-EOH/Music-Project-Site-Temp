// 全局背景层：固定铺满视口，位于所有内容之后。
// 背景图和遮罩均从 siteConfig.background 读取，方便直接替换视觉资源。
import { siteConfig } from "@/lib/site";

export default function SiteBackground() {
  const { background } = siteConfig;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background"
    >
      {background.src ? (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url("${background.src}")`,
            opacity: background.imageOpacity,
          }}
        />
      ) : null}
      {background.overlay ? (
        <div
          className="absolute inset-0"
          style={{ backgroundImage: background.overlay }}
        />
      ) : null}
    </div>
  );
}
