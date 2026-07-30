import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db/client";
import { providerCredentials } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/dal";
import { listApiProviders } from "@/lib/data";
import { AdminCredentialsView } from "@/components/admin-credentials-view";
import { AdminHeader } from "@/components/admin-header";
import type { AdminCredentialEntry } from "@/lib/types";

export const metadata: Metadata = {
  title: "Administração — HUBApis",
};

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  if (user.role !== "admin") {
    notFound();
  }

  const [credentials, providers] = await Promise.all([
    db
      .select({
        apiProviderId: providerCredentials.apiProviderId,
        secretPreview: providerCredentials.secretPreview,
        tokenPreview: providerCredentials.tokenPreview,
        updatedAt: providerCredentials.updatedAt,
      })
      .from(providerCredentials),
    listApiProviders(),
  ]);

  const credentialsByProviderId = new Map(credentials.map((entry) => [entry.apiProviderId, entry]));

  const entries: AdminCredentialEntry[] = providers.map((provider) => {
    const credential = credentialsByProviderId.get(provider.id);
    return {
      provider,
      configured: Boolean(credential),
      secretPreview: credential?.secretPreview ?? null,
      tokenConfigured: Boolean(credential?.tokenPreview),
      tokenPreview: credential?.tokenPreview ?? null,
      updatedAt: credential?.updatedAt.toISOString() ?? null,
    };
  });

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-10 px-4 py-16 sm:px-6">
      <AdminHeader />
      <AdminCredentialsView entries={entries} />
    </main>
  );
}
