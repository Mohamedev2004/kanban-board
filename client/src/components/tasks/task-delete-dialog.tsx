import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type { Task } from "@/api/types/tasks.types"

type Translate = (key: string, fallback?: string) => string

type TaskDeleteDialogProps = {
  task: Task | null
  open: boolean
  onOpenChange: (open: boolean) => void
  isDeleting: boolean
  t: Translate
  onConfirm: (id: number) => void
}

export function TaskDeleteDialog({
  task,
  open,
  onOpenChange,
  isDeleting,
  t,
  onConfirm,
}: TaskDeleteDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("tasks.delete")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("tasks.confirmDelete")}
            {task ? ` "${task.title}"` : ""}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            {t("common.cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={isDeleting}
            onClick={(event) => {
              event.preventDefault()
              if (task) onConfirm(task.id)
            }}
          >
            {isDeleting ? t("common.saving") : t("common.delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
