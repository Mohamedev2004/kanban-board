import { Navigate, Route, Routes } from "react-router-dom"
import { lazy, Suspense } from "react"

import {
  AdminRoute,
  ProtectedRoute,
  PublicOnlyRoute,
  UserRoute,
} from "./components/auth-guard"

// ======================
// Lazy Loaded Pages
// ======================

// Auth
const Login = lazy(() => import("./pages/auth/login"))
const Register = lazy(() => import("./pages/auth/register"))
const ForgotPassword = lazy(() => import("./pages/auth/forgot-password"))
const ResetPassword = lazy(() => import("./pages/auth/reset-password"))

// Settings
const Profile = lazy(() => import("./pages/settings/profile"))
const Password = lazy(() => import("./pages/settings/password"))
const Appearance = lazy(() => import("./pages/settings/appearance"))

// Admin
const AdminDashboard = lazy(() => import("./pages/admin/dashboard"))
const AdminLogs = lazy(() => import("./pages/admin/logs"))

// User
const UserDashboard = lazy(() => import("./pages/user/dashboard"))
const UserKanban = lazy(() => import("./pages/user/kanban"))

// Shared
const NotificationsPage = lazy(() => import("./pages/notifications"))
const RoleDashboard = lazy(() => import("./pages/role-dashboard"))

export function App() {
  return (
    <Suspense fallback={null}>
      <Routes>
        {/* Public routes */}
        <Route element={<PublicOnlyRoute />}>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Route>

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<RoleDashboard />} />

          {/* Settings (any role) */}
          <Route path="/profile" element={<Profile />} />
          <Route path="/password" element={<Password />} />
          <Route path="/appearance" element={<Appearance />} />

          {/* Admin */}
          <Route element={<AdminRoute />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/logs" element={<AdminLogs />} />
            <Route
              path="/admin/notifications"
              element={
                <NotificationsPage
                  dashboardHref="/admin/dashboard"
                  breadcrumbTaglineKey="roles.system"
                  breadcrumbLabelKey="roles.notifications"
                />
              }
            />
          </Route>

          {/* User */}
          <Route element={<UserRoute />}>
            <Route path="/user/dashboard" element={<UserDashboard />} />
            <Route path="/user/kanban" element={<UserKanban />} />
            <Route
              path="/user/notifications"
              element={
                <NotificationsPage
                  dashboardHref="/user/dashboard"
                  breadcrumbTaglineKey="roles.system"
                  breadcrumbLabelKey="roles.notifications"
                />
              }
            />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  )
}

export default App
