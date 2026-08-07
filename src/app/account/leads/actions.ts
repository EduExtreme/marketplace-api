"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db/client";
import { leadSearches, leads } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/dal";
import { runGoogleMapsSearch } from "@/lib/leads/apify";
import { MAX_RESULTS_PER_SEARCH, MAX_RESULTS_PER_SEARCH_EXTENDED } from "@/lib/leads/constants";
import { debitSearchCredit, getCreditBalance, hasPurchasedCredits } from "@/lib/leads/credits";
import { LEADS_ERROR_CODES, type LeadSearchActionState } from "@/lib/leads/errors";

const searchSchema = z.object({
  query: z.string().trim().min(2).max(100),
  location: z.string().trim().min(2).max(100),
});

export async function runLeadSearch(
  _prevState: LeadSearchActionState | undefined,
  formData: FormData,
): Promise<LeadSearchActionState> {
  const user = await getCurrentUser();
  if (!user) {
    return { errorCode: LEADS_ERROR_CODES.unauthenticated };
  }

  const parsed = searchSchema.safeParse({
    query: formData.get("query"),
    location: formData.get("location"),
  });
  if (!parsed.success) {
    return { errorCode: LEADS_ERROR_CODES.invalidInput };
  }

  const { query, location } = parsed.data;

  const isAdmin = user.role === "admin";
  if (!isAdmin) {
    const balance = await getCreditBalance(user.id);
    if (balance < 1) {
      return { errorCode: LEADS_ERROR_CODES.insufficientCredits };
    }
  }

  // Quem já comprou crédito avulso (além da cota da assinatura) recebe buscas maiores.
  const maxResults =
    isAdmin || (await hasPurchasedCredits(user.id)) ? MAX_RESULTS_PER_SEARCH_EXTENDED : MAX_RESULTS_PER_SEARCH;

  const [search] = await db
    .insert(leadSearches)
    .values({ userId: user.id, query, location, maxResults, status: "pending" })
    .returning({ id: leadSearches.id });

  try {
    const { runId, places } = await runGoogleMapsSearch(query, location, maxResults);

    const insertedLeads = places.length
      ? await db
          .insert(leads)
          .values(
            places.map((place) => ({
              searchId: search.id,
              name: place.title ?? place.name ?? "Sem nome",
              phone: place.phone ?? null,
              address: place.address ?? null,
              category: place.categoryName ?? null,
              rawData: place,
            })),
          )
          .returning({
            id: leads.id,
            name: leads.name,
            phone: leads.phone,
            address: leads.address,
            category: leads.category,
            rawData: leads.rawData,
          })
      : [];

    // Só debita crédito depois que o Apify retornou com sucesso.
    await db.update(leadSearches).set({ status: "completed", apifyRunId: runId }).where(eq(leadSearches.id, search.id));
    if (!isAdmin) {
      await debitSearchCredit(user.id, search.id);
    }

    revalidatePath("/account/leads");

    return { errorCode: null, query, location, results: insertedLeads };
  } catch (error) {
    console.error("[leads] search failed", error);
    await db.update(leadSearches).set({ status: "failed" }).where(eq(leadSearches.id, search.id));
    return { errorCode: LEADS_ERROR_CODES.searchFailed };
  }
}
