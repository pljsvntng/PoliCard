export default function Card({ className = "", children, as: Tag = "div", ...props }) {
  return (
    <Tag
      className={`bg-paper border border-line rounded-lg ${className}`}
      {...props}
    >
      {children}
    </Tag>
  );
}
