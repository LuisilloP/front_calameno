import { NextResponse } from "next/server";

import { clearAuthCookie, getAuthCookie } from "@/lib/auth-cookie";
import { env } from "@/lib/env";
import { toApiError } from "@/lib/errors";

export async function POST() {
  try {
    const token = getAuthCookie();
    clearAuthCookie();

    if (!token) {
      return NextResponse.json({ message: "Sesion cerrada" });
    }

    await fetch(`${env.apiBaseUrl}/api/v1/auth/logout`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).catch(() => undefined);

    return NextResponse.json({ message: "Sesion cerrada" });
  } catch (error) {
    const apiError = toApiError(error);
    return NextResponse.json(apiError, { status: apiError.status ?? 500 });
  }
}
