import { Task } from "./types";
import type { AxiosInstance } from "axios";

const GET_TASKS_ENDPOINT = "/tasks/user";

export const fetchTasks = (api: AxiosInstance): Promise<Task[]> =>
  api.get<Task[]>(GET_TASKS_ENDPOINT).then((res) => res.data);

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
