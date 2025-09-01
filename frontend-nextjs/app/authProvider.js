"use client";

import { getAuth } from "../lib/actions";
import { createContext, useContext, useEffect, useState } from "react";
import { setAccessToken, setRefreshToken } from "../lib/auth";

export const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isloading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const checkAuth = async () => {
    try {
      const userData = await getAuth();
      if (userData) {
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (e) {
      setError("Authentication failed");
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (accessToken, refreshToken) => {
    // try {
    //   const res = await fetch(`${API_URL}/users/login`, {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify({ email, password }),
    //   });

    //   if (!res.ok) {
    //     throw new Error("Login failed");
    //   }

    //   const data = await res.json();
    //   await setAccessToken(data.access_token);
    //   await setRefreshToken(data.refresh_token);
    //   return data;
    // } catch (error) {
    //   console.error("Error during login:", error);
    //   throw error;
    // }
    await setAccessToken(accessToken);
    await setRefreshToken(refreshToken);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isloading, error, checkAuth, login }}>
      {children}
    </AuthContext.Provider>
  );
}
