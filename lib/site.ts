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
