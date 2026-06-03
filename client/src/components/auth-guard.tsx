import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "../context/auth/auth-context"
import { dashboardPathForUser, isAdmin } from "@/utils/navigation-utils"

/** Requires an authenticated session. */
export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) return null

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

/** Only for unauthenticated visitors — signed-in users go to their dashboard. */
export function PublicOnlyRoute() {
  const { isAuthenticated, user } = useAuth()

  if (isAuthenticated) {
    return <Navigate to={dashboardPathForUser(user)} replace />
  }

  return <Outlet />
}

/** Admin-only area. Non-admins are bounced to their own dashboard. */
export function AdminRoute() {
  const { user, isLoading } = useAuth()

  if (isLoading) return null
  if (!isAdmin(user)) {
    return <Navigate to={dashboardPathForUser(user)} replace />
  }

  return <Outlet />
}

/** User-only area. Admins are bounced to their own dashboard. */
export function UserRoute() {
  const { user, isLoading } = useAuth()

  if (isLoading) return null
  if (isAdmin(user)) {
    return <Navigate to={dashboardPathForUser(user)} replace />
  }

  return <Outlet />
}
