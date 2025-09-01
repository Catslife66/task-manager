"use server";

import { cookies } from "next/headers";

export async function setAccessToken(accessToken) {
  const cookieStore = await cookies();
  return cookieStore.set({
    name: "access_token",
    value: accessToken,
    httpOnly: true,
  });
}

export async function setRefreshToken(refreshToken) {
  const cookieStore = await cookies();
  return cookieStore.set({
    name: "refresh_token",
    value: refreshToken,
    httpOnly: true,
  });
}

export async function getAccessToken() {
  const cookieStore = await cookies();
  return cookieStore.get("access_token")?.value;
}

export async function getRefreshToken() {
  const cookieStore = await cookies();
  return cookieStore.get("refresh_token")?.value;
}

export async function deleteTokens() {
  const cookieStore = await cookies();
  cookieStore.delete("access_token", { path: "/" });
  cookieStore.delete("refresh_token", { path: "/" });
}
