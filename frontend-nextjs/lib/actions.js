import {
  deleteTokens,
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
} from "./auth";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api`;

export async function getAuthState() {
  const accessToken = await getAccessToken();
  const refreshToken = await getRefreshToken();

  if (!accessToken) {
    return false;
  }
  try {
    const res = await fetch(`${API_URL}/users/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (res.ok) {
      return res.json();
    }

    if (res.status === 401 && refreshToken) {
      const refreshRes = await fetch(`${API_URL}/users/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${refreshToken}`,
        },
      });
      if (!refreshRes.ok) {
        return false;
      }
      const data = await refreshRes.json();
      setAccessToken(data.access_token);
      setRefreshToken(data.refresh_token);
      return true;
    }
  } catch (error) {
    console.error("Error during authentication:", error);
    return false;
  }
}

export async function login(accessToken, refreshToken) {
  await setAccessToken(accessToken);
  await setRefreshToken(refreshToken);
}

export async function logout() {
  await deleteTokens();
}
