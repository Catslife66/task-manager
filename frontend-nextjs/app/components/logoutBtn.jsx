"use client";

import { useState } from "react";
import { useAuth } from "../authProvider";

export default function LogoutBtn() {
  const [isOpenModal, setIsOpenModal] = useState(false);
  const auth = useAuth();

  const submitLogout = async () => {
    setIsOpenModal(false);
    auth.logout();
  };

  return (
    <>
      <button
        data-modal-target="logout-modal"
        data-modal-toggle="logout-modal"
        className="cursor-pointer w-full text-gray-700 hover:bg-gray-200 font-medium text-sm px-5 py-2.5"
        type="button"
        onClick={() => setIsOpenModal(true)}
      >
        Log out
      </button>

      {isOpenModal && (
        <div id="logout-modal" tabIndex="-1" className="logout-modal">
          <div className="relative p-4 w-full h-full bg-gray-100 flex justify-center items-center">
            <div className="relative max-w-2/3 bg-white rounded-lg shadow-sm">
              <button
                type="button"
                className="absolute top-3 end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                data-modal-hide="popup-modal"
                onClick={() => setIsOpenModal(false)}
              >
                <svg
                  className="w-3 h-3"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 14 14"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                  />
                </svg>
                <span className="sr-only">Close modal</span>
              </button>
              <div className="p-4 md:p-5 text-center">
                <svg
                  className="mx-auto mb-4 text-gray-400 w-12 h-12 dark:text-gray-200"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 20 20"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  />
                </svg>
                <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                  Are you sure you want to log out?
                </h3>
                <button
                  data-modal-hide="popup-modal"
                  type="button"
                  className="cursor-pointer w-full text-center text-white bg-red-600 hover:bg-red-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                  onClick={submitLogout}
                >
                  Yes, I'm sure
                </button>
                <button
                  data-modal-hide="popup-modal"
                  type="button"
                  className="cursor-pointer w-full mt-2 py-2.5 px-5 text-sm font-medium text-gray-900 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700"
                  onClick={() => setIsOpenModal(false)}
                >
                  No, cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
