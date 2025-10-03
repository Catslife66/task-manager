import React, { useState, useRef, useEffect } from "react";
import LogoutBtn from "./logoutBtn";
import Link from "next/link";

export default function UserBtn({ userEmail }) {
  const ref = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div ref={ref} className="relative">
      <button
        data-dropdown-toggle="userAvatar"
        className="cursor-pointer flex text-sm border border-gray-800 rounded-full p-1 hover:bg-gray-100"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="sr-only">Open user menu</span>
        <svg
          className="w-6 h-6 text-gray-800 dark:text-white"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            stroke="currentColor"
            strokeWidth="2"
            d="M7 17v1a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1a3 3 0 0 0-3-3h-4a3 3 0 0 0-3 3Zm8-9a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
          />
        </svg>
      </button>

      {isOpen && (
        <div
          onPointerOver={() => setIsOpen(true)}
          onPointerOut={() => setIsOpen(false)}
          className="absolute right-0 mt-4 z-10 bg-white divide-y divide-gray-100 rounded-lg shadow-sm dark:bg-gray-700 dark:divide-gray-600"
        >
          <div className="px-4 py-3 text-sm text-gray-900 dark:text-white">
            <div className="font-medium truncate">{userEmail || ""}</div>
          </div>
          <ul
            className="py-2 text-sm text-gray-700 dark:text-gray-200"
            aria-labelledby="dropdownUserAvatarButton"
          >
            <li>
              <Link
                href="/tasks"
                className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
              >
                My Tasks
              </Link>
            </li>
            <li>
              <Link
                href="/tasks/done"
                className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
              >
                Completed Tasks
              </Link>
            </li>
          </ul>
          <div className="py-2">
            <LogoutBtn />
          </div>
        </div>
      )}
    </div>
  );
}
