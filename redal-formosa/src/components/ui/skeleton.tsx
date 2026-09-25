/** Bloque de carga: pulso suave sobre `surface-muted`, que ya cambia con el tema claro/oscuro. */
export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-control bg-surface-muted ${className}`} aria-hidden="true" />;
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <li key={i} className="card overflow-hidden">
          <Skeleton className="aspect-[4/3] rounded-none" />
          <div className="space-y-3 p-4">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="mt-4 h-9" />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function PageHeaderSkeleton() {
  return (
    <div className="space-y-3 pb-8" aria-hidden="true">
      <Skeleton className="h-9 w-64 max-w-full" />
      <Skeleton className="h-4 w-96 max-w-full" />
    </div>
  );
}

export function MapSkeleton() {
  return (
    <div className="grid gap-4 lg:h-[calc(100dvh-14rem)] lg:min-h-[34rem] lg:grid-cols-[22rem_1fr]" aria-hidden="true">
      <div className="order-2 space-y-3 lg:order-1">
        <Skeleton className="h-11" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card space-y-2 p-4">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ))}
      </div>
      <Skeleton className="order-1 h-[22rem] rounded-sheet lg:order-2 lg:h-auto" />
    </div>
  );
}
