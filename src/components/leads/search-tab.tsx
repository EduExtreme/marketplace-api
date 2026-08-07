"use client";

import { useActionState, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { runLeadSearch } from "@/app/account/leads/actions";
import { TerminalWindow } from "@/components/terminal-window";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LeadDetailsDialog } from "@/components/leads/lead-details-dialog";
import { LeadsTableSkeleton } from "@/components/leads/leads-table-skeleton";
import { useI18n } from "@/lib/i18n/useI18n";
import { LEADS_ERROR_TRANSLATION_KEYS } from "@/lib/leads/error-messages";
import type { LeadResultItem } from "@/lib/leads/errors";
import { buildLeadsCsv, downloadCsv } from "@/lib/leads/export";
import { LEADS_BOARD_QUERY_KEY, LEADS_HISTORY_QUERY_KEY } from "@/lib/leads/query-keys";

export function SearchTab() {
  const { translate } = useI18n();
  const queryClient = useQueryClient();
  const [state, action, pending] = useActionState(runLeadSearch, undefined);
  const [selectedLead, setSelectedLead] = useState<LeadResultItem | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    if (state?.errorCode === null) {
      queryClient.invalidateQueries({ queryKey: LEADS_HISTORY_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: LEADS_BOARD_QUERY_KEY });
    }
  }, [state, queryClient]);

  function handleExportCsv(results: LeadResultItem[]): void {
    downloadCsv(`leads-${Date.now()}.csv`, buildLeadsCsv(results));
  }

  return (
    <TerminalWindow title="leads/busca">
      <form action={action} className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="flex flex-1 flex-col gap-1.5">
          <Label htmlFor="query">{translate({ id: "leads.queryLabel" })}</Label>
          <Input
            id="query"
            name="query"
            placeholder={translate({ id: "leads.queryPlaceholder" })}
            required
            minLength={2}
          />
        </div>
        <div className="flex flex-1 flex-col gap-1.5">
          <Label htmlFor="location">{translate({ id: "leads.locationLabel" })}</Label>
          <Input
            id="location"
            name="location"
            placeholder={translate({ id: "leads.locationPlaceholder" })}
            required
            minLength={2}
          />
        </div>
        <Button type="submit" disabled={pending}>
          {translate({ id: pending ? "leads.searchButton.loading" : "leads.searchButton" })}
        </Button>
      </form>

      {pending && (
        <div className="mt-5 overflow-x-auto">
          <LeadsTableSkeleton rows={6} />
        </div>
      )}

      {!pending && state?.errorCode && (
        <Alert variant="destructive" className="mt-4">
          <AlertDescription>{translate({ id: LEADS_ERROR_TRANSLATION_KEYS[state.errorCode] })}</AlertDescription>
        </Alert>
      )}

      {!pending && state?.errorCode === null && (
        <div className="mt-5">
          <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
            <h3 className="font-display text-sm font-semibold text-foreground">
              {translate({ id: "leads.resultsTitle" })}
            </h3>
            {state.results && state.results.length > 0 && (
              <Button type="button" variant="secondary" onClick={() => handleExportCsv(state.results ?? [])}>
                {translate({ id: "leads.exportCsvButton" })}
              </Button>
            )}
          </div>
          {state.results && state.results.length > 0 ? (
            <>
              <p className="mt-2 text-xs text-muted-foreground">{translate({ id: "leads.table.clickHint" })}</p>
              <div className="mt-2 overflow-x-auto">
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
                    {state.results.map((lead) => (
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
            </>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">{translate({ id: "leads.resultsEmpty" })}</p>
          )}
        </div>
      )}

      <LeadDetailsDialog lead={selectedLead} open={detailsOpen} onOpenChange={setDetailsOpen} />
    </TerminalWindow>
  );
}
