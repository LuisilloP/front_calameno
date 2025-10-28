import axios from "axios";
import axiosRetry from "axios-retry";

import { authStore } from "@/store/auth.store";

import { env, isBffMode } from "./env";
import { redirectToLogin } from "./guards";
import { toApiError } from "./errors";

const api = axios.create({
  baseURL: isBffMode ? "/api/proxy" : env.apiBaseUrl,
  withCredentials: isBffMode,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosRetry(api, {
  retries: 2,
  retryDelay: axiosRetry.exponentialDelay,
  shouldResetTimeout: true,
  retryCondition: (error) => {
    return (
      error.response?.status === 429 ||
      (error.response?.status ?? 0) >= 500 ||
      error.code === "ECONNABORTED"
    );
  },
});

api.interceptors.request.use((config) => {
  const traceId = globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2);
  config.headers = {
    ...config.headers,
    "X-Request-Id": traceId,
  };

  const { token } = authStore.getState();
  if (!isBffMode && token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const apiError = toApiError(error);
    if (apiError.status === 401) {
      const store = authStore.getState();
      store.logout({ silent: true });
      if (typeof window !== "undefined" && window.location.pathname !== "/login") {
        redirectToLogin();
      }
    }
    return Promise.reject(apiError);
  },
);

export { api };
