"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getCsrfFromCookie } from "../lib/utils/getCSRFToken";
import axios from "axios";

export const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

const LOGIN_URL = "/login";
const LOGIN_REDIRECT_URL = "/";
const BACKEND_ENDPOINT_BASE = `${process.env.NEXT_PUBLIC_API_URL}/api`;
const VERIFY_ACCESS_API_ENDPOINT = `${BACKEND_ENDPOINT_BASE}/users/verify`;
const VERIFY_REFRESH_API_ENDPOINT = `${BACKEND_ENDPOINT_BASE}/users/refresh`;
const LOGOUT_ENDPOINT = "/users/logout";

export default function AuthProvider({ children }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessToken, setAccessToken] = useState(null);
  const [userEmail, setUserEmail] = useState(null);

  const searchParam = useSearchParams();
  const router = useRouter();

  async function verifyWithAccess(token) {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const res = await axios.post(VERIFY_ACCESS_API_ENDPOINT, {}, config);
      const user = res.data;
      setUserEmail(user.email);
      return true;
    } catch (e) {
      return false;
    }
  }

  async function verifyWithRefresh() {
    try {
      const csrf = getCsrfFromCookie();
      const config = {
        withCredentials: true,
        headers: { "X-CSRF-Token": csrf || "" },
      };
      const res = await axios.post(VERIFY_REFRESH_API_ENDPOINT, {}, config);
      const token = res.data?.access_token || null;
      if (token) setAccessToken(token);
      return token;
    } catch (e) {
      return null;
    }
  }

  async function getUserState() {
    let token = accessToken || (await verifyWithRefresh());

    if (!token) {
      setIsAuthenticated(false);
      setAccessToken(null);
      setUserEmail(null);
      return;
    }

    // verify the token once
    const ok = await verifyWithAccess(token);
    if (ok) {
      setIsAuthenticated(true);
      if (!accessToken) setAccessToken(token);
    } else {
      setIsAuthenticated(false);
      setAccessToken(null);
      setUserEmail(null);
    }
  }

  const api = useMemo(() => {
    const instance = axios.create({
      baseURL: BACKEND_ENDPOINT_BASE,
      timeout: 1000,
      withCredentials: false,
    });

    instance.interceptors.request.use((config) => {
      if (accessToken) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      return config;
    });

    instance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const { response, config } = error || {};
        if (!response || error.response?.status !== 401 || !config._retry) {
          throw error;
        }
        config._retry = true;
        const token = await verifyWithRefresh();
        if (!token) throw error;
        return instance(config);
      }
    );

    return instance;
  }, [accessToken, verifyWithRefresh]);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        await getUserState();
      } catch (e) {
        console.error("Auth init failed:", e);
        if (!cancelled) {
          setIsAuthenticated(false);
          setAccessToken(null);
          setUserEmail(null);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = (access, email = null) => {
    setAccessToken(access);
    setIsAuthenticated(true);
    if (email) setUserEmail(email);
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

  const logout = async () => {
    try {
      await api.post(
        LOGOUT_ENDPOINT,
        {},
        {
          withCredentials: true,
          headers: { "X-CSRF-Token": getCsrfFromCookie() || "" },
        }
      );
    } catch (e) {
      console.log(e);
    } finally {
      setIsAuthenticated(false);
      setUserEmail(null);
      setAccessToken(null);
      router.replace(LOGIN_URL);
    }
  };

  if (isLoading) return null;

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, accessToken, userEmail, api, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
