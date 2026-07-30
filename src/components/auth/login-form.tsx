"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login } from "@/app/(auth)/actions";
import { useI18n } from "@/lib/i18n/useI18n";
import { AUTH_ERROR_TRANSLATION_KEYS } from "@/lib/auth/error-messages";
import { TerminalWindow } from "@/components/terminal-window";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function LoginForm() {
  const { translate } = useI18n();
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <TerminalWindow title="login.sh">
      <h1 className="font-display text-lg font-semibold text-foreground">
        {translate({ id: "auth.login.title" })}
      </h1>
      <form action={action} className="mt-5 flex flex-col gap-4">
        {state?.errorCode && (
          <Alert variant="destructive">
            <AlertDescription>
              {translate({ id: AUTH_ERROR_TRANSLATION_KEYS[state.errorCode] })}
            </AlertDescription>
          </Alert>
        )}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">{translate({ id: "auth.login.emailLabel" })}</Label>
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">{translate({ id: "auth.login.passwordLabel" })}</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            minLength={8}
          />
        </div>
        <Button type="submit" disabled={pending} className="mt-2">
          {translate({ id: pending ? "auth.login.submitPending" : "auth.login.submit" })}
        </Button>
      </form>
      <p className="mt-5 text-sm text-muted-foreground">
        {translate({ id: "auth.login.noAccount" })}{" "}
        <Link href="/signup" className="text-primary hover:underline">
          {translate({ id: "auth.login.signupLink" })}
        </Link>
      </p>
    </TerminalWindow>
  );
}
