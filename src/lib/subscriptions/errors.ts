export const SUBSCRIPTION_ERROR_CODES = {
  notFound: "not_found",
  stripeError: "stripe_error",
  unknown: "unknown",
} as const;

export type SubscriptionErrorCode = (typeof SUBSCRIPTION_ERROR_CODES)[keyof typeof SUBSCRIPTION_ERROR_CODES];

export interface SubscriptionActionState {
  errorCode: SubscriptionErrorCode | null;
  canceledApiProviderId?: string;
}
