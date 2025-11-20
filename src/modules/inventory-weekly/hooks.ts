"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchCategories, fetchWeeklyStock } from "./api";
import {
  InventoryCategory,
  WeeklyStockRequest,
  WeeklyStockResponse,
} from "./types";

const INVENTORY_WEEKLY_KEY = "inventory-weekly";
const FIVE_MINUTES = 1000 * 60 * 5;

export const useInventoryCategories = (initialData?: InventoryCategory[]) =>
  useQuery({
    queryKey: [INVENTORY_WEEKLY_KEY, "categories"],
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
) =>
  useQuery({
    queryKey: [INVENTORY_WEEKLY_KEY, "weekly", params],
    queryFn: () => {
      if (!params || params.categories.length === 0) {
        throw new Error("Se requiere al menos una categoria");
      }
      return fetchWeeklyStock(params);
    },
    enabled:
      Boolean(params && params.categories.length > 0) &&
      (options?.enabled ?? true),
    keepPreviousData: true,
    initialData: options?.initialData,
  });
