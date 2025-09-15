"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerForm } from "../../../lib/utils/validators";
import { useAuth } from "../../authProvider";

export default function page() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errMsg, setErrMsg] = useState(null);
  const [successMsg, setSucessMsg] = useState(null);
  const router = useRouter();
  const auth = useAuth();
  const REGISTER_ENDPOINT = "/users/register";

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = registerForm.safeParse({ email, password });
    if (!result.success) {
      const errors = result.error.issues.map((er, _) => er.message);
      setErrMsg(errors);
    }
    try {
      await auth.api.post(REGISTER_ENDPOINT, result.data);
      setSucessMsg("You have succssfullly registered. Please login.");
      setTimeout(() => {
        router.replace("/login");
      }, 2000);
    } catch (e) {
      if (e.response) {
        const err = e.response.data?.errors?.message || e.message;
        setErrMsg([err]);
        console.log(err);
      } else if (e.request) {
        console.log("No response from server:", e.request);
      } else {
        console.log("Error in request setup:", e.message);
      }
    }
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
            {errMsg && (
              <ul className="rounded-lg bg-red-50 p-4 mb-4 text-red-800">
                {errMsg.map((er, i) => (
                  <li key={i} className="">
                    {er}
                  </li>
                ))}
              </ul>
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
                    setErrMsg(null);
                    setSucessMsg(null);
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
                    setErrMsg(null);
                    setSucessMsg(null);
                  }}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  autoComplete="new-password"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              >
                Create an account
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
