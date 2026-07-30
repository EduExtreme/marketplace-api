import type { TranslationKey } from "./i18n/useI18n";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type ApiCategoryId =
  | "dados"
  | "financeiro"
  | "geolocalizacao"
  | "comunicacao"
  | "utilidades";

export interface ApiCategoryConfig {
  id: ApiCategoryId;
  labelKey: TranslationKey;
}

export interface ApiEndpoint {
  id: string;
  method: HttpMethod;
  path: string;
  description: string;
}

export interface ApiProvider {
  id: string;
  name: string;
  shortDescription: string;
  longDescription: string;
  baseUrl: string | null;
  categoryId: ApiCategoryId;
  unlockPriceBRL: number;
  stripePriceId: string;
  endpoints: ApiEndpoint[];
}

export interface AdminCredentialEntry {
  provider: ApiProvider;
  configured: boolean;
  secretPreview: string | null;
  tokenConfigured: boolean;
  tokenPreview: string | null;
  updatedAt: string | null;
}
