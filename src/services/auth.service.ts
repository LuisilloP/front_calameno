import { api } from "@/lib/axios";
import { env, isBffMode } from "@/lib/env";
import { defaultError } from "@/lib/errors";
import type { ApiError } from "@/types/common";
import type { LoginDto, LoginResponse, MeResponse, User } from "@/types/auth";

const AUTH_ROUTES = {
  login: "/api/v1/auth/login",
  logout: "/api/v1/auth/logout",
  me: "/api/v1/auth/me",
} as const;

async function loginDirect(dto: LoginDto): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>(AUTH_ROUTES.login, dto);
  return response.data;
}

async function loginBff(dto: LoginDto): Promise<LoginResponse> {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(dto),
  });

  if (!response.ok) {
    const data = (await response.json().catch(() => defaultError)) as ApiError;
    throw data;
  }

  const data = (await response.json().catch(() => ({ user: null }))) as { user: User | null };
  return { token: "", user: data.user ?? (await me()) };
}

async function logoutDirect(): Promise<void> {
  await api.post(AUTH_ROUTES.logout);
}

async function logoutBff(): Promise<void> {
  await fetch("/api/auth/logout", { method: "POST" });
}

async function me(): Promise<User> {
  const response = await api.get<MeResponse>(AUTH_ROUTES.me);
  return response.data.data;
}

export const authService = {
  login: async (dto: LoginDto) => {
    if (env.authMode === "bff") {
      return loginBff(dto);
    }
    return loginDirect(dto);
  },
  me,
  logout: async () => {
    if (isBffMode) {
      await logoutBff();
    } else {
      await logoutDirect();
    }
  },
};
