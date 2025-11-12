import { buildUrl } from "@/api/config";
import {
  InventoryCategory,
  StockStatus,
  WeeklyStockProduct,
} from "@/modules/inventory-weekly/types";
import { normalizeIsoToMonday } from "@/modules/inventory-weekly/utils/date";

const DEFAULT_HEADERS: HeadersInit = {
  Accept: "application/json",
};

const CATEGORIES_PATH =
  process.env.INVENTORY_WEEKLY_CATEGORIES_PATH ?? "/categorias";
const WEEKLY_STOCK_PATH =
  process.env.INVENTORY_WEEKLY_STOCK_PATH ?? "/stock/weekly";

type FetchParams = {
  searchParams?: Record<string, string | number | undefined>;
  signal?: AbortSignal;
};

const resolveUrl = (path: string, params?: FetchParams["searchParams"]) => {
  const absolute = buildUrl(path);
  if (!params) return absolute;
  const url = new URL(absolute);
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    url.searchParams.set(key, String(value));
  });
  return url.toString();
};

const fetchJson = async <T>(
  path: string,
  options: FetchParams = {}
): Promise<T> => {
  const url = resolveUrl(path, options.searchParams);
  const response = await fetch(url, {
    method: "GET",
    headers: DEFAULT_HEADERS,
    cache: "no-store",
    signal: options.signal,
  });

  if (!response.ok) {
    const payload = await response.text().catch(() => "");
    throw new Error(
      `[InventoryWeeklyApi] ${response.status} ${response.statusText} :: ${payload}`
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
};

const toNumber = (value: unknown, fallback = 0): number => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
};

const toString = (value: unknown, fallback = ""): string => {
  if (typeof value === "string") return value;
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }
  return fallback;
};

const toStatus = (value: unknown): StockStatus => {
  const normalized = toString(value, "alto").toLowerCase();
  if (normalized === "bajo" || normalized === "critico") {
    return normalized;
  }
  return "alto";
};

type BackendStockDay = {
  [key: string]: unknown;
};

type BackendWeeklyProduct = {
  [key: string]: unknown;
  dias?: BackendStockDay[];
};

const mapStockDay = (day: BackendStockDay) => ({
  fecha: toString(day.fecha ?? day.date ?? day.dia ?? "", ""),
  stock: toNumber(day.stock ?? day.valor ?? day.quantity, 0),
  estado: toStatus(day.estado ?? day.status),
});

const mapWeeklyProduct = (item: BackendWeeklyProduct): WeeklyStockProduct => {
  const dias = Array.isArray(item.dias) ? item.dias.map(mapStockDay) : [];
  return {
    productoId: toNumber(
      item.productoId ?? item.producto_id ?? item.id ?? item.product_id,
      0
    ),
    productoNombre: toString(
      item.productoNombre ??
        item.producto_nombre ??
        item.nombre ??
        item.name ??
        "Producto sin nombre",
      "Producto sin nombre"
    ),
    categoriaId: toNumber(
      item.categoriaId ?? item.categoria_id ?? item.category_id ?? 0,
      0
    ),
    dias: dias.filter((day) => day.fecha.length > 0),
  };
};

type BackendCategory = {
  [key: string]: unknown;
};

const mapCategory = (raw: BackendCategory): InventoryCategory => ({
  id: toNumber(raw.id ?? raw.categoria_id ?? raw.category_id, 0),
  nombre: toString(raw.nombre ?? raw.name ?? "Categoria sin nombre", "Categoria sin nombre"),
});

export const inventoryWeeklyApi = {
  async listCategories(signal?: AbortSignal): Promise<InventoryCategory[]> {
    const categories = await fetchJson<BackendCategory[]>(CATEGORIES_PATH, {
      signal,
    });
    return (categories ?? []).map(mapCategory).sort((a, b) =>
      a.nombre.localeCompare(b.nombre, "es")
    );
  },
  async listWeeklyStock(params: {
    categoryIds: number[];
    weekStart: string;
    signal?: AbortSignal;
  }): Promise<WeeklyStockProduct[]> {
    const normalizedWeek = normalizeIsoToMonday(params.weekStart);
    const searchParams = {
      categories: params.categoryIds.join(","),
      weekStart: normalizedWeek,
    };
    const products = await fetchJson<BackendWeeklyProduct[]>(WEEKLY_STOCK_PATH, {
      searchParams,
      signal: params.signal,
    });
    return (products ?? []).map(mapWeeklyProduct);
  },
};
