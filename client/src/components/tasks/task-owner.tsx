import type { TaskOwner } from "@/api/types/tasks.types"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/utils/ui-utils"

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  const first = parts[0]?.[0] ?? ""
  const second = parts.length > 1 ? (parts[1]?.[0] ?? "") : ""
  return (first + second).toUpperCase() || name.slice(0, 2).toUpperCase()
}

type TaskOwnerInfoProps = {
  owner: TaskOwner
  showEmail?: boolean
  className?: string
}

/** Renders a task's owner as an avatar + username (admin views only). */
export function TaskOwnerInfo({
  owner,
  showEmail = false,
  className,
}: TaskOwnerInfoProps) {
  return (
    <div className={cn("flex min-w-0 items-center gap-2", className)}>
      <Avatar size="sm">
        <AvatarFallback>{initials(owner.username)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <p className="truncate text-sm text-foreground">{owner.username}</p>
        {showEmail && (
          <p className="truncate text-xs text-muted-foreground">
            {owner.email}
          </p>
        )}
      </div>
    </div>
  )
}
