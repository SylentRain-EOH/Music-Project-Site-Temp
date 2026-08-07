export default function AlbumDetailLoading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="h-9 w-40 animate-pulse rounded bg-zinc-800" />
      <div className="mt-8 h-64 w-64 animate-pulse rounded-lg bg-zinc-800" />
      <div className="mt-8 space-y-3">
        {[0, 1, 2, 3, 4].map((item) => (
          <div key={item} className="h-12 animate-pulse rounded bg-zinc-800" />
        ))}
      </div>
    </div>
  );
}
