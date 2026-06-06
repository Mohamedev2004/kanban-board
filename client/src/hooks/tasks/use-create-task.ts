import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { TasksService } from "@/api/services/tasks-service"
import type { CreateTaskPayload } from "@/api/types/tasks.types"
import { getApiMessage, normalizeApiError } from "@/utils/error-utils"

export function useCreateTask(t: (key: string) => string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateTaskPayload) => TasksService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] })
      const toastId = toast.success(t("tasks.createSuccess"), {
        description: t("tasks.createSuccessDescription"),
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
