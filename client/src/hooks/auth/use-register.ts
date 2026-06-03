import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { useAuth } from "@/context/auth/auth-context"
import { normalizeApiError, getFieldError, getApiMessage, getAuthFieldMessage } from "@/utils/error-utils"
import { dashboardPathForUser } from "@/utils/navigation-utils"
import type { RegisterPayload } from "@/api/types/auth.types"

export function useRegister(t: (key: string) => string) {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<{
    username?: string
    email?: string
    password?: string
    general?: string
  }>({})

  const handleRegister = async (payload: RegisterPayload) => {
    setIsSubmitting(true)
    setErrors({})

    try {
      const user = await register(payload)
      const toastId = toast.success(t("auth.accountCreated"), {
        description: t("auth.accountCreatedDescription"),
        action: {
          label: t("common.close"),
          onClick: () => toast.dismiss(toastId),
        },
      })
      navigate(dashboardPathForUser(user), { replace: true })
    } catch (err) {
      const apiError = normalizeApiError(err)
      const usernameError = getFieldError(apiError, "username")
      const emailError = getFieldError(apiError, "email")
      const passwordError = getFieldError(apiError, "password")

      setErrors({
        username: usernameError
          ? getAuthFieldMessage(t, "auth", "username", usernameError)
          : undefined,
        email: emailError
          ? getAuthFieldMessage(t, "auth", "email", emailError)
          : undefined,
        password: passwordError
          ? getAuthFieldMessage(t, "auth", "password", passwordError)
          : undefined,
        general:
          !usernameError && !emailError && !passwordError
            ? getApiMessage(t, apiError)
            : undefined,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    isSubmitting,
    errors,
    handleRegister,
  }
}
