"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getCsrfFromCookie } from "../lib/utils/getCSRFToken";
import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosRequestHeaders,
} from "axios";

const LOGIN_URL = "/login";
const LOGIN_REDIRECT_URL = "/";
const BACKEND_ENDPOINT_BASE = `${process.env.NEXT_PUBLIC_API_URL}/api`;
const VERIFY_ACCESS_API_ENDPOINT = `${BACKEND_ENDPOINT_BASE}/users/verify`;
const VERIFY_REFRESH_API_ENDPOINT = `${BACKEND_ENDPOINT_BASE}/users/refresh`;
const LOGOUT_ENDPOINT = "/users/logout";

interface AxiosRequestConfigWithRetry extends AxiosRequestConfig {
  _retry?: boolean;
}

export type AuthContextValue = {
  isAuthenticated: boolean;
  accessToken: string | null;
  userEmail: string | null;
  api: AxiosInstance;
  login: (access: string, email?: string | null) => void;
  logout: () => Promise<void>;
};

type Props = {
  children: React.ReactNode;
};

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined
);

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
};

export default function AuthProvider({ children }: Props) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const searchParam = useSearchParams();
  const router = useRouter();

  async function verifyWithAccess(token: string): Promise<boolean> {
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

  async function verifyWithRefresh(): Promise<string | null> {
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

  async function getUserState(): Promise<void> {
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

  const api: AxiosInstance = useMemo(() => {
    const instance = axios.create({
      baseURL: BACKEND_ENDPOINT_BASE,
      timeout: 1000,
      withCredentials: false,
    });

    instance.interceptors.request.use((config) => {
      if (accessToken) {
        const headers: AxiosRequestHeaders = (config.headers ??
          {}) as AxiosRequestHeaders;
        headers.Authorization = `Bearer ${accessToken}`;
        config.headers = headers;
      }
      return config;
    });

    instance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const response = error?.response;
        const config = (error?.config ?? {}) as AxiosRequestConfigWithRetry;
        if (!response || response.status !== 401 || config._retry) {
          throw error;
        }
        config._retry = true;
        const token = await verifyWithRefresh();
        if (!token) {
          throw error;
        }

        const headers: AxiosRequestHeaders = (config.headers ??
          {}) as AxiosRequestHeaders;
        headers.Authorization = `Bearer ${accessToken ?? token}`;
        config.headers = headers;

        return instance(config);
      }
    );

    return instance;
  }, [accessToken]);

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

  const login = (access: string, email: string | null = null) => {
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

  const logout = async (): Promise<void> => {
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
      router.replace(LOGIN_URL);
      setIsAuthenticated(false);
      setUserEmail(null);
      setAccessToken(null);
    }
  };

  if (isLoading) return null;

  const value: AuthContextValue = {
    isAuthenticated,
    accessToken,
    userEmail,
    api,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
