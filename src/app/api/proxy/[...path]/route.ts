
import { NextResponse, type NextRequest } from "next/server";

import { getAuthCookie } from "@/lib/auth-cookie";
import { env } from "@/lib/env";

const API_BASE = env.apiBaseUrl.replace(/\/$/, "");

async function proxy(request: NextRequest, params: { path: string[] }) {
  const token = getAuthCookie();
  const targetPath = params.path.join("/");
  const search = request.nextUrl.search;
  const targetUrl = `${API_BASE}/${targetPath}${search}`;

  const headers = new Headers(request.headers);
  headers.set("X-Forwarded-Host", request.nextUrl.host);
  headers.set("X-Forwarded-Proto", request.nextUrl.protocol.replace(":", ""));
  headers.set("Accept", "application/json");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let body: BodyInit | undefined;
  if (request.method !== "GET" && request.method !== "HEAD") {
    const text = await request.text();
    if (text) {
      body = text;
      headers.set("Content-Type", headers.get("Content-Type") ?? "application/json");
    }
  }

  const upstreamResponse = await fetch(targetUrl, {
    method: request.method,
    headers,
    body,
  });

  const responseHeaders = new Headers(upstreamResponse.headers);
  responseHeaders.delete("set-cookie");

  const responseBody = await upstreamResponse.arrayBuffer();

  return new NextResponse(responseBody, {
    status: upstreamResponse.status,
    headers: responseHeaders,
  });
}

export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  return proxy(request, params);
}

export async function POST(request: NextRequest, { params }: { params: { path: string[] } }) {
  return proxy(request, params);
}

export async function PUT(request: NextRequest, { params }: { params: { path: string[] } }) {
  return proxy(request, params);
}

export async function PATCH(request: NextRequest, { params }: { params: { path: string[] } }) {
  return proxy(request, params);
}

export async function DELETE(request: NextRequest, { params }: { params: { path: string[] } }) {
  return proxy(request, params);
}
