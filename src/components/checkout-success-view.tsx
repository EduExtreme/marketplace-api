"use client";

import Link from "next/link";
import { TerminalWindow } from "@/components/terminal-window";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/useI18n";

interface CheckoutSuccessViewProps {
  isPaid: boolean;
}

export function CheckoutSuccessView({ isPaid }: CheckoutSuccessViewProps) {
  const { translate } = useI18n();

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-16">
      <TerminalWindow title="checkout/success">
        <h1 className="font-display text-lg font-semibold text-foreground">
          {translate({ id: "checkout.success.title" })}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {translate({ id: isPaid ? "checkout.success.messagePaid" : "checkout.success.messagePending" })}
        </p>
        <Button asChild className="mt-5 w-full">
          <Link href="/account">{translate({ id: "checkout.success.backToAccount" })}</Link>
        </Button>
      </TerminalWindow>
    </main>
  );
}
