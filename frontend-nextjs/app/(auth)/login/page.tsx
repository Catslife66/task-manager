"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useAuth } from "../../authProvider";
import { loginForm } from "../../../lib/utils/validators";
import {
  LoginFormData,
  LoginFormErrs,
  LoginResponse,
} from "../../../lib/users/types";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { loginUser } from "../../../lib/users/actions";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<LoginFormErrs | null>(null);
  const auth = useAuth();

  const loginMu = useMutation<LoginResponse, AxiosError, LoginFormData>({
    mutationFn: (data: LoginFormData) => loginUser(auth.api, data),
    onSuccess: (data, variables) =>
      auth.login(data.access_token, variables.email),
    onError: (err) => {
      const msg =
        (err.response?.data as any)?.errors?.message ||
        (err.response?.data as any)?.errors?.detail ||
        (err as Error).message ||
        "Login failed";
      setError({ general: msg });
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const raw: LoginFormData = { email, password };
    const result = loginForm.safeParse(raw);
    if (!result.success) {
      const errs: LoginFormErrs = {};
      for (const err of result.error.issues) {
        let key = err.path[0] as keyof LoginFormData;
        if (!errs[key]) errs[key] = err.message;
      }
      setError(errs);
      console.log(errs);
      return;
    }

    setError(null);
    loginMu.mutateAsync({
      email: result.data.email,
      password: result.data.password,
    });
  };

  return (
    <section className="bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
        <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
              Sign in to your task manager
            </h1>
            {error?.email && (
              <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50">
                {error.email}
              </div>
            )}
            {error?.password && (
              <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50">
                {error.password}
              </div>
            )}
            {error?.general && (
              <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50">
                {error.general}
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
                    setError((prev) =>
                      prev ? { ...prev, email: undefined } : prev
                    );
                  }}
                  className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  autoComplete="off"
                  required={true}
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError((prev) =>
                      prev ? { ...prev, password: undefined } : prev
                    );
                  }}
                  className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  autoComplete="off"
                  required={true}
                />
              </div>
              <div className="flex items-center justify-between">
                <Link
                  href="/forgot-password"
                  className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-500"
                >
                  Forgot password?
                </Link>
              </div>
              <button
                type="submit"
                disabled={loginMu.isPending}
                className="cursor-pointer w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              >
                {loginMu.isPending ? "Signing in..." : "Sign in"}
              </button>

              <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                Don’t have an account yet?{" "}
                <Link
                  href="/register"
                  className="font-medium text-blue-600 hover:underline dark:text-blue-500"
                >
                  Sign up
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
