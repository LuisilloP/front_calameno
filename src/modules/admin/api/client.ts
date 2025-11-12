import { buildUrl } from "@/api/config";

export type ApiErrorResponse = {
  status: number;
  message: string;
  detail?: string;
  code?: string;
  errors?: Record<string, string[]>;
  raw?: unknown;
};

export type ApiRequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  query?: Record<
    string,
    string | number | boolean | undefined | null
  >;
  signal?: AbortSignal;
};

const defaultHeaders: HeadersInit = {
  Accept: "application/json",
  "Content-Type": "application/json",
};

const isFormData = (payload: unknown): payload is FormData =>
  typeof FormData !== "undefined" && payload instanceof FormData;

const buildQueryString = (
  query?: ApiRequestOptions["query"]
): string => {
  if (!query) return "";
  const params = Object.entries(query).reduce((acc, [key, value]) => {
    if (value === undefined || value === null) return acc;
    return acc.concat([[key, String(value)]]);
  }, [] as Array<[string, string]>);

  if (params.length === 0) return "";
  const searchParams = new URLSearchParams(params);
  return `?${searchParams.toString()}`;
};

const parseErrorPayload = (
  payload: Record<string, unknown>
): ApiErrorResponse => {
  const detailField = payload.detail;
  const detailArray =
    Array.isArray(detailField) && detailField.length > 0
      ? detailField
          .map((item) => {
            if (item && typeof item === "object") {
              const map = item as Record<string, unknown>;
              if (typeof map.msg === "string") {
                return map.msg;
              }
            }
            return "";
          })
          .filter(Boolean)
          .join(" | ")
      : undefined;

  const detailString =
    typeof detailField === "string"
      ? detailField
      : detailArray ??
        (typeof payload.error_detail === "string"
          ? payload.error_detail
          : typeof payload.errorDetail === "string"
          ? payload.errorDetail
          : typeof payload.message === "string"
          ? payload.message
          : undefined);

  const detailObject =
    detailField && typeof detailField === "object"
      ? (detailField as Record<string, unknown>)
      : undefined;

  const codeValue =
    (typeof payload.code === "string" && payload.code) ||
    (typeof detailObject?.code === "string" && detailObject.code) ||
    (typeof payload.error_code === "string" && payload.error_code) ||
    (typeof payload.errorCode === "string" && payload.errorCode);

  return {
    status: typeof payload.status === "number" ? payload.status : 0,
    message:
      (typeof payload.message === "string" && payload.message) ||
      detailString ||
      (typeof detailObject?.message === "string" &&
        detailObject.message) ||
      "Error desconocido",
    detail: detailString,
    code: codeValue,
    errors:
      typeof payload.errors === "object"
        ? (payload.errors as Record<string, string[]>)
        : undefined,
    raw: payload,
  };
};

const parseErrorResponse = async (
  response: Response
): Promise<ApiErrorResponse> => {
  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    payload = undefined;
  }

  const parsed =
    typeof payload === "object"
      ? parseErrorPayload({
          status: response.status,
          ...(payload as Record<string, unknown>),
        })
      : {
          status: response.status,
          message: response.statusText,
          raw: payload,
        };

  return {
    ...parsed,
    status: response.status,
    message: parsed.message || response.statusText,
  };
};

export const normalizeApiError = (
  error: unknown
): ApiErrorResponse => {
  if ((error as ApiErrorResponse)?.status !== undefined) {
    return error as ApiErrorResponse;
  }

  if (error instanceof Error) {
    return {
      status: 0,
      message: error.message,
      raw: error,
    };
  }

  return {
    status: 0,
    message: "Error desconocido",
    raw: error,
  };
};

export type RequestExecutor = <T>(
  path: string,
  options?: ApiRequestOptions
) => Promise<T>;

export const apiRequest: RequestExecutor = async <T>(
  path: string,
  options: ApiRequestOptions = {}
): Promise<T> => {
  const url = `${buildUrl(path)}${buildQueryString(options.query)}`;

  const init: RequestInit = {
    method: options.method ?? "GET",
    headers: defaultHeaders,
    signal: options.signal,
  };

  if (options.body !== undefined) {
    if (isFormData(options.body)) {
      delete (init.headers as Record<string, string>)["Content-Type"];
      init.body = options.body;
    } else {
      init.body = JSON.stringify(options.body);
    }
  }

  const response = await fetch(url, init);
  if (!response.ok) {
    throw await parseErrorResponse(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  if (!text) {
    return undefined as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    return text as T;
  }
};
