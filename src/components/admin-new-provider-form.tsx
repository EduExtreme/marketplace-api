"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Plus } from "lucide-react";
import { createApiProvider } from "@/app/account/admin/catalog-actions";
import { useI18n } from "@/lib/i18n/useI18n";
import { CATALOG_ERROR_TRANSLATION_KEYS } from "@/lib/catalog/error-messages";
import { EMPTY_ENDPOINT, type EndpointDraft } from "@/lib/endpoint-draft";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { EndpointListEditor } from "@/components/endpoint-list-editor";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function AdminNewProviderForm() {
  const { translate } = useI18n();
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(createApiProvider, undefined);
  const [endpoints, setEndpoints] = useState<EndpointDraft[]>([{ ...EMPTY_ENDPOINT }]);
  const lastCreatedId = useRef<string | null>(null);

  useEffect(() => {
    if (state?.createdApiProviderId && state.createdApiProviderId !== lastCreatedId.current) {
      lastCreatedId.current = state.createdApiProviderId;
      setOpen(false);
      setEndpoints([{ ...EMPTY_ENDPOINT }]);
    }
  }, [state?.createdApiProviderId]);

  function updateEndpoint(index: number, patch: Partial<EndpointDraft>): void {
    setEndpoints((current) => current.map((endpoint, i) => (i === index ? { ...endpoint, ...patch } : endpoint)));
  }

  function addEndpoint(): void {
    setEndpoints((current) => [...current, { ...EMPTY_ENDPOINT }]);
  }

  function removeEndpoint(index: number): void {
    setEndpoints((current) => current.filter((_, i) => i !== index));
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button">
          <Plus className="size-4" />
          {translate({ id: "admin.catalog.title" })}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-lg gap-0 overflow-hidden rounded-lg border-border bg-card p-0 sm:max-w-lg">
        <div className="flex items-center gap-2 border-b border-border bg-secondary/60 px-4 py-2.5">
          <span className="size-2.5 rounded-full bg-rose-500/70" />
          <span className="size-2.5 rounded-full bg-amber-500/70" />
          <span className="size-2.5 rounded-full bg-emerald-500/70" />
          <span className="ml-2 truncate font-mono text-xs text-muted-foreground">new-service.sh</span>
        </div>

        <div className="max-h-[75vh] overflow-y-auto p-5">
          <DialogHeader className="text-left">
            <DialogTitle className="font-display text-lg font-semibold text-foreground">
              {translate({ id: "admin.catalog.title" })}
            </DialogTitle>
            <DialogDescription>{translate({ id: "admin.catalog.subtitle" })}</DialogDescription>
          </DialogHeader>

          <form action={action} className="mt-4 flex flex-col gap-4">
            <input type="hidden" name="endpoints" value={JSON.stringify(endpoints)} readOnly />

            {state?.errorCode && (
              <Alert variant="destructive">
                <AlertDescription>
                  {translate({ id: CATALOG_ERROR_TRANSLATION_KEYS[state.errorCode] })}
                </AlertDescription>
              </Alert>
            )}
            {state?.createdApiProviderId && (
              <Alert>
                <AlertDescription>
                  {translate({ id: "admin.catalog.createSuccess", values: { id: state.createdApiProviderId } })}
                </AlertDescription>
              </Alert>
            )}

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">{translate({ id: "admin.catalog.nameLabel" })}</Label>
              <Input id="name" name="name" required minLength={2} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="baseUrl">{translate({ id: "admin.catalog.baseUrlLabel" })}</Label>
              <Input id="baseUrl" name="baseUrl" type="url" placeholder="https://" />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="apiKey">{translate({ id: "admin.catalog.apiKeyLabel" })}</Label>
                <Input id="apiKey" name="apiKey" type="password" autoComplete="off" required minLength={8} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="token">{translate({ id: "admin.catalog.tokenLabel" })}</Label>
                <Input id="token" name="token" type="password" autoComplete="off" minLength={8} />
              </div>
            </div>
            <p className="-mt-2 text-xs text-muted-foreground">{translate({ id: "admin.catalog.apiKeyHint" })}</p>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="unlockPriceBRL">{translate({ id: "admin.catalog.priceLabel" })}</Label>
              <Input id="unlockPriceBRL" name="unlockPriceBRL" type="number" min="0.5" step="0.01" required />
            </div>

            <EndpointListEditor
              endpoints={endpoints}
              onUpdate={updateEndpoint}
              onAdd={addEndpoint}
              onRemove={removeEndpoint}
            />

            <Button type="submit" disabled={pending} className="mt-2 self-start">
              {translate({ id: pending ? "admin.catalog.createPending" : "admin.catalog.create" })}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
