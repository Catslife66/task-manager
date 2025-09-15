"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "./authProvider";
import TaskPageContent from "./components/taskPageContent";
import AddTaskForm from "./components/addTaskForm";
import TaskList from "./components/taskList";

export default function Home() {
  return (
    <div className="max-w-screen-xl flex flex-col items-center mx-auto py-8 px-4">
      <h1 className="text-xl font-bold">My Tasks</h1>
      <AddTaskForm />
      <TaskList />
    </div>
  );
}
