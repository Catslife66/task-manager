"use client";

import { useState } from "react";
import { taskForm } from "../../lib/utils/validators";
import { useAuth } from "../authProvider";
import { NewTask, Priority, Task } from "../../lib/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTask } from "../../lib/actions";
import { TaskFormData, FieldErrs } from "../../lib/types";

export default function AddTaskForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<Priority>("MEDIUM");
  const [errs, setErrs] = useState<FieldErrs | null>(null);
  const auth = useAuth();
  const queryClient = useQueryClient();

  const createMu = useMutation<
    Task,
    Error,
    NewTask,
    { prev?: Task[]; tempId: string }
  >({
    mutationFn: (payload) => createTask(auth.api, payload as any),
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });
      const prev = queryClient.getQueryData<Task[]>(["tasks"]);
      const tempId = "temp-" + Date.now();
      const optimisticTask: Task = {
        id: tempId,
        title: payload.title,
        description: payload.description,
        due_date: payload.due_date,
        priority: payload.priority ?? "MEDIUM",
        is_completed: false,
      };

      queryClient.setQueryData<Task[]>(["tasks"], (old) => [
        optimisticTask,
        ...(old ?? []),
      ]);

      return { prev, tempId };
    },
    onSuccess: (serverTask, _payload, ctx) => {
      queryClient.setQueryData<Task[]>(["tasks"], (old = []) =>
        old.map((t) => (t.id === ctx?.tempId ? serverTask : t))
      );
      setTitle("");
      setDescription("");
      setDueDate("");
      setPriority("MEDIUM");
    },
    onError: (_err, _payload, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(["tasks"], ctx.prev);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrs(null);
    const raw = {
      title,
      description,
      due_date: dueDate,
      priority,
    };
    const result = taskForm.safeParse(raw);
    if (!result.success) {
      let fieldErrs: FieldErrs = {};
      result.error.issues.forEach((err, _) => {
        let key = err.path[0] as keyof TaskFormData;
        if (!fieldErrs[key]) fieldErrs[key] = err.message;
      });
      setErrs(fieldErrs);
      return;
    } else {
      const d: unknown = (result.data as any).due_date;
      const iso =
        d instanceof Date
          ? d.toISOString()
          : typeof d === "string" && d
          ? new Date(d).toISOString()
          : undefined;

      const payload: NewTask = {
        title: result.data.title,
        description: result.data.description || undefined,
        priority: result.data.priority as Priority,
        due_date: iso,
      };

      createMu.mutate(payload);
    }
  };

  return (
    <div className="w-full mx-auto flex justify-center items-center py-8 my-4">
      <form className="max-w-screen-md w-full" onSubmit={onSubmit}>
        {errs?.general && (
          <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50">
            {errs.general}
          </div>
        )}
        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              name="title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setErrs((prev) => ({ ...(prev ?? {}), title: "" }));
              }}
              className="block w-full px-0 py-2 text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none peer"
              placeholder=" "
            />
            <label
              htmlFor="title"
              className="absolute text-sm text-gray-500 top-3 -z-10 text-blue-600 scale-75 -translate-y-6 -translate-x-1"
            >
              Title
            </label>
          </div>
          {errs?.title && (
            <p className="text-xs text-red-600 dark:text-red-400">
              {errs.title}
            </p>
          )}
        </div>
        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              name="description"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setErrs((prev) => ({ ...(prev ?? {}), description: "" }));
              }}
              className="block w-full px-0 py-2 text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none peer"
            />
            <label
              htmlFor="description"
              className="absolute text-sm text-gray-500 top-3 -z-10 text-blue-600 scale-75 -translate-y-6 -translate-x-2"
            >
              Description
            </label>
          </div>
          {errs?.description && (
            <p className="text-xs text-red-600 dark:text-red-400">
              {errs.description}
            </p>
          )}
        </div>
        <div className="flex flex-row justify-between">
          <div className="flex flex-row space-x-4">
            <div>
              <div className="relative">
                <input
                  className="block w-full px-0 py-2 text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none peer"
                  type="datetime-local"
                  name="dueDate"
                  min={new Date().toLocaleDateString()}
                  value={dueDate}
                  onChange={(e) => {
                    setDueDate(e.target.value);
                    setErrs((prev) => ({ ...(prev ?? {}), due_date: "" }));
                  }}
                  placeholder="Select date"
                />
                <label
                  htmlFor="dueDate"
                  className="absolute text-sm text-gray-500 top-3 -z-10 text-blue-600 scale-75 -translate-y-6 -translate-x-1"
                >
                  Due date
                </label>
              </div>
              {errs?.due_date && (
                <p className="text-xs text-red-600 dark:text-red-400">
                  {errs.due_date}
                </p>
              )}
            </div>
            <div>
              <div className="relative">
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Priority)}
                  className="block py-2.5 px-0 w-full text-xs text-gray-500 bg-transparent border-0 border-b-2 border-gray-200 appearance-none dark:text-gray-400 dark:border-gray-700 focus:outline-none focus:ring-0 focus:border-gray-200 peer"
                >
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                </select>
                <label
                  htmlFor="prority"
                  className="absolute text-sm text-gray-500 top-3 -z-10 text-blue-600 scale-75 -translate-y-6 -translate-x-1"
                >
                  Prority
                </label>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={createMu.isPending}
            className="cursor-pointer flex flex-row justify-center items-center bg-gray-500 text-white rounded-sm p-2 hover:bg-gray-800"
          >
            {createMu.isPending ? (
              <>
                <svg
                  aria-hidden="true"
                  role="status"
                  className="inline w-4 h-4 me-3 text-gray-200 animate-spin dark:text-gray-600"
                  viewBox="0 0 100 101"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                    fill="white"
                  />
                  <path
                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                    fill="currentColor"
                  />
                </svg>
                Saving...
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4 text-gray-800 text-white"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 12h14m-7 7V5"
                  />
                </svg>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
