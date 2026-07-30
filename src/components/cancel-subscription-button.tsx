"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { cancelSubscription } from "@/app/account/actions";
import { useI18n } from "@/lib/i18n/useI18n";
import { SUBSCRIPTION_ERROR_TRANSLATION_KEYS } from "@/lib/subscriptions/error-messages";
import { formatDateTime } from "@/lib/format";
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

interface CancelSubscriptionButtonProps {
  apiProviderId: string;
  currentPeriodEnd: string | null;
}

export function CancelSubscriptionButton({ apiProviderId, currentPeriodEnd }: CancelSubscriptionButtonProps) {
  const { translate } = useI18n();
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(cancelSubscription, undefined);
  const lastCanceledId = useRef<string | null>(null);

  useEffect(() => {
    if (state?.canceledApiProviderId === apiProviderId && lastCanceledId.current !== apiProviderId) {
      lastCanceledId.current = apiProviderId;
      setOpen(false);
    }
  }, [state?.canceledApiProviderId, apiProviderId]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="secondary" size="sm">
          {translate({ id: "account.cancelSubscription" })}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{translate({ id: "account.cancelConfirmTitle" })}</DialogTitle>
          <DialogDescription>
            {currentPeriodEnd
              ? translate({
                  id: "account.cancelConfirmMessage",
                  values: { date: formatDateTime(currentPeriodEnd) },
                })
              : translate({ id: "account.cancelConfirmMessageNoDate" })}
          </DialogDescription>
        </DialogHeader>

        {state?.errorCode && (
          <Alert variant="destructive">
            <AlertDescription>
              {translate({ id: SUBSCRIPTION_ERROR_TRANSLATION_KEYS[state.errorCode] })}
            </AlertDescription>
          </Alert>
        )}

        <form action={action}>
          <input type="hidden" name="apiProviderId" value={apiProviderId} />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              {translate({ id: "account.cancelKeepButton" })}
            </Button>
            <Button type="submit" variant="destructive" disabled={pending}>
              {translate({ id: pending ? "account.cancelPending" : "account.cancelConfirmButton" })}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
