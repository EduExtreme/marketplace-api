"use client";

import { useDroppable } from "@dnd-kit/core";
import { QualificationCard } from "@/components/leads/qualification-card";
import { useI18n } from "@/lib/i18n/useI18n";
import { cn } from "@/lib/utils";
import type { LeadQualificationStageConfig } from "@/lib/leads/qualification";
import type { BoardLeadItem } from "@/lib/leads/data";

interface QualificationColumnProps {
  stage: LeadQualificationStageConfig;
  leads: BoardLeadItem[];
}

export function QualificationColumn({ stage, leads }: QualificationColumnProps) {
  const { translate } = useI18n();
  const { setNodeRef, isOver } = useDroppable({ id: stage.id });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "w-72 shrink-0 rounded-md border border-border/60 bg-background/40 p-2.5 transition-colors",
        isOver && "border-primary/60 bg-primary/5",
      )}
    >
      <div className="flex items-center justify-between px-1 pb-2.5">
        <h4 className="font-mono text-sm font-semibold text-foreground">{translate({ id: stage.labelKey })}</h4>
        <span className="font-mono text-xs text-muted-foreground">{leads.length}</span>
      </div>
      <div className="flex min-h-24 max-h-[32rem] flex-col gap-2 overflow-y-auto">
        {leads.length === 0 ? (
          <p className="px-1 py-2 text-center text-xs text-muted-foreground">
            {translate({ id: "leads.board.columnEmpty" })}
          </p>
        ) : (
          leads.map((lead) => <QualificationCard key={lead.id} lead={lead} />)
        )}
      </div>
    </div>
  );
}
