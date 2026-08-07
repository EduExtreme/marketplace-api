"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import type { BoardLeadItem } from "@/lib/leads/data";

interface QualificationCardProps {
  lead: BoardLeadItem;
  overlay?: boolean;
}

export function QualificationCard({ lead, overlay = false }: QualificationCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: lead.id });

  return (
    <div
      ref={overlay ? undefined : setNodeRef}
      style={transform ? { transform: CSS.Translate.toString(transform) } : undefined}
      {...(overlay ? {} : listeners)}
      {...(overlay ? {} : attributes)}
      className={cn(
        "touch-none rounded-md border border-border/60 bg-background px-3 py-2.5 font-mono text-xs leading-snug",
        !overlay && "cursor-grab active:cursor-grabbing",
        isDragging && !overlay && "opacity-40",
        overlay && "shadow-lg",
      )}
    >
      <p className="truncate text-sm font-medium text-foreground">{lead.name}</p>
      {lead.category && <p className="mt-0.5 truncate text-muted-foreground">{lead.category}</p>}
      <p className="mt-1.5 truncate text-muted-foreground/80">
        {lead.searchQuery} · {lead.searchLocation}
      </p>
    </div>
  );
}
