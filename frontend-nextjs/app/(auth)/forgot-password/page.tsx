"use client";

import React, { FormEvent, useState } from "react";
import { passwordResetRequestForm } from "../../../lib/utils/validators";
import { useAuth } from "../../authProvider";
import {
  PasswordResetRequestFormData,
  ResetPasswordRequestFormErrs,
} from "../../../lib/users/types";
import { useMutation } from "@tanstack/react-query";
import { forgetPasswordRequest } from "../../../lib/users/actions";
import { AxiosError } from "axios";

export default function page() {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<ResetPasswordRequestFormErrs | null>(
    null
  );
  const [msg, setMsg] = useState(null);
  const auth = useAuth();

  const requestPasswordResetMu = useMutation({
    mutationFn: (data: PasswordResetRequestFormData) =>
      forgetPasswordRequest(auth.api, data),
    onSuccess: () =>
      setMsg("Please check your email to receive a password reset link."),
    onError: (e: AxiosError) => {
      const msg =
        (e.response?.data as any).errors?.message ||
        (e.response?.data as any).errors?.detail ||
        e.message ||
        "Reset password request failed.";
      setErrors({ general: msg });
    },
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const raw: PasswordResetRequestFormData = { email: email };
    const result = passwordResetRequestForm.safeParse(raw);
    if (!result.success) {
      const errs: ResetPasswordRequestFormErrs = {};
      for (let err of result.error.issues) {
        let key = err.path[0] as keyof PasswordResetRequestFormData;
        if (!errs[key]) errs[key] = err.message;
      }
      setErrors(errs);
      return;
    }

    requestPasswordResetMu.mutateAsync({ email: result.data.email });
    setErrors(null);
  };

  return (
    <section className="bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
        <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
              Enter your email to reset password
            </h1>
            {errors?.email && (
              <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50">
                {errors.email}
              </div>
            )}
            {errors?.general && (
              <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50">
                {errors.general}
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
                    setErrors((prev) =>
                      prev ? { ...prev, email: undefined } : prev
                    );
                    setMsg(null);
                  }}
                  className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  autoComplete="off"
                  required={true}
                />
              </div>
              <button
                type="submit"
                disabled={requestPasswordResetMu.isPending}
                className="cursor-pointer w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              >
                {requestPasswordResetMu.isPending
                  ? "Requesting..."
                  : "Request to reset password"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
