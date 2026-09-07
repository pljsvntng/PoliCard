const VARIANTS = {
  primary: "bg-teal text-white hover:bg-teal-deep",
  secondary: "bg-transparent text-ink border border-line-strong hover:border-ink hover:bg-ink/[0.03]",
  ghost: "bg-transparent text-slate hover:text-ink hover:bg-ink/[0.04]",
  danger: "bg-transparent text-rose border border-rose/30 hover:bg-rose/[0.06]",
};

const SIZES = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2.5 text-sm",
  lg: "px-5 py-3 text-base",
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
      className={`inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {Icon && <Icon size={16} className="shrink-0" />}
      {children}
      {IconRight && <IconRight size={16} className="shrink-0" />}
    </Tag>
  );
}
