import { NextResponse, type NextRequest } from "next/server";

import { AUTH_COOKIE } from "@/lib/constants";

const AUTH_MODE = process.env.AUTH_MODE ?? process.env.NEXT_PUBLIC_AUTH_MODE;
const PROTECTED_PATHS = ["/uoms", "/products"];

export function middleware(request: NextRequest) {
  if (AUTH_MODE !== "bff") {
    return NextResponse.next();
  }

  const token = request.cookies.get(AUTH_COOKIE)?.value;
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PATHS.some((route) => pathname.startsWith(route));
  const isAuthPage = pathname.startsWith("/login");

  if (!token && isProtected) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (token && isAuthPage) {
    return NextResponse.redirect(new URL("/uoms", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/uoms/:path*", "/products/:path*", "/login"],
};
