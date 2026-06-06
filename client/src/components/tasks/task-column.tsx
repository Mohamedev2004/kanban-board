import { useDroppable } from "@dnd-kit/core"
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { Lock, Plus } from "lucide-react"

import type { Task, TaskStatus } from "@/api/types/tasks.types"
import type { Locale } from "@/context/direction/direction-provider"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TaskCard } from "./task-card"
import { cn } from "@/utils/ui-utils"

type Translate = (key: string, fallback?: string) => string

type TaskColumnProps = {
  status: TaskStatus
  title: string
  tasks: Task[]
  locale: Locale
  t: Translate
  onAddTask: (status: TaskStatus) => void
  onEditTask: (task: Task) => void
  onDeleteTask: (task: Task) => void
  /** Locked columns (overdue) accept no drops and offer no "Add task". */
  locked?: boolean
}

export function TaskColumn({
  status,
  title,
  tasks,
  locale,
  t,
  onAddTask,
  onEditTask,
  onDeleteTask,
  locked = false,
}: TaskColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status, disabled: locked })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col gap-3 rounded-xl border bg-sidebar/40 p-3 transition-colors",
        isOver && "border-primary/50 bg-sidebar/70"
      )}
    >
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          {locked && <Lock className="size-3.5" />}
          <span>{title}</span>
          <Badge variant="ghost">{tasks.length}</Badge>
        </div>
        {!locked && (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onAddTask(status)}
            aria-label={t("kanban.addTask")}
          >
            <Plus />
          </Button>
        )}
      </div>

      <SortableContext
        items={tasks.map((task) => task.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex min-h-[60vh] flex-1 flex-col gap-3">
          {tasks.length === 0 ? (
            <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed bg-sidebar/40 p-6 text-center text-xs text-muted-foreground">
              {t("tasks.empty")}
            </div>
          ) : (
            tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                locale={locale}
                t={t}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
                locked={locked}
              />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  )
}
