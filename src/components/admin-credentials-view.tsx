"use client";

import { useI18n } from "@/lib/i18n/useI18n";
import { AdminCredentialCard } from "@/components/admin-credential-card";
import type { AdminCredentialEntry } from "@/lib/types";

interface AdminCredentialsViewProps {
  entries: AdminCredentialEntry[];
}

export function AdminCredentialsView({ entries }: AdminCredentialsViewProps) {
  const { translate } = useI18n();

  return (
    <section className="flex flex-col gap-4">
      <div>
        <h2 className="font-display text-lg font-semibold text-foreground">
          {translate({ id: "admin.credentials.title" })}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">{translate({ id: "admin.credentials.subtitle" })}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {entries.map((entry) => (
          <AdminCredentialCard key={entry.provider.id} entry={entry} />
        ))}
      </div>
    </section>
  );
}
