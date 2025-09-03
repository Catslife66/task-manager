import axios from "axios";
import { NextResponse } from "next/server";
import { login } from "../../../lib/actions";

const LOGIN_URL = `${process.env.API_INTERNAL_URL}/api/users/login`;

export async function POST(request) {
  try {
    const requestData = await request.json();
    const res = await axios.post(LOGIN_URL, requestData);
    const { access_token, refresh_token } = res.data;
    await login(access_token, refresh_token);
    return NextResponse.json(
      { isLoggedIn: true },
      { status: res.status || 200 }
    );
  } catch (e) {
    return NextResponse.json(
      { error: e.response?.data?.detail },
      { status: e.response?.status || 400 }
    );
  }
}
