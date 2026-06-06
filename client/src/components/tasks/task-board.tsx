import { useMemo, useState } from "react"
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core"
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable"

import type {
  CreateTaskPayload,
  Task,
  TaskStatus,
} from "@/api/types/tasks.types"
import { useDirection } from "@/context/direction/direction-provider"
import { Skeleton } from "@/components/ui/skeleton"
import { TASK_BOARD_COLUMNS } from "@/constants/tasks"
import { useTasksBoard } from "@/hooks/tasks/use-tasks-board"
import { useUpdateTaskStatus } from "@/hooks/tasks/use-update-task-status"
import { useCreateTask } from "@/hooks/tasks/use-create-task"
import { useUpdateTask } from "@/hooks/tasks/use-update-task"
import { useDeleteTask } from "@/hooks/tasks/use-delete-task"
import { normalizeApiError } from "@/utils/error-utils"
import { TaskColumn } from "./task-column"
import { TaskCard } from "./task-card"
import { TaskDialog } from "./task-dialog"
import { TaskDeleteDialog } from "./task-delete-dialog"

const COLUMN_TITLE_KEYS: Record<TaskStatus, string> = {
  todo: "kanban.todo",
  in_progress: "kanban.inProgress",
  done: "kanban.done",
  overdue: "kanban.overdue",
}

export function TaskBoard() {
  const { t, locale } = useDirection()

  const boardQuery = useTasksBoard()
  const updateStatusMutation = useUpdateTaskStatus(t)
  const createMutation = useCreateTask(t)
  const updateMutation = useUpdateTask(t)
  const deleteMutation = useDeleteTask(t)

  const [activeTask, setActiveTask] = useState<Task | null>(null)

  // Dialog state.
  const [formOpen, setFormOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [defaultStatus, setDefaultStatus] = useState<TaskStatus | undefined>(
    undefined
  )
  const [serverErrors, setServerErrors] = useState<
    Record<string, string> | undefined
  >(undefined)

  const [deleteTask, setDeleteTask] = useState<Task | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const items = useMemo(() => boardQuery.data?.items ?? [], [boardQuery.data])

  const columns = useMemo(() => {
    const grouped: Record<TaskStatus, Task[]> = {
      todo: [],
      in_progress: [],
      done: [],
      overdue: [],
    }
    for (const task of items) {
      grouped[task.status].push(task)
    }
    return grouped
  }, [items])

  function findTask(id: number): Task | undefined {
    return items.find((task) => task.id === id)
  }

  /** Resolves which column a drop target belongs to (column id or card id). */
  function resolveColumn(overId: string | number): TaskStatus | undefined {
    if (TASK_BOARD_COLUMNS.includes(overId as TaskStatus)) {
      return overId as TaskStatus
    }
    const overTask = findTask(Number(overId))
    return overTask?.status
  }

  function handleDragStart(event: DragStartEvent) {
    const task = findTask(Number(event.active.id))
    setActiveTask(task ?? null)
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveTask(null)
    const { active, over } = event
    if (!over) return

    const task = findTask(Number(active.id))
    if (!task) return

    // Overdue tasks are system-locked: never drag them, and never allow a drop
    // into the overdue column. Defense-in-depth so a stray drop can't fire a
    // request the backend would reject with 409 task_overdue_locked.
    if (task.status === "overdue") return

    const targetStatus = resolveColumn(over.id)
    if (!targetStatus || targetStatus === task.status) return
    if (targetStatus === "overdue") return

    // Optimistic update + rollback are handled inside the mutation hook.
    updateStatusMutation.mutate({ id: task.id, status: targetStatus })
  }

  function openCreateDialog(status?: TaskStatus) {
    setEditingTask(null)
    setDefaultStatus(status)
    setServerErrors(undefined)
    setFormOpen(true)
  }

  function openEditDialog(task: Task) {
    setEditingTask(task)
    setDefaultStatus(undefined)
    setServerErrors(undefined)
    setFormOpen(true)
  }

  function openDeleteDialog(task: Task) {
    setDeleteTask(task)
    setDeleteOpen(true)
  }

  function handleSubmit(payload: CreateTaskPayload) {
    setServerErrors(undefined)
    if (editingTask) {
      updateMutation.mutate(
        { id: editingTask.id, payload },
        {
          onSuccess: () => setFormOpen(false),
          onError: (error) => {
            const apiError = normalizeApiError(error)
            if (apiError.errors) setServerErrors(apiError.errors)
          },
        }
      )
      return
    }

    createMutation.mutate(payload, {
      onSuccess: () => setFormOpen(false),
      onError: (error) => {
        const apiError = normalizeApiError(error)
        if (apiError.errors) setServerErrors(apiError.errors)
      },
    })
  }

  function handleDelete(id: number) {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        setDeleteOpen(false)
        setDeleteTask(null)
      },
    })
  }

  if (boardQuery.isLoading) {
    return (
      <div className="grid flex-1 auto-rows-min gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {TASK_BOARD_COLUMNS.map((status) => (
          <div
            key={status}
            className="flex flex-col gap-3 rounded-xl border bg-sidebar/40 p-3"
          >
            <Skeleton className="h-5 w-24" />
            <div className="flex flex-col gap-3">
              {Array.from({ length: 3 }).map((_, idx) => (
                <Skeleton key={idx} className="h-28 w-full rounded-lg" />
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid flex-1 auto-rows-min gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {TASK_BOARD_COLUMNS.map((status) => (
            <TaskColumn
              key={status}
              status={status}
              title={t(COLUMN_TITLE_KEYS[status])}
              tasks={columns[status]}
              locale={locale}
              t={t}
              onAddTask={openCreateDialog}
              onEditTask={openEditDialog}
              onDeleteTask={openDeleteDialog}
              locked={status === "overdue"}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask ? (
            <TaskCard
              task={activeTask}
              locale={locale}
              t={t}
              onEdit={() => {}}
              onDelete={() => {}}
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      <TaskDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        task={editingTask}
        defaultStatus={defaultStatus}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        serverErrors={serverErrors}
        t={t}
        onSubmit={handleSubmit}
      />

      <TaskDeleteDialog
        task={deleteTask}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        isDeleting={deleteMutation.isPending}
        t={t}
        onConfirm={handleDelete}
      />
    </>
  )
}
