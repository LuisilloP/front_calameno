const resolveBaseUrl = () => {
  const candidates = [
    process.env.VITE_API_URL,
    process.env.NEXT_PUBLIC_BASE_URL,
    "http://localhost:8000/api/v1",
  ];

  const raw = candidates.find(
    (value): value is string => typeof value === "string" && value.trim().length > 0
  );

  const normalized = raw ?? "http://localhost:8000/api/v1";
  return normalized.endsWith("/")
    ? normalized.slice(0, -1)
    : normalized;
};

export const BASE_URL = resolveBaseUrl();

export const buildUrl = (path: string) => {
  const cleanBase = BASE_URL;
  return `${cleanBase}${path.startsWith("/") ? path : `/${path}`}`;
};
