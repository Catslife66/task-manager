"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerForm } from "../../../lib/utils/validators";
import { useAuth } from "../../authProvider";
import {
  RegisterFormData,
  RegisterFormErrs,
  User,
} from "../../../lib/users/types";
import { useMutation } from "@tanstack/react-query";
import { registerUser } from "../../../lib/users/actions";
import { AxiosError } from "axios";

export default function page() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errMsg, setErrMsg] = useState<RegisterFormErrs | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const router = useRouter();
  const auth = useAuth();

  const registerMu = useMutation<User, AxiosError, RegisterFormData>({
    mutationFn: (data: RegisterFormData) => registerUser(auth.api, data),
    onSuccess: () => {
      setSuccessMsg("You have succssfullly registered. Please login.");
      setTimeout(() => {
        router.replace("/login");
      }, 2000);
    },
    onError: (e) => {
      const msg =
        (e.response?.data as any)?.errors?.message ||
        (e.response?.data as any)?.errors?.detail ||
        e.message ||
        "Register failed.";
      setErrMsg({ general: msg });
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const raw: RegisterFormData = { email, password };
    const result = registerForm.safeParse(raw);
    if (!result.success) {
      let errs: RegisterFormErrs = {};
      for (const err of result.error.issues) {
        let key = err.path[0] as keyof RegisterFormData;
        if (!errs[key]) errs[key] = err.message;
      }
      setErrMsg(errs);
    }
    setErrMsg(null);
    setSuccessMsg(null);
    registerMu.mutateAsync({
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
              Create an account
            </h1>
            {successMsg && (
              <div className="rounded-lg bg-green-50 p-4 mb-4 text-green-800">
                {successMsg}
              </div>
            )}
            {errMsg?.email && (
              <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50">
                {errMsg.email}
              </div>
            )}
            {errMsg?.password && (
              <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50">
                {errMsg.password}
              </div>
            )}
            {errMsg?.general && (
              <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50">
                {errMsg.general}
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
                    setErrMsg((prev) =>
                      prev ? { ...prev, email: undefined } : prev
                    );
                    setSuccessMsg(null);
                  }}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  autoComplete="off"
                  required
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
                    setErrMsg((prev) =>
                      prev ? { ...prev, password: undefined } : prev
                    );
                    setSuccessMsg(null);
                  }}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  autoComplete="new-password"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={registerMu.isPending}
                className="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              >
                {registerMu.isPending
                  ? "Creating an account..."
                  : "Create an account"}
              </button>
              <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                Already have an account?{" "}
                <Link
                  href={{
                    pathname: "/login",
                  }}
                  className="font-medium text-blue-600 hover:underline dark:text-blue-500"
                >
                  Login here
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
