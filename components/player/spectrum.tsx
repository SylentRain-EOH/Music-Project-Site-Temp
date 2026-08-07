const bars = [0, 1, 2, 3, 4, 5, 6];

export default function Spectrum({ active }: { active: boolean }) {
  return (
    <div className="flex h-6 items-end gap-[3px]" aria-hidden="true">
      {bars.map((bar) => (
        <span
          key={bar}
          className="spectrum-bar w-[3px] rounded-full bg-zinc-400"
          style={{
            animationDelay: `${bar * 0.12}s`,
            animationPlayState: active ? "running" : "paused",
          }}
        />
      ))}
    </div>
  );
}
