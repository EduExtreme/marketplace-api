"use client";

import { useActionState, useState } from "react";
import { toast } from "sonner";
import { runLeadSearch } from "@/app/account/leads/actions";
import { TerminalWindow } from "@/components/terminal-window";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useI18n } from "@/lib/i18n/useI18n";
import { LEADS_ERROR_TRANSLATION_KEYS, LEADS_STATUS_TRANSLATION_KEYS } from "@/lib/leads/error-messages";
import type { RecentSearchSummary } from "@/lib/leads/data";
import { formatDateTime } from "@/lib/format";

interface LeadsViewProps {
  balance: number;
  recentSearches: RecentSearchSummary[];
}

export function LeadsView({ balance, recentSearches }: LeadsViewProps) {
  const { translate } = useI18n();
  const [state, action, pending] = useActionState(runLeadSearch, undefined);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isBuyingCredits, setIsBuyingCredits] = useState(false);

  async function handleSubscribe(): Promise<void> {
    setIsSubscribing(true);
    try {
      const response = await fetch("/api/leads/subscribe", { method: "POST" });
      if (!response.ok) throw new Error("checkout_failed");
      const data: { url: string } = await response.json();
      window.location.href = data.url;
    } catch {
      setIsSubscribing(false);
      toast.error(translate({ id: "leads.checkoutError" }));
    }
  }

  async function handleBuyCredits(): Promise<void> {
    setIsBuyingCredits(true);
    try {
      const response = await fetch("/api/leads/credits/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: 1 }),
      });
      if (!response.ok) throw new Error("checkout_failed");
      const data: { url: string } = await response.json();
      window.location.href = data.url;
    } catch {
      setIsBuyingCredits(false);
      toast.error(translate({ id: "leads.checkoutError" }));
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-16">
      <div>
        <h1 className="font-display text-2xl font-semibold text-foreground">{translate({ id: "leads.title" })}</h1>
      </div>

      <TerminalWindow title="leads/saldo">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-muted-foreground">{translate({ id: "leads.balanceLabel" })}</p>
            <p className="font-display text-2xl font-semibold text-foreground">{balance}</p>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="secondary" disabled={isBuyingCredits} onClick={handleBuyCredits}>
              {translate({ id: isBuyingCredits ? "leads.buyCreditsButton.loading" : "leads.buyCreditsButton" })}
            </Button>
            <Button type="button" disabled={isSubscribing} onClick={handleSubscribe}>
              {translate({ id: isSubscribing ? "leads.subscribeButton.loading" : "leads.subscribeButton" })}
            </Button>
          </div>
        </div>
      </TerminalWindow>

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

        {state?.errorCode && (
          <Alert variant="destructive" className="mt-4">
            <AlertDescription>{translate({ id: LEADS_ERROR_TRANSLATION_KEYS[state.errorCode] })}</AlertDescription>
          </Alert>
        )}

        {state?.errorCode === null && (
          <div className="mt-5">
            <h3 className="font-display text-sm font-semibold text-foreground">
              {translate({ id: "leads.resultsTitle" })}
            </h3>
            {state.results && state.results.length > 0 ? (
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-left font-mono text-xs">
                  <thead className="text-muted-foreground">
                    <tr>
                      <th className="pb-2 pr-4">{translate({ id: "leads.table.name" })}</th>
                      <th className="pb-2 pr-4">{translate({ id: "leads.table.phone" })}</th>
                      <th className="pb-2 pr-4">{translate({ id: "leads.table.address" })}</th>
                      <th className="pb-2">{translate({ id: "leads.table.category" })}</th>
                    </tr>
                  </thead>
                  <tbody className="text-foreground">
                    {state.results.map((lead) => (
                      <tr key={lead.id} className="border-t border-border/60">
                        <td className="py-2 pr-4">{lead.name}</td>
                        <td className="py-2 pr-4">{lead.phone ?? "—"}</td>
                        <td className="py-2 pr-4">{lead.address ?? "—"}</td>
                        <td className="py-2">{lead.category ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">{translate({ id: "leads.resultsEmpty" })}</p>
            )}
          </div>
        )}
      </TerminalWindow>

      <TerminalWindow title="leads/historico">
        <h3 className="font-display text-sm font-semibold text-foreground">{translate({ id: "leads.historyTitle" })}</h3>
        {recentSearches.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">{translate({ id: "leads.historyEmpty" })}</p>
        ) : (
          <div className="mt-3 flex flex-col gap-2">
            {recentSearches.map((search) => (
              <div
                key={search.id}
                className="flex items-center justify-between gap-3 rounded-md border border-border/60 bg-background/40 px-3 py-2.5 font-mono text-xs"
              >
                <div>
                  <p className="text-foreground">
                    {search.query} · {search.location}
                  </p>
                  <p className="mt-0.5 text-muted-foreground">{formatDateTime(search.createdAt)}</p>
                </div>
                <div className="text-right">
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
            ))}
          </div>
        )}
      </TerminalWindow>
    </main>
  );
}
