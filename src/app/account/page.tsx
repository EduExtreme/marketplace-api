import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { purchases, unlockedApiKeys } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/dal";
import { listApiProviders } from "@/lib/data";
import { AccountView } from "@/components/account-view";
import type { ApiProvider } from "@/lib/types";

export const metadata: Metadata = {
  title: "Minha conta — HUBApis",
};

interface UnlockedEntry {
  provider: ApiProvider;
  apiKey: string;
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd: string | null;
}

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const [unlocks, providers] = await Promise.all([
    db
      .select({
        apiProviderId: unlockedApiKeys.apiProviderId,
        apiKey: unlockedApiKeys.apiKey,
        cancelAtPeriodEnd: purchases.cancelAtPeriodEnd,
        currentPeriodEnd: purchases.currentPeriodEnd,
      })
      .from(unlockedApiKeys)
      .innerJoin(purchases, eq(unlockedApiKeys.purchaseId, purchases.id))
      .where(eq(unlockedApiKeys.userId, user.id)),
    listApiProviders(),
  ]);

  const unlockedProviders = unlocks.reduce<UnlockedEntry[]>((entries, unlock) => {
    const provider = providers.find((candidate) => candidate.id === unlock.apiProviderId);
    if (provider) {
      entries.push({
        provider,
        apiKey: unlock.apiKey,
        cancelAtPeriodEnd: unlock.cancelAtPeriodEnd,
        currentPeriodEnd: unlock.currentPeriodEnd?.toISOString() ?? null,
      });
    }
    return entries;
  }, []);

  return <AccountView email={user.email} unlockedProviders={unlockedProviders} />;
}
