import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/dal";
import { getCreditBalance } from "@/lib/leads/credits";
import { listRecentSearches } from "@/lib/leads/data";
import { LeadsView } from "@/components/leads/leads-view";

export const metadata: Metadata = {
  title: "Geração de Leads — HUBApis",
};

export default async function LeadsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const [balance, recentSearches] = await Promise.all([
    getCreditBalance(user.id),
    listRecentSearches(user.id),
  ]);

  return <LeadsView balance={balance} recentSearches={recentSearches} />;
}
