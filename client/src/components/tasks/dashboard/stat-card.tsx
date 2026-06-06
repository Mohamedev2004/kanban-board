import type { LucideIcon } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/utils/ui-utils"

type StatCardProps = {
  label: string
  value: string | number
  icon?: LucideIcon
  hint?: string
  /** Tailwind classes for the icon tint (bg + text), e.g. "bg-red-500/10 text-red-600". */
  accentClassName?: string
}

/**
 * A compact KPI card: a big tabular value with a muted label and an optional
 * tinted icon. Reused across the user and admin dashboards.
 */
export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  accentClassName,
}: StatCardProps) {
  return (
    <Card size="sm">
      <CardContent className="flex items-center gap-3">
        {Icon && (
          <div
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground",
              accentClassName
            )}
          >
            <Icon className="size-5" />
          </div>
        )}
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-muted-foreground">
            {label}
          </p>
          <p className="text-2xl font-bold tabular-nums text-foreground">
            {value}
          </p>
          {hint && (
            <p className="truncate text-xs text-muted-foreground">{hint}</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
