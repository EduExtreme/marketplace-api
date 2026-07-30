import { HTTP_METHOD_CONFIG } from "@/lib/constants";
import type { HttpMethod } from "@/lib/types";
import { cn } from "@/lib/utils";

interface MethodBadgeProps {
  method: HttpMethod;
  className?: string;
}

export function MethodBadge({ method, className }: MethodBadgeProps) {
  const config = HTTP_METHOD_CONFIG[method];
  return (
    <span className={cn("font-mono text-xs font-semibold tracking-wide", config.className, className)}>
      {config.id}
    </span>
  );
}
