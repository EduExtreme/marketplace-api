import type { TranslationKey } from "@/lib/i18n/useI18n";
import type { LeadSearch } from "@/lib/db/schema";
import { LEADS_ERROR_CODES, type LeadsErrorCode } from "@/lib/leads/errors";

export const LEADS_ERROR_TRANSLATION_KEYS: Record<LeadsErrorCode, TranslationKey> = {
  [LEADS_ERROR_CODES.unauthenticated]: "leads.error.unauthenticated",
  [LEADS_ERROR_CODES.insufficientCredits]: "leads.error.insufficientCredits",
  [LEADS_ERROR_CODES.invalidInput]: "leads.error.invalidInput",
  [LEADS_ERROR_CODES.searchFailed]: "leads.error.searchFailed",
  [LEADS_ERROR_CODES.unknown]: "leads.error.unknown",
};

export const LEADS_STATUS_TRANSLATION_KEYS: Record<LeadSearch["status"], TranslationKey> = {
  pending: "leads.history.status.pending",
  completed: "leads.history.status.completed",
  failed: "leads.history.status.failed",
};
