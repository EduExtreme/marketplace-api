"use client";

import { useState } from "react";
import { toast } from "sonner";
import { TerminalWindow } from "@/components/terminal-window";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useI18n } from "@/lib/i18n/useI18n";
import { LEADS_TAB_IDS, LEADS_TABS } from "@/lib/leads/constants";
import { SearchTab } from "@/components/leads/search-tab";
import { HistoryTab } from "@/components/leads/history-tab";
import { QualificationBoard } from "@/components/leads/qualification-board";

interface LeadsViewProps {
  balance: number;
  unlimited?: boolean;
  isLoggedIn: boolean;
}

export function LeadsView({ balance, unlimited = false, isLoggedIn }: LeadsViewProps) {
  const { translate } = useI18n();
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isBuyingCredits, setIsBuyingCredits] = useState(false);

  async function handleSubscribe(): Promise<void> {
    setIsSubscribing(true);
    try {
      const response = await fetch("/api/leads/subscribe", { method: "POST" });
      if (response.status === 401) {
        window.location.href = "/login";
        return;
      }
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
      if (response.status === 401) {
        window.location.href = "/login";
        return;
      }
      if (!response.ok) throw new Error("checkout_failed");
      const data: { url: string } = await response.json();
      window.location.href = data.url;
    } catch {
      setIsBuyingCredits(false);
      toast.error(translate({ id: "leads.checkoutError" }));
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-[88rem] flex-1 flex-col gap-6 px-4 py-10 sm:gap-8 sm:px-6 sm:py-16">
      <div>
        <h1 className="font-display text-2xl font-semibold text-foreground">{translate({ id: "leads.title" })}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{translate({ id: "leads.subtitle" })}</p>
      </div>

      <TerminalWindow title="leads/saldo">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs text-muted-foreground">{translate({ id: "leads.balanceLabel" })}</p>
            <p className="font-display text-2xl font-semibold text-foreground">
              {unlimited ? translate({ id: "leads.balanceUnlimited" }) : balance}
            </p>
          </div>
          {!unlimited && (
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button type="button" variant="secondary" disabled={isBuyingCredits} onClick={handleBuyCredits}>
                {translate({ id: isBuyingCredits ? "leads.buyCreditsButton.loading" : "leads.buyCreditsButton" })}
              </Button>
              <Button type="button" disabled={isSubscribing} onClick={handleSubscribe}>
                {translate({ id: isSubscribing ? "leads.subscribeButton.loading" : "leads.subscribeButton" })}
              </Button>
            </div>
          )}
        </div>
      </TerminalWindow>

      <Tabs defaultValue={LEADS_TAB_IDS.search}>
        <TabsList>
          {LEADS_TABS.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id}>
              {translate({ id: tab.labelKey })}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value={LEADS_TAB_IDS.search}>
          <SearchTab />
        </TabsContent>
        <TabsContent value={LEADS_TAB_IDS.history}>
          <HistoryTab />
        </TabsContent>
        <TabsContent value={LEADS_TAB_IDS.qualification}>
          <TerminalWindow title="leads/qualificacao">
            <QualificationBoard isLoggedIn={isLoggedIn} />
          </TerminalWindow>
        </TabsContent>
      </Tabs>
    </main>
  );
}
