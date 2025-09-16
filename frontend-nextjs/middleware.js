import { NextResponse } from "next/server";
import * as jose from "jose";

const SESSION_COOKIE_NAME = "session";
const SECRET_KEY = process.env.AUTHJWT_SECRET_KEY;

export async function middleware(request) {
  const url = request.nextUrl.clone();
  const pathname = request.nextUrl.pathname;
  if (pathname.startsWith("/tasks")) {
    const session = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    if (!session) {
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
    try {
      const secret = new TextEncoder().encode(SECRET_KEY);
      await jose.jwtVerify(session, secret, { algorithms: ["HS256"] });
      return NextResponse.next();
    } catch (e) {
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: "/tasks/:path*",
};
