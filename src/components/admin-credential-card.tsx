"use client";

import { useActionState } from "react";
import { updateProviderCredential } from "@/app/account/admin/actions";
import { useI18n } from "@/lib/i18n/useI18n";
import { CREDENTIAL_ERROR_TRANSLATION_KEYS } from "@/lib/credentials/error-messages";
import { formatDateTime } from "@/lib/format";
import { TerminalWindow } from "@/components/terminal-window";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DeleteProviderButton } from "@/components/delete-provider-button";
import { EditProviderButton } from "@/components/edit-provider-button";
import type { AdminCredentialEntry } from "@/lib/types";

interface AdminCredentialCardProps {
  entry: AdminCredentialEntry;
}

export function AdminCredentialCard({ entry }: AdminCredentialCardProps) {
  const { translate } = useI18n();
  const [state, action, pending] = useActionState(updateProviderCredential, undefined);

  return (
    <TerminalWindow title={`${entry.provider.id}.env`}>
      <div className="flex items-start justify-between gap-3">
        <p className="font-display text-sm font-semibold text-foreground break-words">{entry.provider.name}</p>
        <div className="flex shrink-0 items-center gap-1.5">
          <EditProviderButton provider={entry.provider} />
          <DeleteProviderButton apiProviderId={entry.provider.id} providerName={entry.provider.name} />
        </div>
      </div>

      <div className="mt-1">
        {entry.configured ? (
          <span className="font-mono text-xs text-emerald-400 break-all">
            {translate({ id: "admin.credentials.configured", values: { preview: entry.secretPreview ?? "" } })}
          </span>
        ) : (
          <span className="font-mono text-xs text-muted-foreground">
            {translate({ id: "admin.credentials.notConfigured" })}
          </span>
        )}
      </div>

      <div className="mt-1">
        {entry.tokenConfigured ? (
          <span className="font-mono text-xs text-emerald-400 break-all">
            {translate({ id: "admin.credentials.tokenConfigured", values: { preview: entry.tokenPreview ?? "" } })}
          </span>
        ) : (
          <span className="font-mono text-xs text-muted-foreground">
            {translate({ id: "admin.credentials.tokenNotConfigured" })}
          </span>
        )}
      </div>

      {entry.updatedAt && (
        <p className="mt-1 font-mono text-xs text-muted-foreground">
          {translate({ id: "admin.credentials.updatedAt", values: { date: formatDateTime(entry.updatedAt) } })}
        </p>
      )}

      <form action={action} className="mt-4 flex flex-col gap-3">
        <input type="hidden" name="apiProviderId" value={entry.provider.id} />

        {state?.errorCode && (
          <Alert variant="destructive">
            <AlertDescription>
              {translate({ id: CREDENTIAL_ERROR_TRANSLATION_KEYS[state.errorCode] })}
            </AlertDescription>
          </Alert>
        )}
        {state?.successApiProviderId === entry.provider.id && (
          <Alert>
            <AlertDescription>{translate({ id: "admin.credentials.saveSuccess" })}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`secretValue-${entry.provider.id}`}>
            {translate({ id: "admin.credentials.inputLabel" })}
          </Label>
          <Input
            id={`secretValue-${entry.provider.id}`}
            name="secretValue"
            type="password"
            autoComplete="off"
            minLength={8}
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`tokenValue-${entry.provider.id}`}>
            {translate({ id: "admin.credentials.tokenInputLabel" })}
          </Label>
          <Input
            id={`tokenValue-${entry.provider.id}`}
            name="tokenValue"
            type="password"
            autoComplete="off"
            minLength={8}
          />
        </div>
        <Button type="submit" disabled={pending} size="sm" className="self-start">
          {translate({ id: pending ? "admin.credentials.savePending" : "admin.credentials.save" })}
        </Button>
      </form>
    </TerminalWindow>
  );
}
