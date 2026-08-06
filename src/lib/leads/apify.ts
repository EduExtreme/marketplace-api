import "server-only";

import { ApifyClient } from "apify-client";
import { APIFY_ACTOR_ID, MAX_RESULTS_PER_SEARCH } from "@/lib/leads/constants";

const apifyToken = process.env.APIFY_TOKEN;

if (!apifyToken) {
  throw new Error("APIFY_TOKEN is not set");
}

const apify = new ApifyClient({ token: apifyToken });

interface GoogleMapsPlaceItem {
  title?: string;
  name?: string;
  phone?: string;
  address?: string;
  categoryName?: string;
}

export interface GoogleMapsSearchResult {
  runId: string;
  places: GoogleMapsPlaceItem[];
}

export async function runGoogleMapsSearch(query: string, location: string): Promise<GoogleMapsSearchResult> {
  const run = await apify.actor(APIFY_ACTOR_ID).call({
    searchStringsArray: [query],
    locationQuery: location,
    maxCrawledPlacesPerSearch: MAX_RESULTS_PER_SEARCH,
  });

  // maxCrawledPlaces não é um limite estrito no Actor — já vimos runs retornarem
  // muito mais do que isso. Aplicamos o teto aqui, na leitura do dataset.
  const { items } = await apify.dataset(run.defaultDatasetId).listItems({ limit: MAX_RESULTS_PER_SEARCH });

  return { runId: run.id, places: items as unknown as GoogleMapsPlaceItem[] };
}
