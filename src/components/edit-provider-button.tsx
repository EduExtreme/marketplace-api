"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Pencil } from "lucide-react";
import { updateApiProvider } from "@/app/account/admin/catalog-actions";
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
import type { ApiProvider } from "@/lib/types";

interface EditProviderButtonProps {
  provider: ApiProvider;
}

function toEndpointDrafts(provider: ApiProvider): EndpointDraft[] {
  if (provider.endpoints.length === 0) {
    return [{ ...EMPTY_ENDPOINT }];
  }
  return provider.endpoints.map((endpoint) => ({ method: endpoint.method, path: endpoint.path }));
}

export function EditProviderButton({ provider }: EditProviderButtonProps) {
  const { translate } = useI18n();
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(updateApiProvider, undefined);
  const [endpoints, setEndpoints] = useState<EndpointDraft[]>(() => toEndpointDrafts(provider));
  const lastUpdatedId = useRef<string | null>(null);

  useEffect(() => {
    if (state?.updatedApiProviderId === provider.id && lastUpdatedId.current !== provider.id) {
      lastUpdatedId.current = provider.id;
      setOpen(false);
    }
  }, [state?.updatedApiProviderId, provider.id]);

  function handleOpenChange(nextOpen: boolean): void {
    if (nextOpen) {
      setEndpoints(toEndpointDrafts(provider));
    }
    setOpen(nextOpen);
  }

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
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="secondary"
          size="icon-sm"
          aria-label={translate({ id: "admin.catalog.editProvider" })}
        >
          <Pencil />
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-lg gap-0 overflow-hidden rounded-lg border-border bg-card p-0 sm:max-w-lg">
        <div className="flex items-center gap-2 border-b border-border bg-secondary/60 px-4 py-2.5">
          <span className="size-2.5 rounded-full bg-rose-500/70" />
          <span className="size-2.5 rounded-full bg-amber-500/70" />
          <span className="size-2.5 rounded-full bg-emerald-500/70" />
          <span className="ml-2 truncate font-mono text-xs text-muted-foreground">{`${provider.id}.sh`}</span>
        </div>

        <div className="max-h-[75vh] overflow-y-auto p-5">
          <DialogHeader className="text-left">
            <DialogTitle className="font-display text-lg font-semibold text-foreground">
              {translate({ id: "admin.catalog.editTitle" })}
            </DialogTitle>
            <DialogDescription>{translate({ id: "admin.catalog.editSubtitle" })}</DialogDescription>
          </DialogHeader>

          <form action={action} className="mt-4 flex flex-col gap-4">
            <input type="hidden" name="apiProviderId" value={provider.id} />
            <input type="hidden" name="endpoints" value={JSON.stringify(endpoints)} readOnly />

            {state?.errorCode && (
              <Alert variant="destructive">
                <AlertDescription>
                  {translate({ id: CATALOG_ERROR_TRANSLATION_KEYS[state.errorCode] })}
                </AlertDescription>
              </Alert>
            )}
            {state?.updatedApiProviderId === provider.id && (
              <Alert>
                <AlertDescription>{translate({ id: "admin.catalog.updateSuccess" })}</AlertDescription>
              </Alert>
            )}

            <div className="flex flex-col gap-1.5">
              <Label htmlFor={`name-${provider.id}`}>{translate({ id: "admin.catalog.nameLabel" })}</Label>
              <Input id={`name-${provider.id}`} name="name" required minLength={2} defaultValue={provider.name} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor={`baseUrl-${provider.id}`}>{translate({ id: "admin.catalog.baseUrlLabel" })}</Label>
              <Input
                id={`baseUrl-${provider.id}`}
                name="baseUrl"
                type="url"
                placeholder="https://"
                defaultValue={provider.baseUrl ?? ""}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor={`apiKey-${provider.id}`}>{translate({ id: "admin.catalog.apiKeyLabel" })}</Label>
                <Input id={`apiKey-${provider.id}`} name="apiKey" type="password" autoComplete="off" minLength={8} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor={`token-${provider.id}`}>{translate({ id: "admin.catalog.tokenLabel" })}</Label>
                <Input id={`token-${provider.id}`} name="token" type="password" autoComplete="off" minLength={8} />
              </div>
            </div>
            <p className="-mt-2 text-xs text-muted-foreground">
              {translate({ id: "admin.catalog.editCredentialsHint" })}
            </p>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor={`unlockPriceBRL-${provider.id}`}>{translate({ id: "admin.catalog.priceLabel" })}</Label>
              <Input
                id={`unlockPriceBRL-${provider.id}`}
                name="unlockPriceBRL"
                type="number"
                min="0.5"
                step="0.01"
                required
                defaultValue={provider.unlockPriceBRL}
              />
            </div>

            <EndpointListEditor
              endpoints={endpoints}
              onUpdate={updateEndpoint}
              onAdd={addEndpoint}
              onRemove={removeEndpoint}
            />

            <Button type="submit" disabled={pending} className="mt-2 self-start">
              {translate({ id: pending ? "admin.catalog.saveChangesPending" : "admin.catalog.saveChanges" })}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
