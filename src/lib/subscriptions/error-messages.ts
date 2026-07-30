import type { TranslationKey } from "@/lib/i18n/useI18n";
import { SUBSCRIPTION_ERROR_CODES, type SubscriptionErrorCode } from "@/lib/subscriptions/errors";

export const SUBSCRIPTION_ERROR_TRANSLATION_KEYS: Record<SubscriptionErrorCode, TranslationKey> = {
  [SUBSCRIPTION_ERROR_CODES.notFound]: "account.cancelError",
  [SUBSCRIPTION_ERROR_CODES.stripeError]: "account.cancelError",
  [SUBSCRIPTION_ERROR_CODES.unknown]: "account.cancelError",
};
