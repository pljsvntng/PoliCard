export default function ProgressBar({ value, max, tone = "teal", label }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  const toneClass = {
    teal: "bg-gradient-to-r from-teal to-teal-deep",
    amber: "bg-gradient-to-r from-amber to-[#ff8a1f]",
    moss: "bg-gradient-to-r from-moss to-[#12a366]",
    rose: "bg-gradient-to-r from-rose to-[#e8384a]",
  }[tone];
  return (
    <div>
      {label && (
        <div className="flex justify-between text-xs text-slate mb-1.5 font-medium">
          <span>{label}</span>
          <span className="font-mono">{pct}%</span>
        </div>
      )}
      <div className="h-2.5 w-full rounded-full bg-ink/[0.06] overflow-hidden">
        <div
          className={`h-full rounded-full ${toneClass} transition-[width] duration-500 ease-out`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
