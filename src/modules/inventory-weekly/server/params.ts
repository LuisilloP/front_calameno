import { normalizeIsoToMonday } from "@/modules/inventory-weekly/utils/date";

export const parseCategoryIds = (
  value: string | null | undefined
): number[] => {
  if (!value) return [];
  return Array.from(
    new Set(
      value
        .split(",")
        .map((part) => Number(part.trim()))
        .filter((num) => Number.isFinite(num) && num > 0)
    )
  ).sort((a, b) => a - b);
};

export const normalizeWeekStartParam = (
  value?: string | null
): string => normalizeIsoToMonday(value ?? new Date().toISOString());

export const shouldForceMock = (rawValue?: string | null) =>
  typeof rawValue === "string" &&
  rawValue.trim().toLowerCase() === "true";
