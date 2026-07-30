"use client";

import { toast } from "sonner";
import { useI18n } from "@/lib/i18n/useI18n";
import { formatDateTime } from "@/lib/format";
import { TerminalWindow } from "@/components/terminal-window";
import { Button } from "@/components/ui/button";
import { CancelSubscriptionButton } from "@/components/cancel-subscription-button";
import type { ApiProvider } from "@/lib/types";

interface UnlockedEntry {
  provider: ApiProvider;
  apiKey: string;
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd: string | null;
}

interface AccountViewProps {
  email: string;
  unlockedProviders: UnlockedEntry[];
}

export function AccountView({ email, unlockedProviders }: AccountViewProps) {
  const { translate } = useI18n();

  async function handleCopy(apiKey: string): Promise<void> {
    await navigator.clipboard.writeText(apiKey);
    toast.success(translate({ id: "detail.keyCopied" }));
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-16">
      <div>
        <h1 className="font-display text-2xl font-semibold text-foreground">
          {translate({ id: "account.title" })}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{email}</p>
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {translate({ id: "account.purchasedApisTitle" })}
        </h2>

        {unlockedProviders.length === 0 ? (
          <p className="text-sm text-muted-foreground">{translate({ id: "account.emptyState" })}</p>
        ) : (
          <div className="flex flex-col gap-4">
            {unlockedProviders.map(({ provider, apiKey, cancelAtPeriodEnd, currentPeriodEnd }) => (
              <TerminalWindow key={provider.id} title={`${provider.id}.api`}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-display text-sm font-semibold text-foreground">{provider.name}</p>
                    <p className="mt-1 font-mono text-xs text-muted-foreground">{apiKey}</p>
                  </div>
                  <Button variant="secondary" size="sm" onClick={() => handleCopy(apiKey)}>
                    {translate({ id: "detail.copyKey" })}
                  </Button>
                </div>

                <div className="mt-3 flex items-center justify-between gap-3 border-t border-border/60 pt-3">
                  {cancelAtPeriodEnd ? (
                    <p className="font-mono text-xs text-amber-400">
                      {currentPeriodEnd
                        ? translate({
                            id: "account.cancelScheduled",
                            values: { date: formatDateTime(currentPeriodEnd) },
                          })
                        : translate({ id: "account.cancelScheduledNoDate" })}
                    </p>
                  ) : (
                    <>
                      <p className="font-mono text-xs text-emerald-400">
                        {translate({ id: "catalog.unlocked" })}
                      </p>
                      <CancelSubscriptionButton apiProviderId={provider.id} currentPeriodEnd={currentPeriodEnd} />
                    </>
                  )}
                </div>
              </TerminalWindow>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
