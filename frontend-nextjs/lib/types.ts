import { z } from "zod";
import { taskForm } from "./utils/validators";

export type Priority = "LOW" | "MEDIUM" | "HIGH";

export type Task = {
  id: number | string;
  title?: string;
  description?: string;
  is_completed?: boolean;
  due_date?: string;
  priority?: Priority;
  [key: string]: unknown;
};

export type NewTask = {
  title: string;
  description?: string;
  due_date?: string;
  priority: Priority;
};

export type TaskFormData = z.infer<typeof taskForm>;

export type FieldErrs = Partial<Record<keyof TaskFormData | "general", string>>;
