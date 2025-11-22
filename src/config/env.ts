const DEFAULT_BASE_URL = "http://localhost:8000/api/v1";

const pickEnv = (...candidates: Array<string | undefined>) =>
  candidates.find(
    (value): value is string =>
      typeof value === "string" && value.trim().length > 0
  );

const normalizeBaseUrl = (raw?: string) => {
  if (!raw) return DEFAULT_BASE_URL;
  try {
    const url = new URL(raw);
    return url.toString().endsWith("/")
      ? url.toString().slice(0, -1)
      : url.toString();
  } catch (error) {
    console.warn(
      `[env] NEXT_PUBLIC_BASE_URL invalido (${raw}). Usando ${DEFAULT_BASE_URL}.`,
      error
    );
    return DEFAULT_BASE_URL;
  }
};

const envOrUndefined = (key: string) => {
  const raw = process.env[key];
  if (typeof raw !== "string") return undefined;
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

export const runtimeEnv = {
  baseUrl: normalizeBaseUrl(
    pickEnv(envOrUndefined("VITE_API_URL"), envOrUndefined("NEXT_PUBLIC_BASE_URL"))
  ),
  apiToken: envOrUndefined("NEXT_PUBLIC_API_TOKEN"),
  chartsApiUrl: envOrUndefined("NEXT_PUBLIC_API_URL"),
  chartsToken: envOrUndefined("NEXT_PUBLIC_TEST_TOKEN"),
  timezone: pickEnv(
    envOrUndefined("NEXT_PUBLIC_TIMEZONE_UI"),
    envOrUndefined("NEXT_PUBLIC_TIMEZONE")
  ),
};
