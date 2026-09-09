export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center text-center gap-3 py-16 px-6 border-2 border-dashed border-line-strong rounded-3xl bg-paper/60">
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-teal/10 flex items-center justify-center text-teal-deep animate-bounce-in">
          <Icon size={24} />
        </div>
      )}
      <h3 className="font-display text-lg text-ink">{title}</h3>
      {description && <p className="text-sm text-slate max-w-sm">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
