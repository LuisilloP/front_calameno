import { NextResponse } from "next/server";

import { env } from "@/lib/env";
import { setAuthCookie } from "@/lib/auth-cookie";
import { toApiError } from "@/lib/errors";
import type { LoginDto, LoginResponse } from "@/types/auth";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as LoginDto;

    const response = await fetch(`${env.apiBaseUrl}/api/v1/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      const error = toApiError({ response: { status: response.status, data: errorBody, headers: {} } });
      return NextResponse.json(error, { status: response.status || 401 });
    }

    const data = (await response.json()) as LoginResponse & { plainTextToken?: string };
    const token = data.token ?? data.plainTextToken;

    if (!token) {
      return NextResponse.json(
        { code: "missing_token", message: "La API no devolvio un token de acceso." },
        { status: 500 },
      );
    }

    setAuthCookie(token);

    const meResponse = await fetch(`${env.apiBaseUrl}/api/v1/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!meResponse.ok) {
      return NextResponse.json(
        { code: "me_failed", message: "No fue posible resolver el usuario autenticado." },
        { status: meResponse.status },
      );
    }

    const meData = await meResponse.json();

    return NextResponse.json({ user: meData.data ?? data.user ?? null });
  } catch (error) {
    const apiError = toApiError(error);
    return NextResponse.json(apiError, { status: apiError.status ?? 500 });
  }
}
