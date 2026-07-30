import "server-only";

import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { apiEndpoints, apiProviders } from "@/lib/db/schema";
import type { ApiEndpoint, ApiProvider } from "./types";

function toApiProvider(
  provider: typeof apiProviders.$inferSelect,
  endpoints: (typeof apiEndpoints.$inferSelect)[],
): ApiProvider {
  const sortedEndpoints: ApiEndpoint[] = endpoints
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((endpoint) => ({
      id: endpoint.id,
      method: endpoint.method,
      path: endpoint.path,
      description: endpoint.description,
    }));

  return {
    id: provider.id,
    name: provider.name,
    shortDescription: provider.shortDescription,
    longDescription: provider.longDescription,
    baseUrl: provider.baseUrl,
    categoryId: provider.categoryId,
    unlockPriceBRL: provider.unlockPriceCents / 100,
    stripePriceId: provider.stripePriceId,
    endpoints: sortedEndpoints,
  };
}

export async function listApiProviders(): Promise<ApiProvider[]> {
  const [providers, endpoints] = await Promise.all([
    db.select().from(apiProviders).orderBy(asc(apiProviders.createdAt)),
    db.select().from(apiEndpoints),
  ]);

  const endpointsByProviderId = new Map<string, (typeof endpoints)>();
  for (const endpoint of endpoints) {
    const list = endpointsByProviderId.get(endpoint.apiProviderId) ?? [];
    list.push(endpoint);
    endpointsByProviderId.set(endpoint.apiProviderId, list);
  }

  return providers.map((provider) => toApiProvider(provider, endpointsByProviderId.get(provider.id) ?? []));
}

export async function getApiProviderById(id: string): Promise<ApiProvider | null> {
  const [provider] = await db.select().from(apiProviders).where(eq(apiProviders.id, id)).limit(1);
  if (!provider) return null;

  const endpoints = await db.select().from(apiEndpoints).where(eq(apiEndpoints.apiProviderId, id));

  return toApiProvider(provider, endpoints);
}
