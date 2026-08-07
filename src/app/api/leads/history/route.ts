import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/dal";
import { listRecentSearches, type RecentSearchSummary } from "@/lib/leads/data";
import { LEADS_HISTORY_FETCH_LIMIT } from "@/lib/leads/constants";

export async function GET(): Promise<NextResponse<{ searches: RecentSearchSummary[] } | { error: string }>> {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const searches = await listRecentSearches(user.id, LEADS_HISTORY_FETCH_LIMIT);
  return NextResponse.json({ searches });
}
