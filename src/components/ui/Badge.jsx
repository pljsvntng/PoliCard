const TONES = {
  teal: "bg-teal/10 text-teal-deep border-teal/20",
  amber: "bg-amber/12 text-[#a25f00] border-amber/25",
  moss: "bg-moss/10 text-[#0f7a4c] border-moss/25",
  rose: "bg-rose/10 text-[#c8283a] border-rose/25",
  slate: "bg-ink/[0.05] text-slate border-line",
};

export default function Badge({ tone = "teal", icon: Icon, children, className = "" }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-semibold rounded-full border px-2.5 py-1 ${TONES[tone]} ${className}`}
    >
      {Icon && <Icon size={12} />}
      {children}
    </span>
  );
}
