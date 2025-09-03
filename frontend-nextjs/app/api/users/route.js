import { NextResponse } from "next/server";
import axios from "axios";

const URL = `${process.env.API_INTERNAL_URL}/api/users`;

export async function GET(request) {
  console.log(request);
  try {
    const res = await axios.get(URL);
    console.log(res);
    return NextResponse.json({ users: res.data }, { status: res.status });
  } catch (e) {
    console.log(e);
    return NextResponse.json(
      { error: e.response?.data?.detail },
      { status: e.response?.status }
    );
  }
}
