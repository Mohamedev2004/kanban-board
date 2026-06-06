import { useMemo } from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { CalendarClock, Lock, MoreVertical, Pencil, Trash2 } from "lucide-react"

import type { Task } from "@/api/types/tasks.types"
import type { Locale } from "@/context/direction/direction-provider"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PriorityBadge, TagList, TypeBadge } from "./task-badges"
import { TaskOwnerInfo } from "./task-owner"
import { cn } from "@/utils/ui-utils"

type Translate = (key: string, fallback?: string) => string

type TaskCardProps = {
  task: Task
  locale: Locale
  t: Translate
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
  /** Overdue tasks are system-managed: not draggable, not editable. */
  locked?: boolean
}

function localeTag(locale: Locale) {
  return locale === "ar" ? "ar-MA" : locale === "fr" ? "fr-FR" : "en-US"
}

export function TaskCard({
  task,
  locale,
  t,
  onEdit,
  onDelete,
  locked = false,
}: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id, disabled: locked })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const dueDate = task.due_date ? new Date(task.due_date) : null
  const isOverdue = useMemo(() => {
    if (!dueDate || task.status === "done") return false
    return dueDate.getTime() < Date.now()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task.due_date, task.status])
  const formattedDue = dueDate
    ? dueDate.toLocaleDateString(localeTag(locale), {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group/task-card rounded-lg border bg-card p-3 shadow-sm transition-colors",
        isDragging && "opacity-50 ring-2 ring-primary/40"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        {locked ? (
          <div className="flex-1 text-start">
            <h3 className="line-clamp-2 text-sm font-medium text-foreground">
              {task.title}
            </h3>
          </div>
        ) : (
          <button
            type="button"
            className="flex-1 cursor-grab text-start active:cursor-grabbing"
            {...attributes}
            {...listeners}
          >
            <h3 className="line-clamp-2 text-sm font-medium text-foreground">
              {task.title}
            </h3>
          </button>
        )}

        {locked ? (
          <span
            className="flex size-8 shrink-0 items-center justify-center text-muted-foreground"
            title={t("tasks.overdueLocked")}
            aria-label={t("tasks.overdueLocked")}
          >
            <Lock className="size-4" />
          </span>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                className="shrink-0"
                aria-label={t("common.openActions")}
              >
                <MoreVertical />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => onEdit(task)}>
                <Pencil />
                {t("common.edit")}
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onSelect={() => onDelete(task)}
              >
                <Trash2 />
                {t("common.delete")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <TypeBadge type={task.type} t={t} />
        <PriorityBadge priority={task.priority} t={t} />
      </div>

      {task.description && (
        <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
          {task.description}
        </p>
      )}

      <TagList tags={task.tags} className="mt-2" />

      {formattedDue && (
        <div
          className={cn(
            "mt-3 flex items-center gap-1.5 text-xs",
            isOverdue ? "text-destructive" : "text-muted-foreground"
          )}
        >
          <CalendarClock className="size-3.5" />
          <span>{formattedDue}</span>
          {isOverdue && (
            <span className="font-medium">{t("tasks.overdue")}</span>
          )}
        </div>
      )}

      {task.owner && (
        <div className="mt-3 border-t pt-2">
          <TaskOwnerInfo owner={task.owner} />
        </div>
      )}
    </div>
  )
}
