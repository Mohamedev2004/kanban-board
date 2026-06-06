import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { TasksService } from "@/api/services/tasks-service"
import type { TasksListParams } from "@/api/types/tasks.types"

export function useTasksList(params: TasksListParams) {
  return useQuery({
    queryKey: ["tasks", "list", params],
    queryFn: () => TasksService.list(params),
    placeholderData: keepPreviousData,
  })
}
