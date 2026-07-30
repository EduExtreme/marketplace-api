export const AUTH_ERROR_CODES = {
  validationError: "validation_error",
  emailTaken: "email_taken",
  invalidCredentials: "invalid_credentials",
  unknown: "unknown",
} as const;

export type AuthErrorCode = (typeof AUTH_ERROR_CODES)[keyof typeof AUTH_ERROR_CODES];

export interface AuthActionState {
  errorCode: AuthErrorCode;
}
