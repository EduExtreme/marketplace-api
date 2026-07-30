import type { TranslationKey } from "@/lib/i18n/useI18n";
import { AUTH_ERROR_CODES, type AuthErrorCode } from "@/lib/auth/errors";

export const AUTH_ERROR_TRANSLATION_KEYS: Record<AuthErrorCode, TranslationKey> = {
  [AUTH_ERROR_CODES.validationError]: "auth.error.validation_error",
  [AUTH_ERROR_CODES.emailTaken]: "auth.error.email_taken",
  [AUTH_ERROR_CODES.invalidCredentials]: "auth.error.invalid_credentials",
  [AUTH_ERROR_CODES.unknown]: "auth.error.unknown",
};
