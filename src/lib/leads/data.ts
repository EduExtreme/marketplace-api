import "server-only";

import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { leadSearches, leads, type LeadSearch } from "@/lib/db/schema";

export interface RecentSearchSummary {
  id: string;
  query: string;
  location: string;
  status: LeadSearch["status"];
  resultCount: number;
  createdAt: string;
}

export async function listRecentSearches(userId: string, limit = 10): Promise<RecentSearchSummary[]> {
  const rows = await db
    .select({
      id: leadSearches.id,
      query: leadSearches.query,
      location: leadSearches.location,
      status: leadSearches.status,
      createdAt: leadSearches.createdAt,
      resultCount: sql<number>`count(${leads.id})::int`,
    })
    .from(leadSearches)
    .leftJoin(leads, eq(leads.searchId, leadSearches.id))
    .where(eq(leadSearches.userId, userId))
    .groupBy(leadSearches.id)
    .orderBy(desc(leadSearches.createdAt))
    .limit(limit);

  return rows.map((row) => ({ ...row, createdAt: row.createdAt.toISOString() }));
}
