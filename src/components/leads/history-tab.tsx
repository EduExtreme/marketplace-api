"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { TerminalWindow } from "@/components/terminal-window";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SearchLeadsDialog } from "@/components/leads/search-leads-dialog";
import { LeadsHistorySkeleton } from "@/components/leads/leads-history-skeleton";
import { useI18n } from "@/lib/i18n/useI18n";
import { LEADS_STATUS_TRANSLATION_KEYS } from "@/lib/leads/error-messages";
import type { RecentSearchSummary } from "@/lib/leads/data";
import { formatDateTime } from "@/lib/format";
import { LEADS_HISTORY_QUERY_KEY } from "@/lib/leads/query-keys";
import { cn } from "@/lib/utils";

async function fetchLeadsHistory(): Promise<RecentSearchSummary[]> {
  const response = await fetch("/api/leads/history");
  if (!response.ok) {
    throw new Error("history_fetch_failed");
  }
  const data: { searches: RecentSearchSummary[] } = await response.json();
  return data.searches;
}

export function HistoryTab() {
  const { translate } = useI18n();
  const [filter, setFilter] = useState("");
  const [selectedSearch, setSelectedSearch] = useState<RecentSearchSummary | null>(null);
  const [leadsDialogOpen, setLeadsDialogOpen] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: LEADS_HISTORY_QUERY_KEY,
    queryFn: fetchLeadsHistory,
    staleTime: 30_000,
  });

  const filteredSearches = useMemo(() => {
    if (!data) return [];
    const term = filter.trim().toLowerCase();
    if (!term) return data;
    return data.filter(
      (search) => search.query.toLowerCase().includes(term) || search.location.toLowerCase().includes(term),
    );
  }, [data, filter]);

  return (
    <TerminalWindow title="leads/historico">
      <h3 className="font-display text-sm font-semibold text-foreground">{translate({ id: "leads.historyTitle" })}</h3>
      <div className="mt-3 flex flex-col gap-1.5">
        <Label htmlFor="history-filter">{translate({ id: "leads.history.filterLabel" })}</Label>
        <Input
          id="history-filter"
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          placeholder={translate({ id: "leads.history.filterPlaceholder" })}
        />
      </div>

      {isLoading && (
        <div className="mt-4">
          <LeadsHistorySkeleton />
        </div>
      )}

      {isError && <p className="mt-4 text-sm text-rose-400">{translate({ id: "leads.history.loadError" })}</p>}

      {!isLoading && !isError && filteredSearches.length === 0 && (
        <p className="mt-4 text-sm text-muted-foreground">
          {translate({ id: filter ? "leads.history.noMatches" : "leads.historyEmpty" })}
        </p>
      )}

      {!isLoading && !isError && filteredSearches.length > 0 && (
        <>
          <p className="mt-4 text-xs text-muted-foreground">{translate({ id: "leads.history.clickHint" })}</p>
          <div className="mt-2 flex flex-col gap-2">
            {filteredSearches.map((search) => {
              const hasLeads = search.status === "completed" && search.resultCount > 0;
              return (
                <div
                  key={search.id}
                  onClick={() => {
                    if (!hasLeads) return;
                    setSelectedSearch(search);
                    setLeadsDialogOpen(true);
                  }}
                  className={cn(
                    "flex flex-col items-start justify-between gap-2 rounded-md border border-border/60 bg-background/40 px-3 py-2.5 font-mono text-xs sm:flex-row sm:items-center sm:gap-3",
                    hasLeads && "cursor-pointer hover:bg-muted/40",
                  )}
                >
                  <div className="min-w-0">
                    <p className="text-foreground break-words">
                      {search.query} · {search.location}
                    </p>
                    <p className="mt-0.5 text-muted-foreground">{formatDateTime(search.createdAt)}</p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p
                      className={
                        search.status === "completed"
                          ? "text-emerald-400"
                          : search.status === "failed"
                            ? "text-rose-400"
                            : "text-amber-400"
                      }
                    >
                      {translate({ id: LEADS_STATUS_TRANSLATION_KEYS[search.status] })}
                    </p>
                    {search.status === "completed" && (
                      <p className="text-muted-foreground">
                        {translate({ id: "leads.history.resultCount", values: { count: search.resultCount } })}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      <SearchLeadsDialog search={selectedSearch} open={leadsDialogOpen} onOpenChange={setLeadsDialogOpen} />
    </TerminalWindow>
  );
}
