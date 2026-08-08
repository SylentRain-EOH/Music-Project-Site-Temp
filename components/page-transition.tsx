// 页面进入过渡：使用纯 CSS 淡入，避免浏览器 View Transition 造成的闪烁。
export default function PageTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="page-fade-in">{children}</div>;
}
