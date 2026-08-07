import { Skeleton } from "@/components/ui/skeleton";

interface LeadsTableSkeletonProps {
  rows?: number;
}

export function LeadsTableSkeleton({ rows = 5 }: LeadsTableSkeletonProps) {
  return (
    <table className="w-full text-left font-mono text-xs">
      <tbody>
        {Array.from({ length: rows }).map((_, index) => (
          <tr key={index} className="border-t border-border/60">
            <td className="py-2.5 pr-4">
              <Skeleton className="h-4 w-32" />
            </td>
            <td className="py-2.5 pr-4">
              <Skeleton className="h-4 w-24" />
            </td>
            <td className="py-2.5 pr-4">
              <Skeleton className="h-4 w-40" />
            </td>
            <td className="py-2.5 pr-4">
              <Skeleton className="h-4 w-20" />
            </td>
            <td className="py-2.5">
              <Skeleton className="h-4 w-10" />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
