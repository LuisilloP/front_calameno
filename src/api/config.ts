import { runtimeEnv } from "@/config/env";

const resolveBaseUrl = () => {
  return runtimeEnv.baseUrl;
};

export const BASE_URL = resolveBaseUrl();

export const buildUrl = (path: string) => {
  const cleanBase = BASE_URL;
  return `${cleanBase}${path.startsWith("/") ? path : `/${path}`}`;
};
