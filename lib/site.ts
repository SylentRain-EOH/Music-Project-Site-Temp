// 站点全局配置：名称、简介、联系邮箱、导航项，以及品牌视觉资源。
export const siteConfig = {
  name: "请输入文本",
  description: "请输入文本",
  email: "contact@sth.example",
  nav: [
    { href: "/", label: "首页" },
    { href: "/albums", label: "专辑" },
    { href: "/contact", label: "联系" },
  ],
  // 播放器：进入网站时自动播放的曲目 ID；播放列表会包含该曲目所在专辑的全部曲目。
  // 设为 null 则关闭自动播放。
  player: {
    autoPlayTrackId: 1,
  },
  // 专辑 zip 下载：false 时前端隐藏所有下载按钮。
  downloads: {
    enabled: true,
  },
  // 导航栏频谱：color 支持普通 CSS 颜色，也支持 "var(--xxx)" 形式的主题变量。
  // peak.enabled 为 false 时保持现有实时频谱；改为 true 后启用柱顶峰值元件。
  spectrum: {
    width: 153,
    height: 30,
    barCount: 31,
    gap: 2,
    minBarHeight: 3,
    fftSize: 128,
    color: "var(--foreground-faint)",
    peak: {
      enabled: false,
      width: 3,
      height: 1,
      color: "var(--foreground)",
      // 峰值元件每秒回落的像素数，数值越大回落越快。
      fallSpeed: 8,
      idleHeight: 3,
    },
  },
  // 顶部导航栏 Logo：替换 public/images/logo.svg 或修改 src 即可。
  logo: {
    src: "/images/logo.svg",
    alt: "站点 Logo",
    width: 36,
    height: 36,
    // 是否在 Logo 右侧继续显示站点名称。
    showWordmark: false,
  },
  // 全局背景图：替换 public/images/background.svg 或修改 src 即可。
  // imageOpacity 控制背景图强度，overlay 是叠加在其上的 CSS 渐变/颜色遮罩。
  background: {
    src: "/images/background.svg",
    imageOpacity: 0.22,
    overlay:
      "linear-gradient(180deg, rgba(11, 11, 15, 0.55) 0%, rgba(11, 11, 15, 0.82) 100%)",
  },
} as const;

// 浏览器端访问 FastAPI 的地址。
// 本地开发时优先使用 NEXT_PUBLIC_API_BASE_URL，其次回退到
// NEXT_PUBLIC_MEDIA_BASE_URL（两者通常都是 http://localhost:8000）。
// 生产静态部署时保持为空，下载/音频等继续走同域 /api、/media 相对路径。
export const browserApiBaseUrl = (
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  process.env.NEXT_PUBLIC_MEDIA_BASE_URL ??
  ""
).replace(/\/$/, "");
