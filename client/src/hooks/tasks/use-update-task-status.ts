import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { TasksService } from "@/api/services/tasks-service"
import type { TaskStatus, TasksBoardData } from "@/api/types/tasks.types"
import { getApiMessage, normalizeApiError } from "@/utils/error-utils"
import { interpolate } from "@/utils/common-utils"

type UpdateTaskStatusVariables = {
  id: number
  status: TaskStatus
}

type UpdateTaskStatusContext = {
  previousBoard?: TasksBoardData
}

const BOARD_KEY = ["tasks", "board"] as const

export function useUpdateTaskStatus(t: (key: string) => string) {
  const queryClient = useQueryClient()

  return useMutation<
    Awaited<ReturnType<typeof TasksService.updateStatus>>,
    unknown,
    UpdateTaskStatusVariables,
    UpdateTaskStatusContext
  >({
    mutationFn: ({ id, status }: UpdateTaskStatusVariables) =>
      TasksService.updateStatus(id, status),
    onMutate: async ({ id, status }) => {
      // Cancel any in-flight board fetches so they don't overwrite our optimistic write.
      await queryClient.cancelQueries({ queryKey: BOARD_KEY })

      const previousBoard =
        queryClient.getQueryData<TasksBoardData>(BOARD_KEY)

      if (previousBoard) {
        queryClient.setQueryData<TasksBoardData>(BOARD_KEY, {
          ...previousBoard,
          items: previousBoard.items.map((item) =>
            item.id === id ? { ...item, status } : item
          ),
        })
      }

      return { previousBoard }
    },
    onSuccess: (_data, variables) => {
      const statusLabel = t(`tasks.status.${variables.status}`)
      const toastId = toast.success(t("tasks.statusSuccess"), {
        description: interpolate(t("tasks.statusSuccessDescription"), {
          status: statusLabel,
        }),
        action: {
          label: t("common.close"),
          onClick: () => toast.dismiss(toastId),
        },
      })
    },
    onError: (error, _variables, context) => {
      if (context?.previousBoard) {
        queryClient.setQueryData(BOARD_KEY, context.previousBoard)
      }
      const toastId = toast.error(getApiMessage(t, normalizeApiError(error)), {
        description: t("tasks.errorDescription"),
        action: {
          label: t("common.close"),
          onClick: () => toast.dismiss(toastId),
        },
      })
    },
    onSettled: () => {
      // Re-sync both the board and any list views with the server.
      queryClient.invalidateQueries({ queryKey: ["tasks"] })
    },
  })
}
