import { type Role } from "@/api/types/auth.types"

/**
 * Role related constants.
 *
 * Responsibility: Static values for role-based labels and configurations.
 * Layer: Constants
 */

export const roleLabels: Record<Role, string> = {
  admin: "roles.admin",
  user: "roles.user",
}
