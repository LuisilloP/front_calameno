export const BASE_URL =
  process.env.VITE_API_URL ?? "http://localhost:8000/api/v1";

const sanitizeBaseUrl = () =>
  BASE_URL.endsWith("/") ? BASE_URL.slice(0, -1) : BASE_URL;

export const buildUrl = (path: string) => {
  const cleanBase = sanitizeBaseUrl();
  return `${cleanBase}${path.startsWith("/") ? path : `/${path}`}`;
};
