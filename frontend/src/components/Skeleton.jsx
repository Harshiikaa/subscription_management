
export const SkeletonLine = ({ className = "h-4 w-full" }) => (
  <div className={`animate-pulse rounded bg-gray-200 ${className}`} />
);

export const SkeletonCard = () => (
  <div className="rounded-lg border border-gray-200 p-6">
    <SkeletonLine className="h-6 w-32" />
    <SkeletonLine className="mt-3 h-8 w-24" />
    <div className="mt-4 space-y-2">
      <SkeletonLine />
      <SkeletonLine />
      <SkeletonLine className="w-1/2" />
    </div>
    <SkeletonLine className="mt-6 h-9 w-full" />
  </div>
);

export const SkeletonTable = ({ rows = 3 }) => (
  <div className="overflow-hidden rounded-md border">
    <div className="bg-gray-50 p-3">
      <SkeletonLine className="h-4 w-40" />
    </div>
    <div className="divide-y divide-gray-100">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-3 p-3">
          <SkeletonLine className="h-4 w-24" />
          <SkeletonLine className="h-4 w-32" />
          <SkeletonLine className="h-4 w-20" />
          <SkeletonLine className="h-4 w-16" />
        </div>
      ))}
    </div>
  </div>
);
