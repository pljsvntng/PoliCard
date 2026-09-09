const VARIANTS = {
  primary:
    "bg-teal text-white shadow-[0_2px_0_0_rgba(0,0,0,0.12),var(--shadow-soft)] hover:bg-teal-deep hover:shadow-[0_2px_0_0_rgba(0,0,0,0.12),var(--shadow-lift)] active:translate-y-px",
  secondary:
    "bg-paper text-ink border-2 border-line-strong hover:border-teal hover:text-teal-deep hover:bg-teal/[0.04]",
  ghost: "bg-transparent text-slate hover:text-ink hover:bg-ink/[0.05]",
  danger: "bg-transparent text-rose border-2 border-rose/25 hover:bg-rose/[0.08] hover:border-rose/50",
  success:
    "bg-moss text-white shadow-[0_2px_0_0_rgba(0,0,0,0.12),var(--shadow-soft)] hover:brightness-105 active:translate-y-px",
};

const SIZES = {
  sm: "px-3.5 py-1.5 text-sm rounded-xl",
  md: "px-5 py-2.5 text-sm rounded-xl",
  lg: "px-6 py-3.5 text-base rounded-2xl",
};

export default function Button({
  as: Tag = "button",
  variant = "primary",
  size = "md",
  className = "",
  icon: Icon,
  iconRight: IconRight,
  children,
  ...props
}) {
  return (
    <Tag
      className={`press-effect inline-flex items-center justify-center gap-2 font-semibold transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {Icon && <Icon size={16} className="shrink-0" />}
      {children}
      {IconRight && <IconRight size={16} className="shrink-0" />}
    </Tag>
  );
}
