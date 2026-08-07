import { Skeleton } from "@/components/ui/skeleton";

export function QualificationBoardSkeleton() {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="w-72 shrink-0 rounded-md border border-border/60 bg-background/40 p-2.5">
          <Skeleton className="h-3.5 w-20" />
          <div className="mt-2 flex flex-col gap-2">
            <Skeleton className="h-10 w-full" />
            {index === 0 && <Skeleton className="h-10 w-full" />}
          </div>
        </div>
      ))}
    </div>
  );
}
