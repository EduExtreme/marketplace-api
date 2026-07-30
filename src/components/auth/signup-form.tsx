"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signup } from "@/app/(auth)/actions";
import { useI18n } from "@/lib/i18n/useI18n";
import { AUTH_ERROR_TRANSLATION_KEYS } from "@/lib/auth/error-messages";
import { TerminalWindow } from "@/components/terminal-window";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function SignupForm() {
  const { translate } = useI18n();
  const [state, action, pending] = useActionState(signup, undefined);

  return (
    <TerminalWindow title="signup.sh">
      <h1 className="font-display text-lg font-semibold text-foreground">
        {translate({ id: "auth.signup.title" })}
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
          <Label htmlFor="email">{translate({ id: "auth.signup.emailLabel" })}</Label>
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">{translate({ id: "auth.signup.passwordLabel" })}</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
          />
          <p className="text-xs text-muted-foreground">{translate({ id: "auth.signup.passwordHint" })}</p>
        </div>
        <Button type="submit" disabled={pending} className="mt-2">
          {translate({ id: pending ? "auth.signup.submitPending" : "auth.signup.submit" })}
        </Button>
      </form>
      <p className="mt-5 text-sm text-muted-foreground">
        {translate({ id: "auth.signup.hasAccount" })}{" "}
        <Link href="/login" className="text-primary hover:underline">
          {translate({ id: "auth.signup.loginLink" })}
        </Link>
      </p>
    </TerminalWindow>
  );
}
