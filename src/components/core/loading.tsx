import { Skeleton } from "@/src/components/ui/skeleton";

export function SkeletonLoading() {
  return (
    <div className="space-y-6 p-4 w-full">
      {/* Area Chart Skeleton */}
      <Skeleton className="h-[200px] w-full rounded-xl" />

      {/* Table Skeleton */}
      <div className="space-y-2">
        {/* Header */}
        <Skeleton className="h-6 w-full rounded-md" />

        {/* Rows */}
        {[...Array(12)].map((_, i) => (
          <Skeleton key={i} className="h-4 w-full rounded-md" />
        ))}
      </div>
    </div>
  );
}
