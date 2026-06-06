import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { TasksService } from "@/api/services/tasks-service"
import type { UpdateTaskPayload } from "@/api/types/tasks.types"
import { getApiMessage, normalizeApiError } from "@/utils/error-utils"

type UpdateTaskVariables = {
  id: number
  payload: UpdateTaskPayload
}

export function useUpdateTask(t: (key: string) => string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: UpdateTaskVariables) =>
      TasksService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] })
      const toastId = toast.success(t("tasks.updateSuccess"), {
        description: t("tasks.updateSuccessDescription"),
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
