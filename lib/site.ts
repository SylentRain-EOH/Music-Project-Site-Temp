// 站点全局配置：名称、简介、联系邮箱与导航项。
export const siteConfig = {
  name: "请输入文本",
  description: "请输入文本",
  email: "contact@sth.example",
  nav: [
    { href: "/", label: "首页" },
    { href: "/albums", label: "专辑" },
    { href: "/contact", label: "联系" },
  ],
} as const;
