"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LeadDetailsDialog } from "@/components/leads/lead-details-dialog";
import { LeadsTableSkeleton } from "@/components/leads/leads-table-skeleton";
import { useI18n } from "@/lib/i18n/useI18n";
import type { RecentSearchSummary } from "@/lib/leads/data";
import type { LeadResultItem } from "@/lib/leads/errors";
import { leadsSearchDetailsQueryKey } from "@/lib/leads/query-keys";
import { formatDateTime } from "@/lib/format";
import { buildLeadsCsv, downloadCsv } from "@/lib/leads/export";

interface SearchLeadsDialogProps {
  search: RecentSearchSummary | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

async function fetchSearchLeads(searchId: string): Promise<LeadResultItem[]> {
  const response = await fetch(`/api/leads/history/${searchId}`);
  if (!response.ok) {
    throw new Error("search_leads_fetch_failed");
  }
  const data: { leads: LeadResultItem[] } = await response.json();
  return data.leads;
}

export function SearchLeadsDialog({ search, open, onOpenChange }: SearchLeadsDialogProps) {
  const { translate } = useI18n();
  const [selectedLead, setSelectedLead] = useState<LeadResultItem | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const searchId = search?.id ?? "";
  const { data, isLoading, isError } = useQuery({
    queryKey: leadsSearchDetailsQueryKey(searchId),
    queryFn: () => fetchSearchLeads(searchId),
    enabled: open && searchId !== "",
  });

  function handleExportCsv(results: LeadResultItem[]): void {
    downloadCsv(`leads-${Date.now()}.csv`, buildLeadsCsv(results));
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-4xl">
          {search && (
            <>
              <DialogHeader>
                <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <DialogTitle className="break-words">
                      {search.query} · {search.location}
                    </DialogTitle>
                    <DialogDescription>{formatDateTime(search.createdAt)}</DialogDescription>
                  </div>
                  {data && data.length > 0 && (
                    <Button
                      type="button"
                      variant="secondary"
                      className="shrink-0"
                      onClick={() => handleExportCsv(data)}
                    >
                      {translate({ id: "leads.exportCsvButton" })}
                    </Button>
                  )}
                </div>
              </DialogHeader>

              {isLoading && (
                <div className="overflow-x-auto">
                  <LeadsTableSkeleton rows={4} />
                </div>
              )}
              {isError && <p className="text-sm text-rose-400">{translate({ id: "leads.history.loadError" })}</p>}

              {!isLoading && !isError && data && data.length === 0 && (
                <p className="text-sm text-muted-foreground">{translate({ id: "leads.resultsEmpty" })}</p>
              )}

              {!isLoading && !isError && data && data.length > 0 && (
                <div className="max-h-[70vh] overflow-x-auto overflow-y-auto">
                  <table className="w-full text-left font-mono text-xs">
                    <thead className="text-muted-foreground">
                      <tr>
                        <th className="pb-2 pr-4">{translate({ id: "leads.table.name" })}</th>
                        <th className="pb-2 pr-4">{translate({ id: "leads.table.phone" })}</th>
                        <th className="pb-2 pr-4">{translate({ id: "leads.table.address" })}</th>
                        <th className="pb-2 pr-4">{translate({ id: "leads.table.category" })}</th>
                        <th className="pb-2">{translate({ id: "leads.table.rating" })}</th>
                      </tr>
                    </thead>
                    <tbody className="text-foreground">
                      {data.map((lead) => (
                        <tr
                          key={lead.id}
                          onClick={() => {
                            setSelectedLead(lead);
                            setDetailsOpen(true);
                          }}
                          className="cursor-pointer border-t border-border/60 hover:bg-muted/40"
                        >
                          <td className="py-2 pr-4">{lead.name}</td>
                          <td className="py-2 pr-4">{lead.phone ?? "—"}</td>
                          <td className="py-2 pr-4">{lead.address ?? "—"}</td>
                          <td className="py-2 pr-4">{lead.category ?? "—"}</td>
                          <td className="py-2">
                            {lead.rawData?.totalScore != null ? `★ ${lead.rawData.totalScore.toFixed(1)}` : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      <LeadDetailsDialog lead={selectedLead} open={detailsOpen} onOpenChange={setDetailsOpen} />
    </>
  );
}
