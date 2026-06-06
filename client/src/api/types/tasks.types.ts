/**
 * Task related API types.
 *
 * Responsibility: Define the wire/domain types for the tasks feature.
 * Layer: Types
 */

export type TaskStatus = "todo" | "in_progress" | "done" | "overdue"
export type TaskPriority = "low" | "medium" | "high"
export type TaskType = "bug" | "ticket" | "epic"

// Lightweight owner projection, present only on admin responses.
export type TaskOwner = {
  id: number
  username: string
  email: string
}

export type Task = {
  id: number
  user_id: number
  title: string
  description: string
  tags: string[]
  status: TaskStatus
  priority: TaskPriority
  type: TaskType
  due_date: string | null
  created_at: string
  updated_at: string
  // Populated only for admins so the UI can show who owns each task.
  owner?: TaskOwner
}

export type Pagination = {
  page: number
  per_page: number
  total: number
  total_pages: number
  has_next: boolean
  has_prev: boolean
}

export type TaskSortBy =
  | "created_at"
  | "due_date"
  | "title"
  | "status"
  | "priority"
  | "type"
  | "id"

export type TaskSortDir = "asc" | "desc"

export type CreateTaskPayload = {
  title: string
  description?: string
  tags?: string[]
  status?: TaskStatus
  priority?: TaskPriority
  type?: TaskType
  due_date?: string | null
}

export type UpdateTaskPayload = CreateTaskPayload

export type TasksListParams = {
  page: number
  perPage: number
  status?: TaskStatus
  priority?: TaskPriority
  type?: TaskType
  q?: string
  sortBy?: TaskSortBy
  sortDir?: TaskSortDir
}

export type TasksListData = {
  items: Task[]
  pagination: Pagination
}

export type TasksBoardData = {
  items: Task[]
}

export type ApiEnvelope<T> = {
  success: boolean
  message: string
  data: T
}

export type TaskStatsByStatus = {
  todo: number
  in_progress: number
  done: number
  overdue: number
}

export type TaskSeriesPoint = {
  date: string
  count: number
}

export type TaskUserStat = {
  user_id: number
  username: string
  total: number
  done: number
  overdue: number
}

export type TaskStats = {
  total: number
  by_status: TaskStatsByStatus
  by_priority: { low: number; medium: number; high: number }
  by_type: { bug: number; ticket: number; epic: number }
  overdue: number
  due_soon: number
  completed: number
  completion_rate: number
  created_series: TaskSeriesPoint[]
  by_user?: TaskUserStat[]
}
