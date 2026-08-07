import type { GoogleMapsPlaceItem } from "@/lib/leads/types";

export const LEADS_ERROR_CODES = {
  unauthenticated: "unauthenticated",
  insufficientCredits: "insufficient_credits",
  invalidInput: "invalid_input",
  searchFailed: "search_failed",
  unknown: "unknown",
} as const;

export type LeadsErrorCode = (typeof LEADS_ERROR_CODES)[keyof typeof LEADS_ERROR_CODES];

export interface LeadResultItem {
  id: string;
  name: string;
  phone: string | null;
  address: string | null;
  category: string | null;
  rawData: GoogleMapsPlaceItem | null;
}

export interface LeadSearchActionState {
  errorCode: LeadsErrorCode | null;
  results?: LeadResultItem[];
  query?: string;
  location?: string;
}
