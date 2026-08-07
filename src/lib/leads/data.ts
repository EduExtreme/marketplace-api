import "server-only";

import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { leadSearches, leads, type LeadSearch } from "@/lib/db/schema";
import type { LeadResultItem } from "@/lib/leads/errors";
import type { GoogleMapsPlaceItem } from "@/lib/leads/types";
import type { LeadQualificationStatus } from "@/lib/leads/qualification";

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

// Confere o dono da busca via join em vez de um segundo SELECT — evita vazar
// leads de outro usuário para quem tentar adivinhar um searchId.
export async function getSearchLeads(userId: string, searchId: string): Promise<LeadResultItem[]> {
  return db
    .select({
      id: leads.id,
      name: leads.name,
      phone: leads.phone,
      address: leads.address,
      category: leads.category,
      rawData: leads.rawData,
    })
    .from(leads)
    .innerJoin(leadSearches, eq(leads.searchId, leadSearches.id))
    .where(and(eq(leads.searchId, searchId), eq(leadSearches.userId, userId)));
}

export interface BoardLeadItem {
  id: string;
  name: string;
  phone: string | null;
  address: string | null;
  category: string | null;
  rawData: GoogleMapsPlaceItem | null;
  qualificationStatus: LeadQualificationStatus;
  searchQuery: string;
  searchLocation: string;
  createdAt: string;
}

// Todos os leads do usuário, de todas as buscas — base do quadro de qualificação.
export async function listAllLeadsForUser(userId: string): Promise<BoardLeadItem[]> {
  const rows = await db
    .select({
      id: leads.id,
      name: leads.name,
      phone: leads.phone,
      address: leads.address,
      category: leads.category,
      rawData: leads.rawData,
      qualificationStatus: leads.qualificationStatus,
      searchQuery: leadSearches.query,
      searchLocation: leadSearches.location,
      createdAt: leads.createdAt,
    })
    .from(leads)
    .innerJoin(leadSearches, eq(leads.searchId, leadSearches.id))
    .where(eq(leadSearches.userId, userId))
    .orderBy(desc(leads.createdAt));

  return rows.map((row) => ({ ...row, createdAt: row.createdAt.toISOString() }));
}

// Confere o dono do lead via join antes de atualizar — mesma lógica de proteção de getSearchLeads.
export async function updateLeadQualificationStatus(
  userId: string,
  leadId: string,
  status: LeadQualificationStatus,
): Promise<boolean> {
  const [owned] = await db
    .select({ id: leads.id })
    .from(leads)
    .innerJoin(leadSearches, eq(leads.searchId, leadSearches.id))
    .where(and(eq(leads.id, leadId), eq(leadSearches.userId, userId)))
    .limit(1);

  if (!owned) return false;

  await db.update(leads).set({ qualificationStatus: status }).where(eq(leads.id, leadId));
  return true;
}
