"use client";

import { ArrowRight, CheckCircle2, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { MethodBadge } from "@/components/method-badge";
import { API_CATEGORIES } from "@/lib/constants";
import { formatPriceBRL } from "@/lib/format";
import { useI18n } from "@/lib/i18n/useI18n";
import type { ApiProvider } from "@/lib/types";

interface ApiCardProps {
  provider: ApiProvider;
  onSelect: (id: string) => void;
  isUnlocked?: boolean;
}

export function ApiCard({ provider, onSelect, isUnlocked = false }: ApiCardProps) {
  const { translate } = useI18n();
  const category = API_CATEGORIES[provider.categoryId];
  const visibleEndpoints = provider.endpoints.slice(0, 2);
  const remaining = provider.endpoints.length - visibleEndpoints.length;

  return (
    <button
      type="button"
      onClick={() => onSelect(provider.id)}
      className="group flex cursor-pointer flex-col gap-4 rounded-lg border border-border bg-card p-5 text-left transition-colors hover:border-primary/40 hover:bg-secondary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display text-base font-semibold text-foreground">{provider.name}</h3>
        <Badge variant="secondary" className="shrink-0 font-mono text-[10px] uppercase tracking-wide">
          {translate({ id: category.labelKey })}
        </Badge>
      </div>

      <p className="text-sm text-muted-foreground">{provider.shortDescription}</p>

      <div className="flex flex-col gap-1.5 rounded-md border border-border/60 bg-background/40 px-3 py-2.5">
        {visibleEndpoints.map((endpoint) => (
          <div key={endpoint.id} className="flex items-center gap-2 font-mono text-xs">
            <MethodBadge method={endpoint.method} className="w-14 shrink-0" />
            <span className="truncate text-muted-foreground">{endpoint.path}</span>
          </div>
        ))}
        {remaining > 0 && (
          <span className="font-mono text-xs text-muted-foreground/70">
            {translate({ id: "catalog.moreEndpoints", values: { count: remaining } })}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-border/60 pt-3">
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {isUnlocked ? (
            <>
              <CheckCircle2 className="size-3.5 text-primary" />
              {translate({ id: "catalog.unlocked" })}
            </>
          ) : (
            <>
              <Lock className="size-3.5" />
              {formatPriceBRL(provider.unlockPriceBRL)}
              {translate({ id: "catalog.perMonth" })}
            </>
          )}
        </span>
        <span className="flex items-center gap-1 text-xs font-medium text-primary">
          {translate({ id: "catalog.viewDetails" })}
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </button>
  );
}
