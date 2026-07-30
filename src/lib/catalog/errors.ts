export const CATALOG_ERROR_CODES = {
  validationError: "validation_error",
  duplicateId: "duplicate_id",
  forbidden: "forbidden",
  stripeError: "stripe_error",
  notFound: "not_found",
  hasActiveSubscriptions: "has_active_subscriptions",
  unknown: "unknown",
} as const;

export type CatalogErrorCode = (typeof CATALOG_ERROR_CODES)[keyof typeof CATALOG_ERROR_CODES];

export interface CatalogActionState {
  errorCode: CatalogErrorCode | null;
  createdApiProviderId?: string;
  updatedApiProviderId?: string;
}

export interface DeleteProviderActionState {
  errorCode: CatalogErrorCode | null;
  deletedApiProviderId?: string;
}
