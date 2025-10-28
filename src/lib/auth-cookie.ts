import { cookies } from "next/headers";

import { AUTH_COOKIE } from "./constants";

const ONE_WEEK = 60 * 60 * 24 * 7;

export function setAuthCookie(token: string) {
  const cookieStore = cookies();
  cookieStore.set({
    name: AUTH_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ONE_WEEK,
  });
}

export function clearAuthCookie() {
  cookies().delete(AUTH_COOKIE);
}

export function getAuthCookie(): string | null {
  return cookies().get(AUTH_COOKIE)?.value ?? null;
}
