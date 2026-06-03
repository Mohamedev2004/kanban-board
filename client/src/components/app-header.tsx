/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import * as React from "react"
import { SidebarTrigger } from "../components/ui/sidebar"
import { Separator } from "./ui/separator"
import { Moon, Sun } from "lucide-react"
import { Button } from "./ui/button"

import { useDirection } from "../context/direction/direction-provider"
import { useAuth } from "../context/auth/auth-context"
import { getRolePages } from "@/utils/navigation-utils"
import { AppBreadcrumbs, type BreadcrumbType } from "./app-breadcrumbs"
import { useCommandPalette } from "@/hooks/use-command"
import { AppSearch } from "./app-search"
import { AppLanguage } from "./app-language"
import { CommandPalette } from "./command-palette"
import { useTheme } from "./theme-provider"
import { AppFullscreen } from "./app-fullscreen"

type Props = {
  breadcrumbs: BreadcrumbType[]
}

export function AppHeader({ breadcrumbs }: Props) {
  const { locale, setLocale, t } = useDirection()
  const { user } = useAuth()
  const { open, setOpen } = useCommandPalette()
  const { theme, setTheme } = useTheme()

  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches)

  const toggleTheme = () => setTheme(isDark ? "light" : "dark")

  const roleGroups = React.useMemo(() => {
    if (!user) {
      return [
        {
          label: t("roles.overview"),
          items: [
            {
              title: t("nav.dashboard"),
              url: "/dashboard",
              icon: () => null,
            },
          ],
        },
      ]
    }

    return getRolePages(user, t)
  }, [user, t])

  return (
    <>
      <header className="flex h-16 shrink-0 items-center justify-between sticky top-0 z-20 border-b bg-background">
        {/* LEFT */}
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <AppBreadcrumbs breadcrumbs={breadcrumbs} />
        </div>

        {/* RIGHT */}
        <div className="mx-4 flex items-center gap-2">
          <AppSearch onClick={() => setOpen(true)} label={t("shell.search")} />

          <AppLanguage locale={locale} setLocale={(v) => setLocale(v as any)} />

          <AppFullscreen />

          <Button
            variant="default"
            size="icon"
            onClick={toggleTheme}
            className="size-9"
          >
            <Sun className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      </header>

      <CommandPalette open={open} setOpen={setOpen} groups={roleGroups} t={t} />
    </>
  )
}
