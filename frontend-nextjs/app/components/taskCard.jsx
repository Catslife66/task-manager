import React, { useMemo, useRef, useState, useEffect } from "react";
import { taskCreateForm } from "../../lib/utils/validators";

const TaskCard = React.memo(
  ({
    task,
    errs,
    setErrs,
    onEdit,
    onCancelEdit,
    onUpdate,
    onComplete,
    onDelete,
  }) => {
    const ref = useRef(null);
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(task.title || "");
    const [description, setDescription] = useState(task.description || "");
    const [dueDate, setDueDate] = useState(task.due_date || "");
    const [priority, setPriority] = useState(task.priority || "MEDIUM");

    const priorityBadge = useMemo(() => {
      const cls =
        task.priority === "HIGH"
          ? "bg-red-100 text-red-800"
          : task.priority === "MEDIUM"
          ? "bg-yellow-100 text-yellow-800"
          : "bg-green-100 text-green-800";
      return (
        <span
          className={`self-start md:self-auto px-2 py-1 text-xs font-medium rounded-lg ${cls}`}
        >
          {task.priority}
        </span>
      );
    }, [task.priority]);

    const handleUpdate = async (e) => {
      e.preventDefault();
      const result = taskCreateForm.safeParse({
        title,
        description,
        due_date: dueDate || null,
        priority,
      });
      if (!result.success) {
        let fieldErrs = {};
        result.error.issues.forEach((err, _) => {
          let key = err.path[0];
          if (!fieldErrs[key]) fieldErrs[key] = err.message;
        });
        setIsEditing(true);
        setErrs(fieldErrs);
      } else {
        try {
          await onUpdate(task.id, result.data);
          setIsEditing(false);
        } catch (e) {
          setIsEditing(true);
          console.log(e);
        }
      }
    };

    useEffect(() => {
      if (!isEditing) return;
      function onDetectBlur(e) {
        const t = e.target;
        if (!ref.current?.contains(t)) {
          setIsEditing(false);
          onCancelEdit(null);
          setTitle(task.title || "");
          setDescription(task.description || "");
          setDueDate(task.due_date || "");
          setPriority(task.priority || "MEDIUM");
          setErrs(null);
        }
      }
      document.addEventListener("pointerdown", onDetectBlur);
      return () => document.removeEventListener("pointerdown", onDetectBlur);
    }, [isEditing, onCancelEdit, task]);

    return isEditing && !task.is_completed ? (
      <form
        ref={ref}
        tabIndex={0}
        onFocus={() => {
          setIsEditing(true);
          onEdit(task.id);
        }}
        onMouseDown={() => ref.current?.focus()}
        onPointerDown={(e) => e.stopPropagation()}
        onSubmit={handleUpdate}
        className="w-full mx-auto my-8"
      >
        {errs?.general && (
          <div className="p-2 mb-4 text-xs text-red-800 rounded-lg bg-red-50">
            {errs.general}
          </div>
        )}
        <div className="relative mb-4">
          <input
            type="text"
            name="title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setErrs({ ...errs, title: "" });
            }}
            className="block w-full px-0 py-2 text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none peer dark:text-white"
            placeholder=" "
          />
          <label
            htmlFor="title"
            className="absolute text-sm text-gray-500 top-3 -z-10 text-blue-600 scale-75 -translate-y-6 -translate-x-1"
          >
            Title
          </label>

          {errs?.title && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">
              {errs.title}
            </p>
          )}
        </div>
        <div className="relative mb-4">
          <input
            type="text"
            name="description"
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              setErrs({ ...errs, title: "" });
            }}
            className="block w-full px-0 py-2 text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none peer dark:text-white"
            placeholder=" "
          />
          <label
            htmlFor="description"
            className="absolute text-sm text-gray-500 top-3 -z-10 text-blue-600 scale-75 -translate-y-6 -translate-x-2"
          >
            Description
          </label>
          {errs?.description && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">
              {errs.description}
            </p>
          )}
        </div>
        <div className="flex flex-row justify-between">
          <div className="flex flex-row space-x-4">
            <div className="relative">
              <input
                className="block w-full px-0 py-2 text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none peer"
                type="datetime-local"
                name="dueDate"
                min={new Date()}
                value={dueDate}
                onChange={(e) => {
                  setDueDate(e.target.value);
                  setErrs({ ...errs, due_date: "" });
                }}
                placeholder="Select date"
              />
              <label
                htmlFor="dueDate"
                className="absolute text-sm text-gray-500 top-3 -z-10 text-blue-600 scale-75 -translate-y-6 -translate-x-1"
              >
                Due date
              </label>

              {errs?.due_date && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {errs.due_date}
                </p>
              )}
            </div>
            <div className="relative">
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                placeholder="Priority"
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
          <button
            type="submit"
            className="cursor-pointer text-white bg-purple-400 rounded-sm py-1 px-2 hover:bg-purple-600"
          >
            update
          </button>
        </div>
      </form>
    ) : (
      <div
        ref={ref}
        tabIndex={0}
        onFocus={() => {
          setIsEditing(true);
          onEdit(task.id);
        }}
        onMouseDown={() => ref.current?.focus()}
        className="w-full flex items-center px-4 py-2 border border-gray-200 rounded-lg dark:border-gray-700"
      >
        <div>
          <input
            type="checkbox"
            checked={task.is_completed}
            disabled={task.is_completed}
            name="isCompleted"
            onChange={() => onComplete(task.id)}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          />
          <label
            htmlFor="isCompleted"
            className="w-full py-4 ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
          ></label>
        </div>
        <div className="w-full mx-6">
          <h2 className="text-lg font-semibold">{task.title}</h2>
          <p>{task.description}</p>
          <div className="flex flex-col md:flex-row justify-between text-sm text-gray-600">
            <span className="">{task.due_date.split("T")[0]}</span>
            {priorityBadge}
          </div>
        </div>
        <button
          className="cursor-pointer border border-gray-200 rounded-sm p-1 hover:bg-gray-200"
          onClick={() => onDelete(task.id)}
        >
          <svg
            className="w-4 h-4 text-gray-800 dark:text-white"
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
              d="M6 18 17.94 6M18 18 6.06 6"
            />
          </svg>
        </button>
      </div>
    );
  }
);

export default TaskCard;
