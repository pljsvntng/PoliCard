export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center text-center gap-3 py-16 px-6 border border-dashed border-line-strong rounded-lg">
      {Icon && (
        <div className="w-11 h-11 rounded-full bg-teal/[0.08] flex items-center justify-center text-teal">
          <Icon size={20} />
        </div>
      )}
      <h3 className="font-display text-lg text-ink">{title}</h3>
      {description && <p className="text-sm text-slate max-w-sm">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
