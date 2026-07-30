"use client";

import Link from "next/link";
import { TerminalWindow } from "@/components/terminal-window";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/useI18n";

export function CheckoutCancelView() {
  const { translate } = useI18n();

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-16">
      <TerminalWindow title="checkout/cancel">
        <h1 className="font-display text-lg font-semibold text-foreground">
          {translate({ id: "checkout.cancel.title" })}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">{translate({ id: "checkout.cancel.message" })}</p>
        <Button asChild className="mt-5 w-full">
          <Link href="/">{translate({ id: "checkout.cancel.backToCatalog" })}</Link>
        </Button>
      </TerminalWindow>
    </main>
  );
}
