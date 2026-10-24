export default function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton rounded-lg ${className}`} />;
}

export function MovieCardSkeleton() {
  return (
    <div className="rounded-xl overflow-hidden bg-[var(--color-bg-card)]">
      <Skeleton className="aspect-video w-full" />
      <div className="p-2.5 space-y-2">
        <Skeleton className="h-3.5 w-3/4" />
        <Skeleton className="h-2.5 w-1/2" />
      </div>
    </div>
  );
}

export function MovieGridSkeleton({ count = 10 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {[...Array(count)].map((_, i) => (
        <MovieCardSkeleton key={i} />
      ))}
    </div>
  );
}
