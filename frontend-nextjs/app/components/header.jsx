"use client";

import Link from "next/link";
import UserBtn from "./userBtn";
import LogoutBtn from "./logoutBtn";
import { useAuth } from "../authProvider";

export default function Header() {
  const auth = useAuth();
  return (
    <header>
      <nav className="fixed top-0 z-10 w-full h-16 bg-white border-gray-200 px-4 lg:px-6 py-2.5 dark:bg-gray-800">
        <div className="max-w-screen-xl flex justify-between items-center mx-auto">
          <Link href="/" className="flex items-center">
            <span className="self-center text-lg text-gray-800 font-semibold whitespace-nowrap dark:text-white">
              TaskManager
            </span>
          </Link>
          <div className="flex flex-row items-center">
            {auth.isAuthenticated ? (
              <UserBtn userEmail={auth.userEmail} />
            ) : (
              <Link
                href="/login"
                className="text-gray-800 dark:text-white hover:bg-gray-50 focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-4 lg:px-5 py-2 lg:py-2.5 mr-2 dark:hover:bg-gray-700 focus:outline-none dark:focus:ring-gray-800"
              >
                Log in
              </Link>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
