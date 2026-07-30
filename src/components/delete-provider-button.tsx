"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Trash2 } from "lucide-react";
import { deleteApiProvider } from "@/app/account/admin/catalog-actions";
import { useI18n } from "@/lib/i18n/useI18n";
import { CATALOG_ERROR_TRANSLATION_KEYS } from "@/lib/catalog/error-messages";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface DeleteProviderButtonProps {
  apiProviderId: string;
  providerName: string;
}

export function DeleteProviderButton({ apiProviderId, providerName }: DeleteProviderButtonProps) {
  const { translate } = useI18n();
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(deleteApiProvider, undefined);
  const lastDeletedId = useRef<string | null>(null);

  useEffect(() => {
    if (state?.deletedApiProviderId === apiProviderId && lastDeletedId.current !== apiProviderId) {
      lastDeletedId.current = apiProviderId;
      setOpen(false);
    }
  }, [state?.deletedApiProviderId, apiProviderId]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="destructive"
          size="icon-sm"
          aria-label={translate({ id: "admin.credentials.deleteProvider" })}
        >
          <Trash2 />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{translate({ id: "admin.credentials.deleteConfirmTitle" })}</DialogTitle>
          <DialogDescription>
            {translate({ id: "admin.credentials.deleteConfirmMessage", values: { name: providerName } })}
          </DialogDescription>
        </DialogHeader>

        {state?.errorCode && (
          <Alert variant="destructive">
            <AlertDescription>
              {translate({ id: CATALOG_ERROR_TRANSLATION_KEYS[state.errorCode] })}
            </AlertDescription>
          </Alert>
        )}

        <form action={action}>
          <input type="hidden" name="apiProviderId" value={apiProviderId} />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              {translate({ id: "admin.credentials.deleteKeepButton" })}
            </Button>
            <Button type="submit" variant="destructive" disabled={pending}>
              {translate({ id: pending ? "admin.credentials.deletePending" : "admin.credentials.deleteConfirmButton" })}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
