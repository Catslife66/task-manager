"use client";

import { useAuth } from "./authProvider";
import AddTaskForm from "./components/addTaskForm";

export default function Home() {
  const auth = useAuth();

  return (
    <div className="w-full">
      <main className="flex justify-center items-center">
        <h1>TASK MANAGER APP</h1>
        <h1>Your email is: {auth.userEmail}</h1>
      </main>
      <div className="w-full">
        <AddTaskForm />
      </div>
    </div>
  );
}
