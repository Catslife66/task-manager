"use client";

import { useCallback, useEffect, useState } from "react";
import TaskCard from "./taskCard";
import { useAuth } from "../authProvider";

const GET_TASKS_ENDPOINT = "/tasks/user";

export default function TaskList({ is_completed = false }) {
  const [isLoading, setIsLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [editId, setEditId] = useState(null);
  const [errs, setErrs] = useState(null);
  const auth = useAuth();

  const getTasks = useCallback(async () => {
    try {
      const res = await auth.api.get(GET_TASKS_ENDPOINT);
      const todoTasks = res.data.filter(
        (task) => task.is_completed === is_completed
      );
      setTasks(todoTasks);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleEdit = useCallback((taskId) => {
    setEditId(taskId);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditId(null);
  }, []);

  const handleUpdate = useCallback(
    async (taskId, data) => {
      try {
        const res = await auth.api.patch(`/tasks/${taskId}`, data);
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? { ...t, ...res.data } : t))
        );
        setErrs(null);
      } catch (e) {
        setErrs({ general: "Failed to save the task" });
        console.log(e);
      }
    },
    [auth.api, getTasks]
  );

  const handleComplete = useCallback(
    async (taskId) => {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId ? { ...t, is_completed: !t.is_completed } : t
        )
      );
      try {
        const res = await auth.api.patch(`/tasks/${taskId}`, {
          is_completed: true,
        });
        setTimeout(() => {
          setTasks((prev) => prev.filter((task) => task.id !== res.data.id));
        }, 1000);
      } catch (e) {
        setTasks((prev) =>
          prev.map((task) =>
            task.id === taskId ? { ...task, is_completed: false } : task
          )
        );
        console.log(e);
      }
    },
    [auth.api]
  );

  const handleDelete = useCallback(
    async (taskId) => {
      try {
        await auth.api.delete(`/tasks/${taskId}`);
        setTasks((prev) => prev.filter((task) => task.id !== taskId));
      } catch (e) {
        const rollbackTasks = tasks;
        setTasks(rollbackTasks);
        console.log(e);
      }
    },
    [auth.api]
  );

  useEffect(() => {
    getTasks();
  }, [auth.api]);

  if (isLoading) return <div>Loading...</div>;
  if (tasks.length === 0)
    return (
      <div className="text-center p-4 text-gray-800 font-bold p-4">
        No tasks found. Add a new task!
      </div>
    );

  return (
    <div className="max-w-screen-md w-full mx-auto flex flex-col justify-center items-center space-y-2">
      {tasks.map((task, i) => (
        <TaskCard
          key={i}
          task={task}
          editId={editId}
          errs={errs}
          setErrs={setErrs}
          onEdit={handleEdit}
          onCancelEdit={handleCancelEdit}
          onUpdate={handleUpdate}
          onComplete={handleComplete}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}
