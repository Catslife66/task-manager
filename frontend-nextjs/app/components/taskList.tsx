"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import TaskCard from "./taskCard";
import { useAuth } from "../authProvider";
import { Task, TaskPage } from "../../lib/tasks/types";
import {
  completeTask,
  deleteTask,
  fetchTasks,
  updateTask,
} from "../../lib/tasks/actions";
import { useCallback, useEffect, useRef, useState } from "react";

export default function TaskList() {
  const [editId, setEditId] = useState<number | string>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const auth = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<TaskPage>({
    queryKey: ["tasks"],
    queryFn: () =>
      fetchTasks(auth.api, { limit: 10, offset: 1, is_completed: false }),
    staleTime: 30_000,
  });

  const tasks = data?.items ?? [];
  const total = data?.total ?? 0;
  const hasNext = data?.has_next ?? false;

  const completeMu = useMutation({
    mutationFn: (id: number | string) => completeTask(auth.api, id),
    onMutate: async (id: number | string) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });
      const prev = queryClient.getQueryData<Task[]>(["tasks"]);
      queryClient.setQueryData<Task[]>(
        ["tasks"],
        (old) =>
          old?.map((t) => (t.id === id ? { ...t, is_completed: true } : t)) ??
          []
      );
      return { prev };
    },
    onError: (_e, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(["tasks"], ctx.prev);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  });

  type UpdateVars = { id: string; patch: Partial<Task> };
  type UpdateCtx = { prev?: Task[] };

  const updateMu = useMutation<Task, Error, UpdateVars, UpdateCtx>({
    mutationFn: ({ id, patch }) => updateTask(auth.api, id, patch),
    onMutate: async ({ id, patch }) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });
      const prev = queryClient.getQueryData<Task[]>(["tasks"]);
      queryClient.setQueryData<Task[]>(
        ["tasks"],
        (old) => old?.map((t) => (t.id === id ? { ...t, ...patch } : t)) ?? []
      );
      return { prev };
    },
    onError: (_e, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(["tasks"], ctx.prev);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  });

  const deleteMu = useMutation({
    mutationFn: (id: number | string) => deleteTask(auth.api, id),
    onMutate: async (id: number | string) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });
      const prev = queryClient.getQueryData<Task[]>(["tasks"]);
      queryClient.setQueryData<Task[]>(
        ["tasks"],
        (old) => old?.filter((t) => t.id !== id) ?? []
      );
      return { prev };
    },
    onError: (_e, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(["tasks"], ctx.prev);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  });

  useEffect(() => {
    function onOutsideByClick(e: PointerEvent) {
      const target = e.target as Node;
      if (!listRef.current?.contains(target)) setEditId(null);
      if (listRef.current?.contains(target)) console.log("click on object");
    }
    document.addEventListener("pointerdown", onOutsideByClick);
    return () => {
      document.removeEventListener("pointerdown", onOutsideByClick);
    };
  }, [editId]);

  const enterEditByClick = useCallback(
    (e: React.PointerEvent<HTMLElement>, id: string | number) => {
      const target = e.target as HTMLElement;
      if (target.closest("button, input, select, textarea, a, [role='button]"))
        return;
      if (editId !== null && editId !== id) {
        setEditId(null);
        return;
      }
      setEditId((prev) => (prev === id ? null : id));
    },
    [editId]
  );

  const enterEditByKeyboard = useCallback(
    (e: React.KeyboardEvent<HTMLElement>, id: string | number) => {
      const target = e.target as HTMLElement;
      if (target.closest("button, input, select, textarea, a, [role='button]"))
        return;
      if (e.key !== "Enter" && e.key !== " ") return;
      e.preventDefault();
      if (editId !== null && editId !== id) {
        setEditId(id);
        return;
      }
      setEditId((prev) => (prev === id ? null : id));
    },
    [editId]
  );

  if (isLoading) return <div>Loading…</div>;

  if (tasks.length === 0)
    return (
      <div className="text-center p-4 text-gray-800 font-bold p-4">
        No remaining uncompleted tasks found. Add a new task!
      </div>
    );

  return (
    <div
      ref={listRef}
      className="max-w-screen-md w-full mx-auto flex flex-col justify-center items-center space-y-2"
    >
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          isEditing={editId === task.id}
          onPointerEnterEdit={(e) => enterEditByClick(e, task.id)}
          onKeyEnterEdit={(e) => enterEditByKeyboard(e, task.id)}
          onExitEdit={() => setEditId(null)}
          onUpdate={(id: string, patch: Partial<Task>) =>
            updateMu.mutateAsync({ id, patch })
          }
          onComplete={(id: string) => completeMu.mutateAsync(id)}
          onDelete={(id: string) => deleteMu.mutateAsync(id)}
        />
      ))}
    </div>
  );
}
