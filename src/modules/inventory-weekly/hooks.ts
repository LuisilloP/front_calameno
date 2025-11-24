"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { fetchCategories, fetchWeeklyStock } from "./api";
import {
  InventoryCategory,
  WeeklyStockRequest,
  WeeklyStockResponse,
} from "./types";
import {
  inventoryWeeklyKeys,
  normalizeWeeklyRequest,
} from "./query-keys";

const FIVE_MINUTES = 1000 * 60 * 5;
const RETRY_DISABLED = 0;

export const useInventoryCategories = (initialData?: InventoryCategory[]) =>
  useQuery({
    queryKey: inventoryWeeklyKeys.categories(),
    queryFn: fetchCategories,
    initialData,
    staleTime: FIVE_MINUTES,
  });

type WeeklyOptions = {
  enabled?: boolean;
  initialData?: WeeklyStockResponse;
};

export const useWeeklyStock = (
  params: WeeklyStockRequest | null,
  options?: WeeklyOptions
) => {
  const normalizedParams = normalizeWeeklyRequest(params);
  const enabled = Boolean(normalizedParams) && (options?.enabled ?? true);

  return useQuery({
    queryKey: normalizedParams
      ? inventoryWeeklyKeys.weekly(normalizedParams)
      : inventoryWeeklyKeys.weeklyIdle(),
    queryFn: () => {
      if (!normalizedParams) {
        return Promise.resolve<WeeklyStockResponse>([]);
      }
      return fetchWeeklyStock(normalizedParams);
    },
    enabled,
    placeholderData: keepPreviousData,
    initialData: options?.initialData,
    retry: RETRY_DISABLED,
    staleTime: FIVE_MINUTES,
  });
};
