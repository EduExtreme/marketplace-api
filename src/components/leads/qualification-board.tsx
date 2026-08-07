"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { Button } from "@/components/ui/button";
import { QualificationColumn } from "@/components/leads/qualification-column";
import { QualificationCard } from "@/components/leads/qualification-card";
import { QualificationBoardSkeleton } from "@/components/leads/qualification-board-skeleton";
import { useI18n } from "@/lib/i18n/useI18n";
import { LEAD_QUALIFICATION_STAGES, type LeadQualificationStatus } from "@/lib/leads/qualification";
import type { BoardLeadItem } from "@/lib/leads/data";
import { LEADS_BOARD_QUERY_KEY } from "@/lib/leads/query-keys";

interface QualificationBoardProps {
  isLoggedIn: boolean;
}

async function fetchBoardLeads(): Promise<BoardLeadItem[]> {
  const response = await fetch("/api/leads/board");
  if (!response.ok) {
    throw new Error("board_fetch_failed");
  }
  const data: { leads: BoardLeadItem[] } = await response.json();
  return data.leads;
}

async function moveLead(leadId: string, status: LeadQualificationStatus): Promise<void> {
  const response = await fetch(`/api/leads/board/${leadId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!response.ok) {
    throw new Error("board_move_failed");
  }
}

export function QualificationBoard({ isLoggedIn }: QualificationBoardProps) {
  const { translate } = useI18n();
  const queryClient = useQueryClient();
  const [activeLead, setActiveLead] = useState<BoardLeadItem | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const { data, isLoading, isError } = useQuery({
    queryKey: LEADS_BOARD_QUERY_KEY,
    queryFn: fetchBoardLeads,
    staleTime: 30_000,
    enabled: isLoggedIn,
  });

  const leadsByStage = useMemo(() => {
    const grouped = new Map<LeadQualificationStatus, BoardLeadItem[]>();
    for (const stage of LEAD_QUALIFICATION_STAGES) {
      grouped.set(stage.id, []);
    }
    for (const lead of data ?? []) {
      grouped.get(lead.qualificationStatus)?.push(lead);
    }
    return grouped;
  }, [data]);

  function handleDragStart(event: DragStartEvent): void {
    const lead = data?.find((item) => item.id === event.active.id);
    setActiveLead(lead ?? null);
  }

  async function handleDragEnd(event: DragEndEvent): Promise<void> {
    setActiveLead(null);
    const { active, over } = event;
    if (!over) return;

    const leadId = String(active.id);
    const targetStatus = over.id as LeadQualificationStatus;
    const lead = data?.find((item) => item.id === leadId);
    if (!lead || lead.qualificationStatus === targetStatus) return;

    queryClient.setQueryData<BoardLeadItem[]>(LEADS_BOARD_QUERY_KEY, (previous) =>
      previous?.map((item) => (item.id === leadId ? { ...item, qualificationStatus: targetStatus } : item)),
    );

    try {
      await moveLead(leadId, targetStatus);
    } catch {
      toast.error(translate({ id: "leads.board.moveError" }));
      queryClient.invalidateQueries({ queryKey: LEADS_BOARD_QUERY_KEY });
    }
  }

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-start gap-3">
        <p className="text-sm text-muted-foreground">{translate({ id: "leads.board.loginRequired" })}</p>
        <Link href="/login">
          <Button type="button" variant="secondary">
            {translate({ id: "header.login" })}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h3 className="font-display text-sm font-semibold text-foreground">{translate({ id: "leads.board.title" })}</h3>
      <p className="mt-1 text-xs text-muted-foreground">{translate({ id: "leads.board.subtitle" })}</p>

      {isLoading && (
        <div className="mt-4">
          <QualificationBoardSkeleton />
        </div>
      )}

      {isError && <p className="mt-4 text-sm text-rose-400">{translate({ id: "leads.board.loadError" })}</p>}

      {!isLoading && !isError && (
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
            {LEAD_QUALIFICATION_STAGES.map((stage) => (
              <QualificationColumn key={stage.id} stage={stage} leads={leadsByStage.get(stage.id) ?? []} />
            ))}
          </div>
          <DragOverlay>{activeLead && <QualificationCard lead={activeLead} overlay />}</DragOverlay>
        </DndContext>
      )}
    </div>
  );
}
