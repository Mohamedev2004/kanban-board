import { useEffect, useMemo, useState } from "react"
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table"
import {
  ArrowDown,
  ArrowUp,
  ChevronsUpDown,
  Lock,
  MoreVertical,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react"

import type {
  Task,
  TaskSortBy,
  TaskSortDir,
  TaskStatus,
} from "@/api/types/tasks.types"
import { useDirection } from "@/context/direction/direction-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AppPagination } from "@/components/app-pagination"
import { Skeleton } from "@/components/ui/skeleton"
import {
  TASK_MOVABLE_STATUS_OPTIONS,
  TASK_PRIORITY_OPTIONS,
  TASK_STATUS_OPTIONS,
  TASK_TYPE_OPTIONS,
  TASKS_PER_PAGE_OPTIONS,
} from "@/constants/tasks"
import { useTasksList } from "@/hooks/tasks/use-tasks-list"
import { useCreateTask } from "@/hooks/tasks/use-create-task"
import { useUpdateTask } from "@/hooks/tasks/use-update-task"
import { useUpdateTaskStatus } from "@/hooks/tasks/use-update-task-status"
import { useDeleteTask } from "@/hooks/tasks/use-delete-task"
import { normalizeApiError } from "@/utils/error-utils"
import { interpolate } from "@/utils/common-utils"
import { cn } from "@/utils/ui-utils"
import { PriorityBadge, StatusBadge, TagList, TypeBadge } from "./task-badges"
import { TaskDialog } from "./task-dialog"
import { TaskDeleteDialog } from "./task-delete-dialog"
import { TaskOwnerInfo } from "./task-owner"
import { useAuth } from "@/context/auth/auth-context"
import { isAdmin } from "@/utils/navigation-utils"

const ALL_VALUE = "all"

function SortHeader({
  label,
  column,
  sortBy,
  sortDir,
  onSort,
}: {
  label: string
  column: TaskSortBy
  sortBy: TaskSortBy
  sortDir: TaskSortDir
  onSort: (column: TaskSortBy) => void
}) {
  const isActive = sortBy === column
  return (
    <button
      type="button"
      onClick={() => onSort(column)}
      className="-mx-1 inline-flex items-center gap-1 rounded px-1 hover:text-foreground"
    >
      {label}
      {isActive ? (
        sortDir === "asc" ? (
          <ArrowUp className="size-3.5" />
        ) : (
          <ArrowDown className="size-3.5" />
        )
      ) : (
        <ChevronsUpDown className="size-3.5 opacity-50" />
      )}
    </button>
  )
}

export function TasksDataTable() {
  const { t, locale } = useDirection()
  const { user } = useAuth()
  const showOwner = isAdmin(user)

  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState<number>(TASKS_PER_PAGE_OPTIONS[1])
  const [statusFilter, setStatusFilter] = useState<TaskStatus | undefined>(
    undefined
  )
  const [priorityFilter, setPriorityFilter] = useState<string | undefined>(
    undefined
  )
  const [typeFilter, setTypeFilter] = useState<string | undefined>(undefined)
  const [search, setSearch] = useState("")
  const [searchInput, setSearchInput] = useState("")
  const [sortBy, setSortBy] = useState<TaskSortBy>("created_at")
  const [sortDir, setSortDir] = useState<TaskSortDir>("desc")

  // Dialog state.
  const [formOpen, setFormOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [serverErrors, setServerErrors] = useState<
    Record<string, string> | undefined
  >(undefined)
  const [deleteTask, setDeleteTask] = useState<Task | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)

  // Debounce the search input into the query param.
  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(searchInput)
      setPage(1)
    }, 400)
    return () => clearTimeout(timeout)
  }, [searchInput])

  const listQuery = useTasksList({
    page,
    perPage,
    status: statusFilter,
    priority: priorityFilter as Task["priority"] | undefined,
    type: typeFilter as Task["type"] | undefined,
    q: search || undefined,
    sortBy,
    sortDir,
  })

  const createMutation = useCreateTask(t)
  const updateMutation = useUpdateTask(t)
  const updateStatusMutation = useUpdateTaskStatus(t)
  const deleteMutation = useDeleteTask(t)

  const items = listQuery.data?.items ?? []
  const pagination = listQuery.data?.pagination
  // Skeletons only on the very first load (no data yet). On filter / sort / page
  // changes we keep the previous rows visible (keepPreviousData) and just dim
  // them, so the table updates in place instead of flashing empty.
  const isInitialLoading = listQuery.isLoading
  const isRefetching = listQuery.isFetching && !listQuery.isLoading

  function handleSort(column: TaskSortBy) {
    if (sortBy === column) {
      setSortDir((dir) => (dir === "asc" ? "desc" : "asc"))
    } else {
      setSortBy(column)
      setSortDir("desc")
    }
    setPage(1)
  }

  function openCreateDialog() {
    setEditingTask(null)
    setServerErrors(undefined)
    setFormOpen(true)
  }

  function openEditDialog(task: Task) {
    setEditingTask(task)
    setServerErrors(undefined)
    setFormOpen(true)
  }

  function openDeleteDialog(task: Task) {
    setDeleteTask(task)
    setDeleteOpen(true)
  }

  function handleSubmit(payload: Parameters<typeof createMutation.mutate>[0]) {
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

  function formatDate(value: string | null): string {
    if (!value) return "—"
    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) return "—"
    return parsed.toLocaleDateString(
      locale === "ar" ? "ar-MA" : locale === "fr" ? "fr-FR" : "en-US",
      { year: "numeric", month: "short", day: "numeric" }
    )
  }

  const columns = useMemo<ColumnDef<Task>[]>(
    () => [
      {
        accessorKey: "title",
        header: () => (
          <SortHeader
            label={t("tasks.fields.title")}
            column="title"
            sortBy={sortBy}
            sortDir={sortDir}
            onSort={handleSort}
          />
        ),
        cell: ({ row }) => (
          <span className="font-medium text-foreground">
            {row.original.title}
          </span>
        ),
      },
      ...(showOwner
        ? ([
            {
              id: "owner",
              header: () => t("tasks.fields.owner"),
              cell: ({ row }) =>
                row.original.owner ? (
                  <TaskOwnerInfo owner={row.original.owner} showEmail />
                ) : (
                  <span className="text-muted-foreground">—</span>
                ),
            },
          ] satisfies ColumnDef<Task>[])
        : []),
      {
        accessorKey: "type",
        header: () => (
          <SortHeader
            label={t("tasks.fields.type")}
            column="type"
            sortBy={sortBy}
            sortDir={sortDir}
            onSort={handleSort}
          />
        ),
        cell: ({ row }) => <TypeBadge type={row.original.type} t={t} />,
      },
      {
        accessorKey: "priority",
        header: () => (
          <SortHeader
            label={t("tasks.fields.priority")}
            column="priority"
            sortBy={sortBy}
            sortDir={sortDir}
            onSort={handleSort}
          />
        ),
        cell: ({ row }) => (
          <PriorityBadge priority={row.original.priority} t={t} />
        ),
      },
      {
        accessorKey: "status",
        header: () => (
          <SortHeader
            label={t("tasks.fields.status")}
            column="status"
            sortBy={sortBy}
            sortDir={sortDir}
            onSort={handleSort}
          />
        ),
        cell: ({ row }) => <StatusBadge status={row.original.status} t={t} />,
      },
      {
        accessorKey: "tags",
        header: () => t("tasks.fields.tags"),
        cell: ({ row }) =>
          row.original.tags.length ? (
            <TagList tags={row.original.tags} />
          ) : (
            <span className="text-muted-foreground">—</span>
          ),
      },
      {
        accessorKey: "due_date",
        header: () => (
          <SortHeader
            label={t("tasks.fields.dueDate")}
            column="due_date"
            sortBy={sortBy}
            sortDir={sortDir}
            onSort={handleSort}
          />
        ),
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {formatDate(row.original.due_date)}
          </span>
        ),
      },
      {
        accessorKey: "created_at",
        header: () => (
          <SortHeader
            label={t("tasks.fields.createdAt")}
            column="created_at"
            sortBy={sortBy}
            sortDir={sortDir}
            onSort={handleSort}
          />
        ),
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {formatDate(row.original.created_at)}
          </span>
        ),
      },
      {
        id: "actions",
        header: () => (
          <span className="sr-only">{t("common.actions")}</span>
        ),
        cell: ({ row }) => {
          const task = row.original
          // Overdue tasks are system-locked: no edit, delete, or quick-status.
          if (task.status === "overdue") {
            return (
              <div className="flex justify-end">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  disabled
                  title={t("tasks.overdueLocked")}
                  aria-label={t("tasks.overdueLocked")}
                >
                  <Lock />
                </Button>
              </div>
            )
          }
          return (
            <div className="flex justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={t("common.openActions")}
                  >
                    <MoreVertical />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem onSelect={() => openEditDialog(task)}>
                    <Pencil />
                    {t("common.edit")}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>{t("tasks.quickStatus")}</DropdownMenuLabel>
                  <DropdownMenuRadioGroup
                    value={task.status}
                    onValueChange={(value) =>
                      updateStatusMutation.mutate({
                        id: task.id,
                        status: value as TaskStatus,
                      })
                    }
                  >
                    {TASK_MOVABLE_STATUS_OPTIONS.map((option) => (
                      <DropdownMenuRadioItem
                        key={option.value}
                        value={option.value}
                      >
                        {t(option.labelKey)}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    onSelect={() => openDeleteDialog(task)}
                  >
                    <Trash2 />
                    {t("common.delete")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, sortBy, sortDir, locale, showOwner]
  )

  const table = useReactTable({
    data: items,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
    manualFiltering: true,
    manualPagination: true,
  })

  const activeFilters =
    (statusFilter ? 1 : 0) + (priorityFilter ? 1 : 0) + (typeFilter ? 1 : 0)

  function clearFilters() {
    setStatusFilter(undefined)
    setPriorityFilter(undefined)
    setTypeFilter(undefined)
    setSearchInput("")
    setSearch("")
    setPage(1)
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-full sm:flex-1">
            <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t("tasks.search")}
              className="h-9 w-full ps-9 text-sm"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
            />
          </div>

          <Button className="h-9 w-full sm:w-auto" onClick={openCreateDialog}>
            <Plus className="size-4 me-1.5" />
            {t("tasks.new")}
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={statusFilter ?? ALL_VALUE}
            onValueChange={(value) => {
              setStatusFilter(value === ALL_VALUE ? undefined : (value as TaskStatus))
              setPage(1)
            }}
          >
            <SelectTrigger className="!h-9 w-full sm:w-40">
              <SelectValue placeholder={t("tasks.filters.status")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>{t("tasks.filters.allStatus")}</SelectItem>
              {TASK_STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {t(option.labelKey)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={priorityFilter ?? ALL_VALUE}
            onValueChange={(value) => {
              setPriorityFilter(value === ALL_VALUE ? undefined : value)
              setPage(1)
            }}
          >
            <SelectTrigger className="!h-9 w-full sm:w-40">
              <SelectValue placeholder={t("tasks.filters.priority")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>
                {t("tasks.filters.allPriority")}
              </SelectItem>
              {TASK_PRIORITY_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {t(option.labelKey)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={typeFilter ?? ALL_VALUE}
            onValueChange={(value) => {
              setTypeFilter(value === ALL_VALUE ? undefined : value)
              setPage(1)
            }}
          >
            <SelectTrigger className="!h-9 w-full sm:w-40">
              <SelectValue placeholder={t("tasks.filters.type")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>{t("tasks.filters.allType")}</SelectItem>
              {TASK_TYPE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {t(option.labelKey)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={String(perPage)}
            onValueChange={(value) => {
              setPerPage(Number(value))
              setPage(1)
            }}
          >
            <SelectTrigger className="!h-9 w-full sm:w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TASKS_PER_PAGE_OPTIONS.map((option) => (
                <SelectItem key={option} value={String(option)}>
                  {option} {t("common.perPage")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {activeFilters > 0 || search ? (
            <Button
              variant="ghost"
              className="h-9 w-full sm:w-auto"
              onClick={clearFilters}
            >
              {t("common.clearFilters")}
            </Button>
          ) : null}
        </div>
      </div>

      {/* Table */}
      <div
        className={cn(
          "min-h-[420px] rounded-xl border transition-opacity",
          isRefetching && "opacity-60"
        )}
      >
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isInitialLoading ? (
              Array.from({ length: perPage > 10 ? 10 : perPage }).map(
                (_, rowIdx) => (
                  <TableRow key={rowIdx}>
                    {columns.map((_col, colIdx) => (
                      <TableCell key={colIdx}>
                        <Skeleton className="h-5 w-full max-w-[140px]" />
                      </TableCell>
                    ))}
                  </TableRow>
                )
              )
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-sm text-muted-foreground"
                >
                  {t("tasks.empty")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className={isRefetching ? "pointer-events-none opacity-60" : ""}>
          <AppPagination
            pagination={pagination}
            summaryTop={interpolate(t("tasks.showing"), {
              count: pagination.total,
            })}
            summaryBottom={interpolate(t("tasks.pageSummary"), {
              page: pagination.page,
              totalPages: pagination.total_pages,
            })}
            onPageChange={setPage}
          />
        </div>
      )}

      <TaskDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        task={editingTask}
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
    </div>
  )
}
