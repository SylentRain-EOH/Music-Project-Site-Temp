export default function PageTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="page-fade-in">{children}</div>;
}
