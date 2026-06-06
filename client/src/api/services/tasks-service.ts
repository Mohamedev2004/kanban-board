import { axiosInstance } from "../axios"
import type {
  ApiEnvelope,
  CreateTaskPayload,
  Task,
  TaskStats,
  TaskStatus,
  TasksBoardData,
  TasksListData,
  TasksListParams,
  UpdateTaskPayload,
} from "../types/tasks.types"

export const TasksService = {
  async list(params: TasksListParams): Promise<TasksListData> {
    const response = await axiosInstance.get<ApiEnvelope<TasksListData>>(
      "/tasks",
      {
        params: {
          page: params.page,
          per_page: params.perPage,
          status: params.status,
          priority: params.priority,
          type: params.type,
          q: params.q,
          sort_by: params.sortBy,
          sort_dir: params.sortDir,
        },
      }
    )

    return response.data.data
  },

  async board(): Promise<TasksBoardData> {
    const response =
      await axiosInstance.get<ApiEnvelope<TasksBoardData>>("/tasks/board")

    return response.data.data
  },

  async stats(): Promise<TaskStats> {
    const response =
      await axiosInstance.get<ApiEnvelope<TaskStats>>("/tasks/stats")

    return response.data.data
  },

  async get(id: number): Promise<Task> {
    const response = await axiosInstance.get<ApiEnvelope<Task>>(`/tasks/${id}`)

    return response.data.data
  },

  async create(payload: CreateTaskPayload): Promise<Task> {
    const response = await axiosInstance.post<ApiEnvelope<Task>>(
      "/tasks",
      payload
    )

    return response.data.data
  },

  async update(id: number, payload: UpdateTaskPayload): Promise<Task> {
    const response = await axiosInstance.put<ApiEnvelope<Task>>(
      `/tasks/${id}`,
      payload
    )

    return response.data.data
  },

  async updateStatus(id: number, status: TaskStatus): Promise<Task> {
    const response = await axiosInstance.patch<ApiEnvelope<Task>>(
      `/tasks/${id}/status`,
      { status }
    )

    return response.data.data
  },

  async remove(id: number): Promise<void> {
    await axiosInstance.delete(`/tasks/${id}`)
  },
}
