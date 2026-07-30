export const CREDENTIAL_ERROR_CODES = {
  validationError: "validation_error",
  forbidden: "forbidden",
  unknown: "unknown",
} as const;

export type CredentialErrorCode = (typeof CREDENTIAL_ERROR_CODES)[keyof typeof CREDENTIAL_ERROR_CODES];

export interface CredentialActionState {
  errorCode: CredentialErrorCode | null;
  successApiProviderId?: string;
}
