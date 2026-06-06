import { Badge } from "@/components/ui/badge"
import type {
  TaskPriority,
  TaskStatus,
  TaskType,
} from "@/api/types/tasks.types"
import {
  TASK_PRIORITY_STYLES,
  TASK_STATUS_STYLES,
  TASK_TYPE_STYLES,
} from "@/constants/tasks"
import { cn } from "@/utils/ui-utils"

type Translate = (key: string, fallback?: string) => string

export function StatusBadge({
  status,
  t,
  className,
}: {
  status: TaskStatus
  t: Translate
  className?: string
}) {
  return (
    <Badge
      variant="secondary"
      className={cn(TASK_STATUS_STYLES[status], className)}
    >
      {t(`tasks.status.${status}`)}
    </Badge>
  )
}

export function PriorityBadge({
  priority,
  t,
  className,
}: {
  priority: TaskPriority
  t: Translate
  className?: string
}) {
  return (
    <Badge
      variant="secondary"
      className={cn(TASK_PRIORITY_STYLES[priority], className)}
    >
      {t(`tasks.priority.${priority}`)}
    </Badge>
  )
}

export function TypeBadge({
  type,
  t,
  className,
}: {
  type: TaskType
  t: Translate
  className?: string
}) {
  return (
    <Badge variant="secondary" className={cn(TASK_TYPE_STYLES[type], className)}>
      {t(`tasks.type.${type}`)}
    </Badge>
  )
}

export function TagList({
  tags,
  className,
}: {
  tags: string[]
  className?: string
}) {
  if (!tags.length) return null

  return (
    <div className={cn("flex flex-wrap gap-1", className)}>
      {tags.map((tag) => (
        <Badge key={tag} variant="outline" className="font-normal">
          {tag}
        </Badge>
      ))}
    </div>
  )
}
