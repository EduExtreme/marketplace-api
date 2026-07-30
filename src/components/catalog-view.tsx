"use client";

import { useMemo, useState } from "react";
import { ApiCard } from "@/components/api-card";
import { ApiDetailDialog } from "@/components/api-detail-dialog";
import { TerminalWindow } from "@/components/terminal-window";
import { useI18n } from "@/lib/i18n/useI18n";
import type { ApiProvider } from "@/lib/types";

interface CatalogViewProps {
  isLoggedIn: boolean;
  unlocks: Record<string, string>;
  providers: ApiProvider[];
}

export function CatalogView({ isLoggedIn, unlocks, providers }: CatalogViewProps) {
  const { translate } = useI18n();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedProvider = useMemo(
    () => providers.find((provider) => provider.id === selectedId) ?? null,
    [providers, selectedId],
  );

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-6 py-16">
      <TerminalWindow title="hub — marketplace">
        <p className="font-mono text-xs text-primary">
          {translate({ id: "hero.badge" })}
          <span className="ml-0.5 inline-block h-3.5 w-2 translate-y-0.5 animate-caret-blink bg-primary align-middle" />
        </p>
        <h1 className="mt-4 font-display text-3xl font-semibold text-foreground sm:text-4xl">
          {translate({ id: "hero.title" })}
        </h1>
        <p className="mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
          {translate({ id: "hero.subtitle" })}
        </p>
      </TerminalWindow>

      <section className="flex flex-col gap-5">
        <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {translate({ id: "catalog.title" })}
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {providers.map((provider) => (
            <ApiCard
              key={provider.id}
              provider={provider}
              onSelect={setSelectedId}
              isUnlocked={provider.id in unlocks}
            />
          ))}
        </div>
      </section>

      <footer className="pt-4 text-center text-xs text-muted-foreground/70">
        {translate({ id: "footer.note" })}
      </footer>

      <ApiDetailDialog
        provider={selectedProvider}
        isLoggedIn={isLoggedIn}
        unlockedKey={selectedProvider ? unlocks[selectedProvider.id] : undefined}
        onOpenChange={(open) => {
          if (!open) setSelectedId(null);
        }}
      />
    </main>
  );
}
