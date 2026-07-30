import type { TranslationKey } from "@/lib/i18n/useI18n";
import { CATALOG_ERROR_CODES, type CatalogErrorCode } from "@/lib/catalog/errors";

export const CATALOG_ERROR_TRANSLATION_KEYS: Record<CatalogErrorCode, TranslationKey> = {
  [CATALOG_ERROR_CODES.validationError]: "admin.catalog.error.validation_error",
  [CATALOG_ERROR_CODES.duplicateId]: "admin.catalog.error.duplicate_id",
  [CATALOG_ERROR_CODES.forbidden]: "admin.catalog.error.forbidden",
  [CATALOG_ERROR_CODES.stripeError]: "admin.catalog.error.stripe_error",
  [CATALOG_ERROR_CODES.notFound]: "admin.catalog.error.not_found",
  [CATALOG_ERROR_CODES.hasActiveSubscriptions]: "admin.catalog.error.has_active_subscriptions",
  [CATALOG_ERROR_CODES.unknown]: "admin.catalog.error.unknown",
};
