export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-zinc-700 rounded ${className ?? ''}`} />
  )
}

export function SkeletonCard() {
  return (
    <div className="flex gap-3 p-3 bg-zinc-800 rounded-lg">
      <Skeleton className="w-24 h-16 shrink-0" />
      <div className="flex-1 space-y-2 py-1">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-1/4" />
      </div>
    </div>
  )
}

export function SkeletonSummary() {
  return (
    <div className="space-y-2 animate-pulse">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <div className="mt-3 space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
        <Skeleton className="h-3 w-4/6" />
      </div>
    </div>
  )
}
