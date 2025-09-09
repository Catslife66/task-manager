"use client";

import { useState } from "react";
import { taskCreateForm } from "../../lib/utils/validators";
import { useAuth } from "../authProvider";

export default function AddTaskForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [errs, setErrs] = useState(null);
  const auth = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = {
      title,
      description,
      due_date: dueDate,
      priority,
    };
    const result = taskCreateForm.safeParse(formData);
    if (!result.success) {
      let fieldErrs = {};
      result.error.issues.forEach((err, _) => {
        let key = err.path[0];
        if (!fieldErrs[key]) fieldErrs[key] = err.message;
      });
      setErrs(fieldErrs);
    } else {
      console.log(result.data);
      try {
        const res = await auth.api.post("/tasks", result.data);
        console.log(res);
      } catch (e) {
        console.log(e);
      }
    }
  };

  return (
    <section className="bg-white">
      <div className="py-8 lg:py-16 px-4 mx-auto max-w-screen-md">
        <h2 className="mb-4 text-4xl tracking-tight font-extrabold text-center text-gray-900 dark:text-white">
          Create a new task
        </h2>
        <form className="space-y-8">
          <div>
            <div className="flex flex-row items-center mb-2 text-sm font-medium">
              <label htmlFor="title" className="block text-gray-900 me-4">
                Title
              </label>
              {errs?.title && (
                <div className="text-sm text-red-800">{errs.title}</div>
              )}
            </div>
            <input
              type="text"
              name="title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setErrs({ ...errs, title: "" });
              }}
              className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"
              required
            />
          </div>
          <div>
            <div className="flex flex-row items-center mb-2 text-sm font-medium">
              <label
                htmlFor="description"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300"
              >
                Description
              </label>
              {errs?.description && (
                <div className="text-sm text-red-800">{errs.description}</div>
              )}
            </div>
            <textarea
              name="description"
              rows="4"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setErrs({ ...errs, description: "" });
              }}
              className="block p-3 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"
            ></textarea>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-row items-center text-sm font-medium">
              <label
                htmlFor="dueDate"
                className="block text-sm font-medium text-gray-900"
              >
                Due date
              </label>
              {errs?.due_date && (
                <div className="ms-2 text-sm text-red-800">{errs.due_date}</div>
              )}
            </div>
            <label
              htmlFor="prority"
              className="block text-sm font-medium text-gray-900"
            >
              Prority
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
                <svg
                  className="w-4 h-4 text-gray-500 dark:text-gray-400"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4ZM0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z" />
                </svg>
              </div>
              <input
                type="datetime-local"
                name="dueDate"
                min={new Date()}
                value={dueDate}
                onChange={(e) => {
                  setDueDate(e.target.value);
                  setErrs({ ...errs, due_date: "" });
                }}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="Select date"
              />
            </div>

            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              placeholder="Priority"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            >
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
            </select>
          </div>
          <button
            type="submit"
            onClick={handleSubmit}
            className="cursor-pointer py-3 px-5 text-sm font-medium text-center text-white rounded-lg bg-blue-700 sm:w-fit hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            Create a task
          </button>
        </form>
      </div>
    </section>
  );
}
