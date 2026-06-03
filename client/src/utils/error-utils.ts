/**
 * Pure helper functions for handling and translating API errors.
 * 
 * Responsibility: Normalize API errors and provide translated messages.
 * Layer: Utils
 */

export type ApiError = {
  message: string
  status?: number
  code?: string
  errors?: Record<string, string>
}

type Translate = (key: string, fallback?: string) => string

/**
 * Normalizes an unknown error into a standard ApiError object.
 */
export function normalizeApiError(error: unknown): ApiError {
  if (isApiError(error)) {
    return error
  }

  if (error instanceof Error) {
    return { message: error.message }
  }

  return { message: "Something went wrong. Please try again." }
}

/**
 * Checks if an unknown error matches the ApiError structure.
 */
function isApiError(error: unknown): error is ApiError {
  return Boolean(
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof (error as { message?: unknown }).message === "string"
  )
}

/**
 * Gets a specific field error from an ApiError object.
 */
export function getFieldError(error: ApiError, field: string) {
  return error.errors?.[field]
}

/**
 * Returns a translated error message for auth or settings fields.
 */
export function getAuthFieldMessage(
  t: Translate,
  section: "auth" | "settings",
  field: string,
  code?: string
) {
  if (!code) return undefined

  const keyMap: Record<string, string> = {
    [`${section}.email.validation.required`]: `${section}.errors.emailRequired`,
    [`${section}.email.validation.email`]: `${section}.errors.emailInvalid`,
    [`${section}.email.validation.taken`]: `${section}.errors.emailTaken`,
    [`${section}.password.validation.required`]: `${section}.errors.passwordRequired`,
    [`${section}.password.validation.min`]: `${section}.errors.passwordMin`,
    [`${section}.username.validation.required`]: `${section}.errors.usernameRequired`,
    [`${section}.username.validation.min`]: `${section}.errors.usernameMin`,
    "settings.currentPassword.validation.required":
      "settings.errors.currentPasswordRequired",
    "settings.currentPassword.auth.current_password_invalid":
      "settings.errors.currentPasswordInvalid",
    "settings.newPassword.validation.required":
      "settings.errors.newPasswordRequired",
    "settings.newPassword.validation.min": "settings.errors.newPasswordMin",
  }

  const key = keyMap[`${section}.${field}.${code}`]
  return key ? t(key) : undefined
}

/**
 * Returns a translated error message for the whole API error.
 */
export function getApiMessage(t: Translate, error: ApiError) {
  const codeMap: Record<string, string> = {
    invalid_credentials: "auth.errors.invalidCredentials",
    invalid_or_expired_token: "auth.errors.invalidResetToken",
    refresh_token_required: "api.sessionExpired",
    invalid_refresh_token: "api.sessionExpired",
    unauthorized: "api.sessionExpired",
    forbidden: "api.forbidden",
    registration_failed: "api.serverError",
    login_failed: "api.serverError",
    logout_failed: "api.serverError",
    profile_update_failed: "api.serverError",
    password_update_failed: "api.serverError",
    forgot_password_failed: "api.serverError",
    reset_password_failed: "api.serverError",
    invalid_notification_page: "notifications.errors.invalidPage",
    invalid_notification_per_page: "notifications.errors.invalidPerPage",
    invalid_notification_filter: "notifications.errors.invalidFilter",
    invalid_notification_id: "notifications.errors.invalidNotification",
    notifications_list_failed: "notifications.errors.loadFailed",
    notifications_unread_count_failed: "notifications.errors.loadFailed",
    notification_mark_read_failed: "notifications.errors.markReadFailed",
    notifications_mark_all_read_failed:
      "notifications.errors.markAllReadFailed",
    notification_delete_failed: "notifications.errors.deleteFailed",
    center_admin_create_failed: "api.serverError",
    single_center_owner_violation: "api.forbidden",
    center_create_failed: "api.serverError",
    slug_taken: "api.defaultError",
    invalid_status: "api.defaultError",
    primary_center_required: "api.defaultError",
    center_manager_create_failed: "api.serverError",
    invalid_parent_center: "api.defaultError",
    center_scope_denied: "api.forbidden",
    subcenter_create_failed: "api.serverError",
    network_error: "api.networkError",
  }

  const key = error.code ? codeMap[error.code] : undefined
  if (key) return t(key)
  if (error.message === "Network Error") return t("api.networkError")
  return error.message || t("api.defaultError")
}

/**
 * Returns a translated error message for notification-specific fields.
 */
export function getNotificationFieldMessage(
  t: Translate,
  field: string,
  code?: string
) {
  if (!code) return undefined

  const keyMap: Record<string, string> = {
    "page.validation.invalid": "notifications.errors.invalidPage",
    "per_page.validation.invalid": "notifications.errors.invalidPerPage",
    "filter.validation.invalid": "notifications.errors.invalidFilter",
  }

  const key = keyMap[`${field}.${code}`]
  return key ? t(key) : undefined
}
