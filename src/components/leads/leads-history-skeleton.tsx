import { Skeleton } from "@/components/ui/skeleton";

interface LeadsHistorySkeletonProps {
  rows?: number;
}

export function LeadsHistorySkeleton({ rows = 4 }: LeadsHistorySkeletonProps) {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="flex flex-col gap-2 rounded-md border border-border/60 bg-background/40 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3"
        >
          <div className="flex max-w-full flex-col gap-1.5">
            <Skeleton className="h-3.5 w-40 max-w-full sm:w-48" />
            <Skeleton className="h-3 w-28 max-w-full sm:w-32" />
          </div>
          <div className="flex flex-col gap-1.5 sm:items-end">
            <Skeleton className="h-3.5 w-20" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}
