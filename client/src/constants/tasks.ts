/**
 * Task related constants.
 *
 * Responsibility: Static values for task configurations — option lists for
 * the status/priority/type enums and the Tailwind color maps used by badges.
 * Layer: Constants
 */

import type {
  TaskPriority,
  TaskStatus,
  TaskType,
} from "@/api/types/tasks.types"

export const TASKS_PER_PAGE_OPTIONS = [10, 20, 30, 40, 50] as const

type Option<T extends string> = {
  value: T
  labelKey: string
}

// All statuses, including the system-managed "overdue". Used by the table's
// status FILTER and to resolve badge labels.
export const TASK_STATUS_OPTIONS: Option<TaskStatus>[] = [
  { value: "todo", labelKey: "tasks.status.todo" },
  { value: "in_progress", labelKey: "tasks.status.in_progress" },
  { value: "done", labelKey: "tasks.status.done" },
  { value: "overdue", labelKey: "tasks.status.overdue" },
]

// The manual statuses a user is allowed to choose. "overdue" is set by the
// backend only, so it must never be offered as a manual choice (create/edit
// dialog status select + the table's quick-status dropdown).
export const TASK_MOVABLE_STATUS_OPTIONS: Option<TaskStatus>[] = [
  { value: "todo", labelKey: "tasks.status.todo" },
  { value: "in_progress", labelKey: "tasks.status.in_progress" },
  { value: "done", labelKey: "tasks.status.done" },
]

export const TASK_PRIORITY_OPTIONS: Option<TaskPriority>[] = [
  { value: "low", labelKey: "tasks.priority.low" },
  { value: "medium", labelKey: "tasks.priority.medium" },
  { value: "high", labelKey: "tasks.priority.high" },
]

export const TASK_TYPE_OPTIONS: Option<TaskType>[] = [
  { value: "bug", labelKey: "tasks.type.bug" },
  { value: "ticket", labelKey: "tasks.type.ticket" },
  { value: "epic", labelKey: "tasks.type.epic" },
]

// Color maps mirror the log-row.tsx convention: a Record<string, string> of
// Tailwind classes (dark-mode aware) applied as the className on a <Badge>.

export const TASK_STATUS_STYLES: Record<TaskStatus, string> = {
  todo: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
  in_progress: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  done: "bg-green-500/10 text-green-600 dark:text-green-400",
  overdue: "bg-red-500/10 text-red-600 dark:text-red-400",
}

export const TASK_PRIORITY_STYLES: Record<TaskPriority, string> = {
  low: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  medium: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  high: "bg-red-500/10 text-red-600 dark:text-red-400",
}

export const TASK_TYPE_STYLES: Record<TaskType, string> = {
  bug: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  ticket: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
  epic: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
}

// The fixed column order used by the Kanban board. "overdue" is a locked,
// system-managed column rendered last.
export const TASK_BOARD_COLUMNS: TaskStatus[] = [
  "todo",
  "in_progress",
  "done",
  "overdue",
]
