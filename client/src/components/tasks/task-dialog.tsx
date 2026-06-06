import { useState } from "react"

import type {
  CreateTaskPayload,
  Task,
  TaskPriority,
  TaskStatus,
  TaskType,
} from "@/api/types/tasks.types"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  TASK_MOVABLE_STATUS_OPTIONS,
  TASK_PRIORITY_OPTIONS,
  TASK_TYPE_OPTIONS,
} from "@/constants/tasks"

type Translate = (key: string, fallback?: string) => string

type TaskDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** The task being edited, or null when creating. */
  task: Task | null
  /** Pre-selected status (used by the board "Add task" affordance). */
  defaultStatus?: TaskStatus
  isSubmitting: boolean
  /** Field-level errors coming from the backend `errors` map. */
  serverErrors?: Record<string, string>
  t: Translate
  onSubmit: (payload: CreateTaskPayload) => void
}

/** Converts an RFC3339 string to the YYYY-MM-DD form a date input expects. */
function isoToDateInput(value: string | null): string {
  if (!value) return ""
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return ""
  return parsed.toISOString().slice(0, 10)
}

/** Converts a YYYY-MM-DD date-input value back to an RFC3339 string (or null). */
function dateInputToIso(value: string): string | null {
  if (!value) return null
  const parsed = new Date(`${value}T00:00:00.000Z`)
  if (Number.isNaN(parsed.getTime())) return null
  return parsed.toISOString()
}

function tagsToInput(tags: string[]): string {
  return tags.join(", ")
}

function inputToTags(value: string): string[] {
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
}

type TaskFormProps = {
  task: Task | null
  defaultStatus?: TaskStatus
  isSubmitting: boolean
  serverErrors?: Record<string, string>
  t: Translate
  onSubmit: (payload: CreateTaskPayload) => void
  onCancel: () => void
}

/**
 * The form body. Initial state is derived directly from props so the parent
 * can reset it by remounting (via a `key`) rather than syncing through effects.
 */
function TaskForm({
  task,
  defaultStatus,
  isSubmitting,
  serverErrors,
  t,
  onSubmit,
  onCancel,
}: TaskFormProps) {
  const isEdit = Boolean(task)

  const [title, setTitle] = useState(task?.title ?? "")
  const [description, setDescription] = useState(task?.description ?? "")
  const [tagsInput, setTagsInput] = useState(task ? tagsToInput(task.tags) : "")
  const [status, setStatus] = useState<TaskStatus>(
    task?.status ?? defaultStatus ?? "todo"
  )
  const [priority, setPriority] = useState<TaskPriority>(
    task?.priority ?? "medium"
  )
  const [type, setType] = useState<TaskType>(task?.type ?? "ticket")
  const [dueDate, setDueDate] = useState(isoToDateInput(task?.due_date ?? null))
  const [titleError, setTitleError] = useState<string | undefined>(undefined)

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedTitle = title.trim()
    if (!trimmedTitle) {
      setTitleError(t("tasks.errors.titleRequired"))
      return
    }
    setTitleError(undefined)

    onSubmit({
      title: trimmedTitle,
      description: description.trim(),
      tags: inputToTags(tagsInput),
      status,
      priority,
      type,
      due_date: dateInputToIso(dueDate),
    })
  }

  const titleFieldError = titleError ?? serverErrors?.title

  return (
    <form noValidate className="grid gap-4" onSubmit={handleSubmit}>
      <div className="grid gap-2">
        <Label htmlFor="task-title">{t("tasks.fields.title")}</Label>
        <Input
          id="task-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder={t("tasks.fields.titlePlaceholder")}
          className={titleFieldError ? "border-destructive" : ""}
        />
        {titleFieldError && (
          <span className="text-xs text-destructive">{titleFieldError}</span>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="task-description">{t("tasks.fields.description")}</Label>
        <Textarea
          id="task-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder={t("tasks.fields.descriptionPlaceholder")}
          className={serverErrors?.description ? "border-destructive" : ""}
        />
        {serverErrors?.description && (
          <span className="text-xs text-destructive">
            {serverErrors.description}
          </span>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="grid gap-2">
          <Label>{t("tasks.fields.type")}</Label>
          <Select
            value={type}
            onValueChange={(value) => setType(value as TaskType)}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TASK_TYPE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {t(option.labelKey)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label>{t("tasks.fields.priority")}</Label>
          <Select
            value={priority}
            onValueChange={(value) => setPriority(value as TaskPriority)}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TASK_PRIORITY_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {t(option.labelKey)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label>{t("tasks.fields.status")}</Label>
          <Select
            value={status}
            onValueChange={(value) => setStatus(value as TaskStatus)}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TASK_MOVABLE_STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {t(option.labelKey)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="task-tags">{t("tasks.fields.tags")}</Label>
          <Input
            id="task-tags"
            value={tagsInput}
            onChange={(event) => setTagsInput(event.target.value)}
            placeholder={t("tasks.fields.tagsPlaceholder")}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="task-due-date">{t("tasks.fields.dueDate")}</Label>
          <Input
            id="task-due-date"
            type="date"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
          />
        </div>
      </div>

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          {t("common.cancel")}
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? t("common.saving")
            : isEdit
              ? t("common.update")
              : t("common.add")}
        </Button>
      </DialogFooter>
    </form>
  )
}

export function TaskDialog({
  open,
  onOpenChange,
  task,
  defaultStatus,
  isSubmitting,
  serverErrors,
  t,
  onSubmit,
}: TaskDialogProps) {
  const isEdit = Boolean(task)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? t("tasks.edit") : t("tasks.new")}</DialogTitle>
          <DialogDescription>
            {isEdit ? t("tasks.editSubtitle") : t("tasks.newSubtitle")}
          </DialogDescription>
        </DialogHeader>

        {open && (
          <TaskForm
            // Remount the form (resetting its state) whenever the dialog opens
            // for a different task or with a different pre-selected status.
            key={`${task?.id ?? "new"}-${defaultStatus ?? ""}`}
            task={task}
            defaultStatus={defaultStatus}
            isSubmitting={isSubmitting}
            serverErrors={serverErrors}
            t={t}
            onSubmit={onSubmit}
            onCancel={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
