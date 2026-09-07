export function SkeletonLine({ className = "" }) {
  return <div className={`animate-pulse rounded bg-ink/[0.07] ${className}`} />;
}

export function SkeletonCard() {
  return (
    <div className="border border-line rounded-lg p-5 bg-paper space-y-3">
      <SkeletonLine className="h-4 w-2/3" />
      <SkeletonLine className="h-3 w-full" />
      <SkeletonLine className="h-3 w-4/5" />
      <SkeletonLine className="h-2 w-full mt-4" />
    </div>
  );
}

export function SkeletonGrid({ count = 3 }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
