"use client";

import { useI18n } from "@/lib/i18n/useI18n";
import { AdminNewProviderForm } from "@/components/admin-new-provider-form";

export function AdminHeader() {
  const { translate } = useI18n();

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <h1 className="font-display text-2xl font-semibold text-foreground">{translate({ id: "admin.title" })}</h1>
      <AdminNewProviderForm />
    </div>
  );
}
