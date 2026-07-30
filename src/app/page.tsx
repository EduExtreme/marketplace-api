import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { unlockedApiKeys } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/dal";
import { listApiProviders } from "@/lib/data";
import { CatalogView } from "@/components/catalog-view";

export default async function Home() {
  const user = await getCurrentUser();
  const providers = await listApiProviders();

  let unlocks: Record<string, string> = {};
  if (user) {
    const rows = await db
      .select({ apiProviderId: unlockedApiKeys.apiProviderId, apiKey: unlockedApiKeys.apiKey })
      .from(unlockedApiKeys)
      .where(eq(unlockedApiKeys.userId, user.id));
    unlocks = Object.fromEntries(rows.map((row) => [row.apiProviderId, row.apiKey]));
  }

  return <CatalogView isLoggedIn={user !== null} unlocks={unlocks} providers={providers} />;
}
