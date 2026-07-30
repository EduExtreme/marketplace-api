import type { TranslationKey } from "@/lib/i18n/useI18n";
import { CREDENTIAL_ERROR_CODES, type CredentialErrorCode } from "@/lib/credentials/errors";

export const CREDENTIAL_ERROR_TRANSLATION_KEYS: Record<CredentialErrorCode, TranslationKey> = {
  [CREDENTIAL_ERROR_CODES.validationError]: "admin.credentials.error.validation_error",
  [CREDENTIAL_ERROR_CODES.forbidden]: "admin.credentials.error.forbidden",
  [CREDENTIAL_ERROR_CODES.unknown]: "admin.credentials.error.unknown",
};
