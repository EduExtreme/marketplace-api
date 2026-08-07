import type { TranslationKey } from "@/lib/i18n/useI18n";

// Tag estável usada em purchases.apiProviderId — não existe linha correspondente
// em apiProviders porque este produto não é revendido como API genérica.
export const LEADS_PRODUCT_ID = "geracao-leads";

export const MONTHLY_SEARCH_QUOTA = 50;
export const MAX_RESULTS_PER_SEARCH = 100;
// Quem já comprou crédito avulso (ver hasPurchasedCredits) passa a ter esse teto em vez do padrão.
export const MAX_RESULTS_PER_SEARCH_EXTENDED = 100;
export const CREDIT_PRICE_CENTS = 2000; // R$20,00 por crédito avulso
export const APIFY_ACTOR_ID = "compass/crawler-google-places";
export const LEADS_HISTORY_FETCH_LIMIT = 100;

export const LEADS_TAB_IDS = {
  search: "search",
  history: "history",
  qualification: "qualification",
} as const;

export type LeadsTabId = (typeof LEADS_TAB_IDS)[keyof typeof LEADS_TAB_IDS];

export interface LeadsTabConfig {
  id: LeadsTabId;
  labelKey: TranslationKey;
}

export const LEADS_TABS: LeadsTabConfig[] = [
  { id: LEADS_TAB_IDS.search, labelKey: "leads.tabs.search" },
  { id: LEADS_TAB_IDS.history, labelKey: "leads.tabs.history" },
  { id: LEADS_TAB_IDS.qualification, labelKey: "leads.tabs.qualification" },
];
