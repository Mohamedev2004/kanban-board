export const system = {
  validation: {
    required: "This field is required.",
    email: "Enter a valid email address.",
    min: "Must be at least {min} characters.",
    max: "Must be at most {max} characters.",
    len: "Must be exactly {len} characters.",
    invalid: "Invalid value.",
  },
  api: {
    defaultError: "Something went wrong. Please try again.",
    sessionExpired: "Your session expired. Please sign in again.",
    forbidden: "You do not have permission to do that.",
    serverError: "Something went wrong on our side. Please try again.",
    networkError:
      "Unable to reach the server. Check that the backend is running.",
  },
} as const
