/* eslint-disable @typescript-eslint/no-explicit-any */
import type { User } from "@/api/types/auth.types"
import type { RolePageGroup } from "@/types/navigation.types"
import { ChartBar, BellRing, History, KanbanSquare } from "lucide-react"

/**
 * Navigation utility functions.
 *
 * Responsibility: Logic for generating role-based navigation groups and
 * resolving the landing dashboard for a given user.
 * Layer: Utils
 */

export function isAdmin(user: User | null | undefined): boolean {
  return user?.roles.includes("admin") ?? false
}

/** The role-specific dashboard a user should land on. */
export function dashboardPathForUser(user: User | null | undefined): string {
  if (!user) return "/dashboard"
  return isAdmin(user) ? "/admin/dashboard" : "/user/dashboard"
}

/** The role-specific base path (used for building sibling routes). */
export function roleBasePath(user: User | null | undefined): string {
  if (!user) return ""
  return isAdmin(user) ? "/admin" : "/user"
}

export function getRolePages(
  user: User,
  t: (key: string) => any
): RolePageGroup[] {
  if (isAdmin(user)) {
    return [
      {
        label: t("roles.overview"),
        items: [
          {
            title: t("roles.dashboard"),
            url: "/admin/dashboard",
            icon: ChartBar,
          },
        ],
      },
      {
        label: t("roles.system"),
        items: [
          {
            title: t("roles.logs"),
            url: "/admin/logs",
            icon: History,
          },
          {
            title: t("roles.notifications"),
            url: "/admin/notifications",
            icon: BellRing,
          },
        ],
      },
    ]
  }

  // Regular user
  return [
    {
      label: t("roles.overview"),
      items: [
        {
          title: t("roles.dashboard"),
          url: "/user/dashboard",
          icon: ChartBar,
        },
        {
          title: t("roles.kanban"),
          url: "/user/kanban",
          icon: KanbanSquare,
        },
      ],
    },
    {
      label: t("roles.system"),
      items: [
        {
          title: t("roles.notifications"),
          url: "/user/notifications",
          icon: BellRing,
        },
      ],
    },
  ]
}
