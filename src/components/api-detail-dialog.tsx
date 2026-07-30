"use client";

import { useState } from "react";
import Link from "next/link";
import { Copy, Lock } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { MethodBadge } from "@/components/method-badge";
import { API_CATEGORIES } from "@/lib/constants";
import { formatPriceBRL, maskApiKey } from "@/lib/format";
import { useI18n } from "@/lib/i18n/useI18n";
import type { ApiProvider } from "@/lib/types";

interface ApiDetailDialogProps {
  provider: ApiProvider | null;
  isLoggedIn: boolean;
  unlockedKey?: string;
  onOpenChange: (open: boolean) => void;
}

export function ApiDetailDialog({ provider, isLoggedIn, unlockedKey, onOpenChange }: ApiDetailDialogProps) {
  const { translate } = useI18n();
  const [isRedirecting, setIsRedirecting] = useState(false);

  async function handleUnlock(apiProviderId: string): Promise<void> {
    setIsRedirecting(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiProviderId }),
      });

      if (!response.ok) {
        throw new Error("checkout_failed");
      }

      const data: { url: string } = await response.json();
      window.location.href = data.url;
    } catch {
      setIsRedirecting(false);
      toast.error(translate({ id: "detail.unlockError" }));
    }
  }

  async function handleCopy(apiKey: string): Promise<void> {
    await navigator.clipboard.writeText(apiKey);
    toast.success(translate({ id: "detail.keyCopied" }));
  }

  return (
    <Dialog open={provider !== null} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg gap-0 overflow-hidden rounded-lg border-border bg-card p-0 sm:max-w-lg">
        {provider && (
          <>
            <div className="flex items-center gap-2 border-b border-border bg-secondary/60 px-4 py-2.5">
              <span className="size-2.5 rounded-full bg-rose-500/70" />
              <span className="size-2.5 rounded-full bg-amber-500/70" />
              <span className="size-2.5 rounded-full bg-emerald-500/70" />
              <span className="ml-2 truncate font-mono text-xs text-muted-foreground">
                {provider.id}.api
              </span>
            </div>

            <div className="max-h-[75vh] overflow-y-auto p-5">
              <DialogHeader className="flex-row items-center justify-between space-y-0 text-left">
                <DialogTitle className="font-display text-lg font-semibold text-foreground">
                  {provider.name}
                </DialogTitle>
                <Badge variant="secondary" className="font-mono text-[10px] uppercase tracking-wide">
                  {translate({ id: API_CATEGORIES[provider.categoryId].labelKey })}
                </Badge>
              </DialogHeader>

              <p className="mt-2 text-sm text-muted-foreground">{provider.longDescription}</p>

              {provider.baseUrl && (
                <div className="mt-4 flex items-center gap-2 font-mono text-xs text-muted-foreground">
                  <span className="text-foreground/70">{translate({ id: "detail.baseUrl" })}:</span>
                  <span className="truncate">{provider.baseUrl}</span>
                </div>
              )}

              <Separator className="my-5" />

              <h4 className="font-display text-sm font-semibold text-foreground">
                {translate({ id: "detail.endpoints" })}
              </h4>
              <div className="mt-3 flex flex-col gap-2.5">
                {provider.endpoints.map((endpoint) => (
                  <div
                    key={endpoint.id}
                    className="rounded-md border border-border/60 bg-background/40 px-3 py-2.5"
                  >
                    <div className="flex items-center gap-2 font-mono text-xs">
                      <MethodBadge method={endpoint.method} className="w-14 shrink-0" />
                      <span className="text-foreground">{endpoint.path}</span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{endpoint.description}</p>
                  </div>
                ))}
              </div>

              <Separator className="my-5" />

              <h4 className="font-display text-sm font-semibold text-foreground">
                {translate({ id: "detail.keyTitle" })}
              </h4>

              {unlockedKey ? (
                <>
                  <div className="mt-3 flex items-center justify-between gap-3 rounded-md border border-border bg-background/60 px-3 py-3">
                    <span className="truncate font-mono text-sm text-foreground">{unlockedKey}</span>
                    <Button
                      type="button"
                      variant="secondary"
                      size="icon-sm"
                      onClick={() => handleCopy(unlockedKey)}
                      aria-label={translate({ id: "detail.copyKey" })}
                    >
                      <Copy className="size-3.5" />
                    </Button>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">{translate({ id: "detail.keyUnlocked" })}</p>
                </>
              ) : (
                <>
                  <div className="mt-3 flex items-center justify-between gap-3 rounded-md border border-dashed border-border bg-background/60 px-3 py-3">
                    <span className="truncate font-mono text-sm text-muted-foreground/80">
                      {maskApiKey(provider.id)}
                    </span>
                    <Lock className="size-4 shrink-0 text-primary" />
                  </div>

                  {isLoggedIn ? (
                    <>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {translate({ id: "detail.keyLocked" })} ·{" "}
                        {translate({
                          id: "detail.keyLockedHint",
                          values: { price: formatPriceBRL(provider.unlockPriceBRL) },
                        })}
                      </p>
                      <Button
                        type="button"
                        className="mt-3 w-full"
                        disabled={isRedirecting}
                        onClick={() => handleUnlock(provider.id)}
                      >
                        {translate({ id: isRedirecting ? "checkout.unlockButton.loading" : "catalog.unlockKey" })}
                      </Button>
                    </>
                  ) : (
                    <>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {translate({ id: "detail.keyLocked" })} ·{" "}
                        {translate({
                          id: "detail.keyLockedHint",
                          values: { price: formatPriceBRL(provider.unlockPriceBRL) },
                        })}
                      </p>
                      <Button type="button" asChild className="mt-3 w-full">
                        <Link href="/login">{translate({ id: "detail.loginToUnlock" })}</Link>
                      </Button>
                    </>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
