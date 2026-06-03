import { useAuth } from "../context/auth/auth-context"
import { isAdmin } from "@/utils/navigation-utils"
import AdminDashboard from "./admin/dashboard"
import UserDashboard from "./user/dashboard"

export default function RoleDashboard() {
  const { user } = useAuth()

  if (!user) return null

  return isAdmin(user) ? <AdminDashboard /> : <UserDashboard />
}
