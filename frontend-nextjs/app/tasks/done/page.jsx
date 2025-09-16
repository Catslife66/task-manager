import React from "react";
import TaskList from "../../components/taskList";

export default function page() {
  return (
    <div className="max-w-screen-xl flex flex-col items-center mx-auto py-8 px-4 pt-16">
      <h1 className="text-xl font-bold my-8">Completed Tasks</h1>
      <TaskList is_completed={true} />
    </div>
  );
}
