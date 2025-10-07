import React from "react";
import TaskList from "../components/taskList";
import AddTaskForm from "../components/addTaskForm";

export default function page() {
  return (
    <div className="max-w-screen-xl flex flex-col items-center mx-auto py-8 px-4 pt-16">
      <h1 className="text-xl font-bold my-8">My Tasks</h1>
      <AddTaskForm />
      <TaskList />
    </div>
  );
}
