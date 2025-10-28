import type { AxiosError } from "axios";

import type { ApiError } from "@/types/common";

export const defaultError: ApiError = {
  code: "unexpected_error",
  message: "Ha ocurrido un error inesperado. Intenta nuevamente mas tarde.",
};

export function isApiError(error: unknown): error is ApiError {
  return Boolean(
    error &&
      typeof error === "object" &&
      "code" in error &&
      "message" in error &&
      typeof (error as ApiError).code === "string" &&
      typeof (error as ApiError).message === "string",
  );
}

export function toApiError(error: unknown): ApiError {
  if (isApiError(error)) {
    return error;
  }

  const axiosError = error as AxiosError<{ code?: string; message?: string; errors?: Record<string, string[]> }>;

  if (axiosError?.response) {
    const { status, data, headers } = axiosError.response;
    const traceId = headers?.["x-request-id"] ?? headers?.["x-trace-id"];

    return {
      code: data?.code ?? `http_${status ?? "error"}`,
      message: data?.message ?? axiosError.message ?? defaultError.message,
      errors: data?.errors,
      status,
      traceId: Array.isArray(traceId) ? traceId[0] : traceId,
    };
  }

  if (axiosError?.request) {
    return {
      code: "network_error",
      message: "No fue posible comunicarse con el servidor. Verifica tu conexion.",
    };
  }

  if (error instanceof Error) {
    return {
      code: "unexpected_error",
      message: error.message,
    };
  }

  return defaultError;
}

export function extractFieldError(apiError: ApiError, field: string): string | undefined {
  return apiError.errors?.[field]?.[0];
}
