"use client";

import Link from "next/link";
import { logout } from "@/app/(auth)/actions";
import { useI18n } from "@/lib/i18n/useI18n";
import type { UserRole } from "@/lib/db/schema";

interface SiteHeaderClientProps {
  user: { email: string; role: UserRole } | null;
}

export function SiteHeaderClient({ user }: SiteHeaderClientProps) {
  const { translate } = useI18n();

  return (
    <header className="border-b border-border/60">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-display text-sm font-semibold text-foreground">
          {translate({ id: "brand.name" })}
        </Link>
        <nav className="flex items-center gap-4 font-mono text-xs">
          {user ? (
            <>
              <span className="text-muted-foreground">
                {translate({ id: "header.greeting", values: { email: user.email } })}
              </span>
              <Link href="/account" className="text-foreground hover:text-primary">
                {translate({ id: "header.account" })}
              </Link>
              {user.role === "admin" && (
                <Link href="/account/admin" className="text-foreground hover:text-primary">
                  {translate({ id: "header.admin" })}
                </Link>
              )}
              <form action={logout}>
                <button type="submit" className="cursor-pointer text-muted-foreground hover:text-primary">
                  {translate({ id: "header.logout" })}
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="text-muted-foreground hover:text-primary">
                {translate({ id: "header.login" })}
              </Link>
              <Link href="/signup" className="text-primary hover:underline">
                {translate({ id: "header.signup" })}
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
