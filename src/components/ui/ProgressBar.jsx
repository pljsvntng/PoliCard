export default function ProgressBar({ value, max, tone = "teal", label }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  const toneClass = { teal: "bg-teal", amber: "bg-amber", moss: "bg-moss", rose: "bg-rose" }[tone];
  return (
    <div>
      {label && (
        <div className="flex justify-between text-xs text-slate mb-1.5">
          <span>{label}</span>
          <span>{pct}%</span>
        </div>
      )}
      <div className="h-1.5 w-full rounded-full bg-ink/[0.07] overflow-hidden">
        <div
          className={`h-full rounded-full ${toneClass} transition-[width] duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
