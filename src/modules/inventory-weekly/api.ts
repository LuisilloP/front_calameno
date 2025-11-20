import {
  InventoryCategory,
  WeeklyStockRequest,
  WeeklyStockResponse,
} from "./types";

const fetchJson = async <T>(url: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "No se pudo cargar la informacion");
  }

  return (await response.json()) as T;
};

const buildQueryString = (params: Record<string, string | number>) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    searchParams.set(key, String(value));
  });
  return searchParams.toString();
};

export const fetchCategories = () =>
  fetchJson<InventoryCategory[]>("/api/categories");

export const fetchWeeklyStock = (params: WeeklyStockRequest) => {
  const search = buildQueryString({
    categories: params.categories.join(","),
    weekStart: params.weekStart,
  });
  return fetchJson<WeeklyStockResponse>(`/api/stock/weekly?${search}`);
};
