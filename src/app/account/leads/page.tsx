import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth/dal";
import { getCreditBalance } from "@/lib/leads/credits";
import { LeadsView } from "@/components/leads/leads-view";

export const metadata: Metadata = {
  title: "Geração de Leads — HUBApis",
};

export default async function LeadsPage() {
  const user = await getCurrentUser();
  const balance = user ? await getCreditBalance(user.id) : 0;

  return <LeadsView balance={balance} unlimited={user?.role === "admin"} isLoggedIn={user !== null} />;
}
