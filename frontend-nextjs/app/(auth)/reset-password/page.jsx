"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { passwordResetForm } from "../../../lib/utils/validators";
import { useAuth } from "../../authProvider";

const RESET_PASSWORD_ENDPOINT = "/users/reset-password";

export default function page() {
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [errs, setErrs] = useState(null);
  const [msg, setMsg] = useState(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const auth = useAuth();

  const token = searchParams.get("token") || "";

  const hasToken = useMemo(() => {
    return token && token.length > 0;
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!hasToken) {
      setErrs(["Invalid or missing reset token."]);
      return;
    }
    const result = passwordResetForm.safeParse({ password, password2 });
    if (!result.success) {
      const errors = result.error.issues.map((er, _) => er.message);
      console.log(errors);
      setErrs(errors);
      return;
    }
    if (password !== password2) {
      setErrs(["Passwords do not match."]);
      return;
    }
    try {
      const { password } = result.data;
      await auth.api.post(RESET_PASSWORD_ENDPOINT, {
        token: token,
        new_password: password,
      });
      setMsg("Your have reset your password successfully. Please login.");
      setTimeout(() => {
        router.replace("/login");
        setPassword("");
        setPassword2("");
        setErrs(null);
        setMsg(null);
      }, 1000);
    } catch (e) {
      if (e.response) {
        const err =
          e.response.data?.errors?.message ||
          e.response.data?.errors?.detail ||
          e.message;
        setErrs([err]);
        console.log(e);
      } else {
        setErrs(["An error occurred. Please try again."]);
        console.log(e);
      }
    }
  };

  if (!hasToken)
    return (
      <section className="bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
          <div className="p-4 text-red-800 border border-red-300 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400 dark:border-red-800">
            <div className="flex justify-center items-center space-x-2 mb-4">
              <svg
                className="w-6 h-6"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
              </svg>
              <span className="sr-only">Info</span>
              <h3 className="text-xl font-semibold">Invalid link</h3>
            </div>
            <div className="mt-2 mb-4">
              The password reset link is missing or malformed. Please request a
              new one.
            </div>
          </div>
        </div>
      </section>
    );

  return (
    <section className="bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
        <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
              Reset your password
            </h1>
            {errs && errs.length > 1 && (
              <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50">
                {errs.map((err, i) => (
                  <p key={i}>{err}</p>
                ))}
              </div>
            )}
            {errs && errs.length === 1 && (
              <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50">
                {errs}
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
                  htmlFor="password"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Your new password
                </label>
                <input
                  type="password"
                  name="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrs(null);
                  }}
                  className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  autoComplete="off"
                  required=""
                />
              </div>
              <div>
                <label
                  htmlFor="password2"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Confirm your new password
                </label>
                <input
                  type="password"
                  name="password2"
                  value={password2}
                  onChange={(e) => {
                    setPassword2(e.target.value);
                    setErrs(null);
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
                Reset Password
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
