"use client";

import Link from "next/link";
import { RiNextjsFill } from "react-icons/ri";
import { SiFastapi, SiDocker } from "react-icons/si";
import { useAuth } from "./authProvider";

export default function Home() {
  const auth = useAuth();

  return (
    <section className="w-full h-screen bg-white pt-16">
      <div className="h-full py-8 px-4 mx-auto max-w-screen-xl flex flex-col justify-center items-center text-center lg:py-16 lg:px-12">
        <h1 className="mb-4 text-4xl font-extrabold tracking-tight leading-none text-gray-900 md:text-5xl lg:text-6xl dark:text-white">
          Stay Organized, Get Things Done
        </h1>
        <p className="mb-8 text-lg font-normal text-gray-500 lg:text-xl sm:px-16 xl:px-48 dark:text-gray-400">
          Task Manager helps you keep track of everything that matters — from
          daily to-dos to long-term goals. Prioritise, set deadlines, and focus
          on what’s important with a simple, distraction-free interface built to
          keep you productive.
        </p>
        <div className="flex flex-col mb-8 lg:mb-16 space-y-4 sm:flex-row sm:justify-center sm:space-y-0 sm:space-x-4">
          {auth.isAuthenticated ? (
            <Link
              href="/tasks"
              className="inline-flex justify-center items-center py-3 px-5 text-base font-medium text-center text-white rounded-lg bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300"
            >
              Go to tasks
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="inline-flex justify-center items-center py-3 px-5 text-base font-medium text-center text-blue-600 rounded-lg bg-blue-200 hover:bg-blue-300 focus:ring-4 focus:ring-blue-300"
              >
                Login to tasks
              </Link>
              <Link
                href="/register"
                className="inline-flex justify-center items-center py-3 px-5 text-base font-medium text-center text-gray-900 rounded-lg border border-gray-300 hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 dark:text-white dark:border-gray-700 dark:hover:bg-gray-700 dark:focus:ring-gray-800"
              >
                Create an account
              </Link>
            </>
          )}
        </div>

        <div className="px-4 mx-auto text-center md:max-w-screen-md lg:max-w-screen-lg lg:px-36">
          <span className="font-semibold text-gray-400 uppercase">
            FEATURED BY
          </span>
          <div className="flex flex-row flex-wrap justify-center items-center mt-8 space-x-8 text-gray-500 sm:justify-between">
            <RiNextjsFill className="w-12 h-12" />
            <SiFastapi className="w-10 h-10" />
            <SiDocker className="w-12 h-12" />
          </div>
        </div>
      </div>
    </section>
  );
}
