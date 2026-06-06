import { useQuery } from "@tanstack/react-query"
import { TasksService } from "@/api/services/tasks-service"

export function useTasksBoard() {
  return useQuery({
    queryKey: ["tasks", "board"],
    queryFn: () => TasksService.board(),
  })
}
