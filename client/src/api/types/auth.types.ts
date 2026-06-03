export type Role = "admin" | "user"

export interface User {
  id: number
  username: string
  email: string
  roles: Role[]
}

export interface RegisterPayload {
  username: string
  email: string
  password: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface UpdateProfilePayload {
  username: string
  email: string
}

export interface UpdatePasswordPayload {
  currentPassword: string
  newPassword: string
}

export interface ForgotPasswordPayload {
  email: string
}

export interface ResetPasswordPayload {
  token: string
  password: string
}

export interface AuthEnvelope<T> {
  message: string
  data: T
}

export interface AuthData {
  user: User
  token?: string
}
