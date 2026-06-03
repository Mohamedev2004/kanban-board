/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ReactNode } from "react"
import { Link } from "react-router-dom"
import { GalleryVerticalEnd, Moon, Sun } from "lucide-react"
import { useDirection } from "../context/direction/direction-provider"

import { Button } from "@/components/ui/button"
import { AppFullscreen } from "@/components/app-fullscreen"
import { useTheme } from "@/components/theme-provider"
import { AppLanguage } from "@/components/app-language"

type AuthLayoutProps = {
  children: ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  const { direction, locale, setLocale, t } = useDirection()
  const { theme, setTheme } = useTheme()
  
  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches)

  const toggleTheme = () => setTheme(isDark ? "light" : "dark")

  return (
    <div dir={direction} className="grid min-h-svh lg:grid-cols-2">
      
      {/* LEFT SIDE */}
      <div
      className={[
        "relative hidden bg-primary text-white lg:flex lg:flex-col overflow-hidden",
        direction === "rtl" ? "lg:order-2" : "lg:order-1",
      ].join(" ")}
    >
      {/* Background overlay (optional depth) */}
      <div className="absolute inset-0 bg-primary" />

      {/* IF WE WANNA PUT AN IMAGE */}
      {/* <div className="relative z-10 flex flex-col justify-between h-full">

        <div className="flex flex-1 items-center justify-center">
          <img
            src="/auth-image.svg"
            alt="Auth illustration"
            className="max-w-full h-full object-cover"
          />
        </div>

      </div> */}
    </div>

      {/* RIGHT SIDE */}
      <div
        className={[
          "relative flex items-center justify-center p-6",
          direction === "rtl" ? "lg:order-1" : "lg:order-2",
        ].join(" ")}
      >
        {/* Language Switcher */}
        <div className="absolute top-4 right-4 flex items-center gap-2">

          {/* Language */}
          <AppLanguage
            locale={locale}
            setLocale={(v) => setLocale(v as any)}
          />

          {/* Fullscreen */}
          <AppFullscreen />

          {/* Theme */}
          <Button
            variant="default"
            size="icon"
            onClick={toggleTheme}
            className="size-9 relative"
          >
            <Sun className="size-4 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute size-4 transition-all rotate-90 scale-0 dark:rotate-0 dark:scale-100" />
          </Button>
        </div>

        {/* CONTENT */}
        <div className="w-full max-w-sm space-y-6">

          {/* Logo */}
          <div className="flex items-center gap-2 self-center justify-center font-medium">
            <div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <GalleryVerticalEnd className="size-4" />
            </div>
            {t("shell.appName")}.
          </div>

          {/* Page Content (Form) */}
          {children}

          {/* Terms */}
          <p className="text-center text-xs text-muted-foreground">
            By clicking continue, you agree to our{" "}
            <Link to="/terms" className="underline underline-offset-4 hover:text-primary">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link to="/privacy" className="underline underline-offset-4 hover:text-primary">
              Privacy Policy
            </Link>.
          </p>

        </div>
      </div>
    </div>
  )
}