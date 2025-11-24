import { WeeklyStockRequest } from "./types";
import { normalizeIsoToMonday } from "./utils/date";

const toSortedUniqueCategories = (categories: number[]) =>
  Array.from(
    new Set(categories.filter((value) => Number.isFinite(value) && value > 0))
  ).sort((a, b) => a - b);

export const normalizeWeeklyRequest = (
  request: WeeklyStockRequest | null
): WeeklyStockRequest | null => {
  if (!request) return null;
  const categories = toSortedUniqueCategories(request.categories);
  if (categories.length === 0) return null;

  let weekStart = request.weekStart;
  try {
    weekStart = normalizeIsoToMonday(request.weekStart);
  } catch {
    weekStart = normalizeIsoToMonday(new Date().toISOString());
  }

  return { categories, weekStart };
};

export const inventoryWeeklyKeys = {
  base: ["inventory-weekly"] as const,
  categories: () => ["inventory-weekly", "categories"] as const,
  weekly: (params: WeeklyStockRequest) =>
    ["inventory-weekly", "weekly", params] as const,
  weeklyIdle: () => ["inventory-weekly", "weekly", "idle"] as const,
};
