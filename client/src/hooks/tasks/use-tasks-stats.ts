import { useQuery } from "@tanstack/react-query"
import { TasksService } from "@/api/services/tasks-service"

export function useTasksStats() {
  return useQuery({
    queryKey: ["tasks", "stats"],
    queryFn: TasksService.stats,
  })
}
