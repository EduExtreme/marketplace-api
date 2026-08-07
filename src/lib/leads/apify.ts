import "server-only";

import { ApifyApiError, ApifyClient } from "apify-client";
import { APIFY_ACTOR_ID } from "@/lib/leads/constants";
import type { GoogleMapsPlaceItem } from "@/lib/leads/types";

function loadApifyTokens(): string[] {
  const raw = process.env.APIFY_TOKENS ?? process.env.APIFY_TOKEN;
  const tokens = raw
    ?.split(",")
    .map((token) => token.trim())
    .filter(Boolean);

  if (!tokens || tokens.length === 0) {
    throw new Error("APIFY_TOKENS (or APIFY_TOKEN) is not set");
  }
  return tokens;
}

const apifyClients = loadApifyTokens().map((token) => new ApifyClient({ token }));

// Índice do último token que funcionou — evita sempre começar pela chave já esgotada.
let activeClientIndex = 0;

function isOutOfUsageError(error: unknown): boolean {
  return error instanceof ApifyApiError && error.type === "not-enough-usage-to-run-paid-actor";
}

export interface GoogleMapsSearchResult {
  runId: string;
  places: GoogleMapsPlaceItem[];
}

export async function runGoogleMapsSearch(
  query: string,
  location: string,
  maxResults: number,
): Promise<GoogleMapsSearchResult> {
  let lastError: unknown;

  for (let attempt = 0; attempt < apifyClients.length; attempt++) {
    const clientIndex = (activeClientIndex + attempt) % apifyClients.length;
    const client = apifyClients[clientIndex];

    try {
      const run = await client.actor(APIFY_ACTOR_ID).call({
        searchStringsArray: [query],
        locationQuery: location,
        maxCrawledPlacesPerSearch: maxResults,
      });

      // maxCrawledPlaces não é um limite estrito no Actor — já vimos runs retornarem
      // muito mais do que isso. Aplicamos o teto aqui, na leitura do dataset.
      const { items } = await client.dataset(run.defaultDatasetId).listItems({ limit: maxResults });

      activeClientIndex = clientIndex;
      return { runId: run.id, places: items as unknown as GoogleMapsPlaceItem[] };
    } catch (error) {
      lastError = error;
      if (!isOutOfUsageError(error)) {
        throw error;
      }
      console.warn(`[leads] Apify token #${clientIndex + 1}/${apifyClients.length} sem saldo, tentando a próxima chave`);
    }
  }

  throw lastError;
}
