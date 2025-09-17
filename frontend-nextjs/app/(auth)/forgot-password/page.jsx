"use client";

import React, { useState } from "react";
import { passwordResetRequestForm } from "../../../lib/utils/validators";
import { useAuth } from "../../authProvider";

const FORGOT_PASSWORD_ENDPOINT = "/users/forgot-password";

export default function page() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);
  const [msg, setMsg] = useState(null);
  const auth = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = passwordResetRequestForm.safeParse({ email });
    if (!result.success) {
      const error = result.error.issues[0]?.message || "Invalid input";
      setError(error);
      return;
    }

    try {
      await auth.api.post(FORGOT_PASSWORD_ENDPOINT, result.data);
      setMsg("Please check your email to receive a password reset link.");
    } catch (e) {
      if (e.response) {
        const err =
          e.response.data?.errors?.message ||
          e.response.data?.errors?.detail ||
          e.message;
        setError(err);
        console.log(e);
      } else {
        setError("An error occurred. Please try again.");
        console.log(e);
      }
    }
  };

  return (
    <section className="bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
        <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
              Enter your email to reset password
            </h1>
            {error && (
              <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50">
                {error}
              </div>
            )}
            {msg && (
              <div className="p-4 mb-4 text-sm text-green-800 rounded-lg bg-green-50">
                {msg}
              </div>
            )}
            <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="email"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Your email
                </label>
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError(null);
                    setMsg(null);
                  }}
                  className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  autoComplete="off"
                  required=""
                />
              </div>
              <button
                type="submit"
                className="cursor-pointer w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              >
                Request to reset password
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
