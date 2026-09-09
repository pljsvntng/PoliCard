export default function Card({ className = "", children, as: Tag = "div", interactive = false, ...props }) {
  return (
    <Tag
      className={`bg-paper border border-line rounded-2xl shadow-[var(--shadow-soft)] ${
        interactive ? "lift-on-hover cursor-pointer" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </Tag>
  );
}
