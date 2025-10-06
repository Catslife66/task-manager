import { Task, TaskPage } from "./types";
import type { AxiosInstance } from "axios";

const GET_TASKS_ENDPOINT = "/tasks/user";

type FetchTasksParams = {
  limit: number;
  offset: number;
  is_completed?: boolean;
};

export const fetchTasks = (
  api: AxiosInstance,
  { limit, offset, is_completed }: FetchTasksParams
): Promise<TaskPage> =>
  api
    .get<TaskPage>(GET_TASKS_ENDPOINT, {
      params: { limit, offset, is_completed },
    })
    .then((res) => res.data);

export const createTask = (api: AxiosInstance, payload: Task): Promise<Task> =>
  api.post<Task>("/tasks", payload).then((res) => res.data);

export const completeTask = (
  api: AxiosInstance,
  id: Task["id"]
): Promise<Task> =>
  api
    .patch<Task>(`/tasks/${id}`, { is_completed: true })
    .then((res) => res.data);

export const updateTask = (
  api: AxiosInstance,
  id: Task["id"],
  patch: Partial<Task>
): Promise<Task> =>
  api.patch<Task>(`/tasks/${id}`, patch).then((res) => res.data);

export const deleteTask = (api: AxiosInstance, id: Task["id"]): Promise<void> =>
  api.delete(`/tasks/${id}`).then((res) => res.data);
