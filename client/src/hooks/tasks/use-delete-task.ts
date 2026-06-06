import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { TasksService } from "@/api/services/tasks-service"
import { getApiMessage, normalizeApiError } from "@/utils/error-utils"

export function useDeleteTask(t: (key: string) => string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => TasksService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] })
      const toastId = toast.success(t("tasks.deleteSuccess"), {
        description: t("tasks.deleteSuccessDescription"),
        action: {
          label: t("common.close"),
          onClick: () => toast.dismiss(toastId),
        },
      })
    },
    onError: (error) => {
      const toastId = toast.error(getApiMessage(t, normalizeApiError(error)), {
        description: t("tasks.errorDescription"),
        action: {
          label: t("common.close"),
          onClick: () => toast.dismiss(toastId),
        },
      })
    },
  })
}
