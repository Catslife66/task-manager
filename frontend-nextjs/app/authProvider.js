"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import { csrftoken } from "../lib/utils/getCSRFToken";
import axios from "axios";

export const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

const LOGIN_REDIRECT_URL = "/";
const VERIFY_ACCESS_API_ENDPOINT = `${process.env.NEXT_PUBLIC_API_URL}/api/users/verify`;
const VERIFY_REFRESH_API_ENDPOINT = `${process.env.NEXT_PUBLIC_API_URL}/api/users/refresh`;

export default function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessToken, setAccessToken] = useState(null);
  const [userEmail, setUserEmail] = useState(null);

  const searchParam = useSearchParams();
  const router = useRouter();

  async function verifyWithAccess() {
    if (!accessToken) return false;
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      };
      const res = await axios.post(VERIFY_ACCESS_API_ENDPOINT, config);
      const user = res.data;
      setUserEmail(user.email);
      return true;
    } catch (e) {
      return false;
    }
  }

  async function verifyWithRefresh() {
    try {
      const config = {
        withCredentials: true,
        headers: { "X-CSRF-Token": csrftoken },
      };
      const res = await axios.post(VERIFY_REFRESH_API_ENDPOINT, config);
      const { access_token } = res.data;
      setAccessToken(access_token);
      return true;
    } catch (e) {
      return false;
    }
  }

  async function getUserState() {
    if (accessToken) {
      const ok = await verifyWithAccess();
      if (ok) {
        setIsAuthenticated(true);
        return;
      }
    }

    const refreshed = await verifyWithRefresh();
    if (refreshed) {
      const ok = await verifyWithAccess();
      setIsAuthenticated(true);
      if (!ok) {
        setAccessToken(null);
        setUserEmail(null);
      }
    } else {
      setIsAuthenticated(false);
      setAccessToken(null);
      setUserEmail(null);
    }
  }

  useEffect(() => {
    getUserState();
  }, []);

  const login = (email) => {
    if (email) setUserEmail(email);
    setIsAuthenticated(true);
    const nextUrl = searchParam.get("next");
    const invalidNextUrl = ["/login", "/logout", "/register"];
    if (
      nextUrl &&
      !invalidNextUrl.includes(nextUrl) &&
      nextUrl.startsWith("/")
    ) {
      router.replace(nextUrl);
    } else {
      router.replace(LOGIN_REDIRECT_URL);
    }
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, accessToken, userEmail, login }}
    >
      {children}
    </AuthContext.Provider>
  );
}
