const placeholders = [0, 1, 2, 3, 4, 5];

export default function AlbumsLoading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="h-9 w-24 animate-pulse rounded bg-zinc-800" />
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {placeholders.map((item) => (
          <div
            key={item}
            className="aspect-square animate-pulse rounded-lg bg-zinc-800"
          />
        ))}
      </div>
    </div>
  );
}
