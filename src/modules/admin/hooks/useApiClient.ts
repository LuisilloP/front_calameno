"use client";

import { useCallback, useReducer, useState } from "react";
import {
  ApiRequestOptions,
  apiRequest,
  ApiErrorResponse,
  normalizeApiError,
} from "../api/client";

type PendingAction = { type: "start" } | { type: "end" };

const pendingReducer = (state: number, action: PendingAction) => {
  switch (action.type) {
    case "start":
      return state + 1;
    case "end":
      return state > 0 ? state - 1 : 0;
    default:
      return state;
  }
};

export const useApiClient = () => {
  const [pending, dispatch] = useReducer(pendingReducer, 0);
  const [error, setError] = useState<ApiErrorResponse | null>(null);

  const request = useCallback(
    async <T>(path: string, options?: ApiRequestOptions) => {
      dispatch({ type: "start" });
      setError(null);

      try {
        const result = await apiRequest<T>(path, options);
        dispatch({ type: "end" });
        return result;
      } catch (err) {
        const normalized = normalizeApiError(err);
        setError(normalized);
        dispatch({ type: "end" });
        throw normalized;
      }
    },
    []
  );

  return {
    request,
    isLoading: pending > 0,
    error,
  };
};
