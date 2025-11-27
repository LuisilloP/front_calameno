const RAW_BASE_URL = (process.env.NEXT_PUBLIC_BASE_URL ?? '{{BASE_URL}}').trim();
const API_TOKEN = (process.env.NEXT_PUBLIC_API_TOKEN ?? '{{API_TOKEN}}').trim();
const RAW_TIMEZONE =
  process.env.NEXT_PUBLIC_TIMEZONE_UI ??
  process.env.NEXT_PUBLIC_TIMEZONE ??
  '{{TIMEZONE_UI}}';

const DEFAULT_TIMEOUT_MS = 10_000;
const MAX_RETRIES = 2;
const RETRIABLE_STATUS = new Set([500, 502, 503, 504]);

type FetchOptions = {
  searchParams?: Record<string, string | number | undefined | null>;
  /** Optional map of HTTP status codes to fallback values. When matched, the fallback is returned instead of throwing. */
  fallbackOnStatus?: Record<number, unknown>;
};

const resolvedTimezone = RAW_TIMEZONE.includes('{{') ? 'UTC' : RAW_TIMEZONE;

const warnMissingField = (field: string) => {
  console.warn(`[DashboardAPI] Campo faltante: ${field}. Usando valor por defecto.`);
};

const toNumber = (value: unknown, fallback = 0, field?: string): number => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  if (field) {
    warnMissingField(field);
  }

  return fallback;
};

const toString = (value: unknown, fallback = '', field?: string): string => {
  if (typeof value === 'string' && value.length > 0) {
    return value;
  }

  if (field && (value === undefined || value === null)) {
    warnMissingField(field);
  }

  return fallback;
};

const ensureBaseUrl = () => {
  if (!RAW_BASE_URL || RAW_BASE_URL.includes('{{')) {
    throw new Error(
      '[DashboardAPI] NEXT_PUBLIC_BASE_URL no configurada. Define la variable de entorno o sustituye {{BASE_URL}}.'
    );
  }

  return RAW_BASE_URL.endsWith('/') ? RAW_BASE_URL.slice(0, -1) : RAW_BASE_URL;
};

const buildUrl = (path: string, params?: FetchOptions['searchParams']): string => {
  const base = ensureBaseUrl();
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = new URL(`${base}${normalizedPath}`);

  Object.entries(params ?? {}).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== '') {
      url.searchParams.set(key, String(val));
    }
  });

  return url.toString();
};

const wait = (attempt: number) =>
  new Promise((resolve) => setTimeout(resolve, 200 * 2 ** attempt));

const fetchJson = async <T>(path: string, options: FetchOptions = {}): Promise<T> => {
  const url = buildUrl(path, options.searchParams);

  const execute = async (attempt: number): Promise<T> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${API_TOKEN}`,
        },
        signal: controller.signal,
      });

      const fallback = options.fallbackOnStatus?.[response.status];
      if (!response.ok) {
        if (fallback !== undefined) {
          return fallback as T;
        }
        if (RETRIABLE_STATUS.has(response.status) && attempt < MAX_RETRIES) {
          await wait(attempt);
          return execute(attempt + 1);
        }

        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return (await response.json()) as T;
    } catch (error: unknown) {
      const parsedError = error as { name?: string; message?: string };
      const isTimeout = parsedError?.name === 'AbortError';
      const message = parsedError?.message ?? '';
      const isRetriable = isTimeout || /network/i.test(message);

      if (attempt < MAX_RETRIES && isRetriable) {
        await wait(attempt);
        return execute(attempt + 1);
      }

      console.error(`[DashboardAPI] Error al llamar ${path}`, error);
      throw error instanceof Error ? error : new Error(String(error));
    } finally {
      clearTimeout(timeoutId);
    }
  };

  return execute(0);
};

// ---------- Tipos API (raw) ----------

type UsageVsIngressItem = {
  count?: number;
  percentage?: number;
};

type UsageVsIngressRatio = {
  ingreso?: UsageVsIngressItem;
  uso?: UsageVsIngressItem;
};

export interface DashboardSummaryResponse {
  total_movements_last_7d?: number;
  distinct_products_moved_last_7d?: number;
  usage_vs_ingress_ratio_last_7d?: UsageVsIngressRatio;
  adjustments_last_30d?: number;
}

export interface RecentMovementItemResponse {
  id?: number;
  fecha?: string;
  tipo?: string;
  producto_nombre?: string;
  from_locacion_nombre?: string | null;
  to_locacion_nombre?: string | null;
  persona_nombre?: string | null;
  proveedor_nombre?: string | null;
  cantidad?: number;
  nota?: string | null;
}

export interface RecentMovementsResponse {
  items?: RecentMovementItemResponse[];
  total?: number;
}

export interface StockByLocationItemResponse {
  locacion_id?: number;
  locacion_nombre?: string;
  stock_total?: number;
}

export interface StockByLocationResponse {
  items?: StockByLocationItemResponse[];
}

export interface TopUsedProductItemResponse {
  producto_id?: number;
  producto_nombre?: string;
  total_usado?: number;
}

export interface TopUsedProductsResponse {
  days?: number;
  limit?: number;
  items?: TopUsedProductItemResponse[];
}

export interface TopCategoryItemResponse {
  categoria_id?: number;
  categoria_nombre?: string;
  total_movimiento?: number;
  movimientos_count?: number;
}

export interface TopCategoriesResponse {
  days?: number;
  limit?: number;
  items?: TopCategoryItemResponse[];
}

export interface AdjustmentProductResponse {
  producto_id?: number;
  producto_nombre?: string;
  ajustes_count?: number;
}

export interface AdjustmentLocationResponse {
  locacion_id?: number;
  locacion_nombre?: string;
  ajustes_count?: number;
}

export interface AdjustmentsMonitorResponse {
  total_adjustments?: number;
  top_products?: AdjustmentProductResponse[];
  top_locations?: AdjustmentLocationResponse[];
  days?: number;
  top?: number;
}

// ---------- Tipos normalizados ----------

export type MovementType = 'ingreso' | 'uso' | 'ajuste' | 'traspaso' | string;

export interface DashboardSummary {
  totalMovementsLast7d: number;
  distinctProductsLast7d: number;
  usageVsIngress: {
    ingreso: { count: number; percentage: number };
    uso: { count: number; percentage: number };
  };
  adjustmentsLast30d: number;
}

export interface Movement {
  id: number;
  dateUtc: string;
  dateLabel: string;
  type: MovementType;
  productName: string;
  quantity: number;
  fromLocation: string;
  toLocation: string;
  person: string;
  supplier: string;
  note: string;
}

export interface StockByLocationItem {
  locationId: number;
  locationName: string;
  total: number;
}

export interface TopUsedProduct {
  productoId: number;
  nombre: string;
  totalUsado: number;
}

export interface TopCategory {
  categoriaId: number;
  nombre: string;
  totalMovimiento: number;
  movimientosCount: number;
}

export interface AdjustmentTopProduct {
  productoId: number;
  nombre: string;
  ajustes: number;
}

export interface AdjustmentTopLocation {
  locacionId: number;
  nombre: string;
  ajustes: number;
}

export type RecentMovementsParams = {
  limit?: number;
  offset?: number;
  tipo?: string;
  locacion_id?: number;
  producto_id?: number;
  fecha_desde?: string;
  fecha_hasta?: string;
};

export type TopUsedParams = {
  days?: number;
  limit?: number;
};

export type TopCategoryParams = {
  days?: number;
  limit?: number;
};

export type AdjustmentsParams = {
  days?: number;
  top?: number;
};

const formatDateLocal = (iso: string): string => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    warnMissingField('recent-movements.items[].fecha');
    return iso || '';
  }

  return new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: resolvedTimezone,
  }).format(date);
};

export const normalizeSummary = (raw: DashboardSummaryResponse): DashboardSummary => ({
  totalMovementsLast7d: toNumber(raw?.total_movements_last_7d, 0, 'summary.total_movements_last_7d'),
  distinctProductsLast7d: toNumber(
    raw?.distinct_products_moved_last_7d,
    0,
    'summary.distinct_products_moved_last_7d'
  ),
  usageVsIngress: {
    ingreso: {
      count: toNumber(raw?.usage_vs_ingress_ratio_last_7d?.ingreso?.count, 0),
      percentage: toNumber(raw?.usage_vs_ingress_ratio_last_7d?.ingreso?.percentage, 0),
    },
    uso: {
      count: toNumber(raw?.usage_vs_ingress_ratio_last_7d?.uso?.count, 0),
      percentage: toNumber(raw?.usage_vs_ingress_ratio_last_7d?.uso?.percentage, 0),
    },
  },
  adjustmentsLast30d: toNumber(raw?.adjustments_last_30d, 0, 'summary.adjustments_last_30d'),
});

export const normalizeMovement = (item: RecentMovementItemResponse): Movement => ({
  id: toNumber(item?.id, 0, 'recent-movements.items[].id'),
  dateUtc: toString(item?.fecha, '', 'recent-movements.items[].fecha'),
  dateLabel: item?.fecha ? formatDateLocal(item.fecha) : '',
  type: toString(item?.tipo, 'sin-tipo').toLowerCase(),
  productName: toString(item?.producto_nombre, 'Producto sin nombre', 'recent-movements.items[].producto_nombre'),
  quantity: toNumber(item?.cantidad, 0),
  fromLocation: toString(item?.from_locacion_nombre ?? '', '-'),
  toLocation: toString(item?.to_locacion_nombre ?? '', '-'),
  person: toString(item?.persona_nombre ?? '', ''),
  supplier: toString(item?.proveedor_nombre ?? '', ''),
  note: toString(item?.nota ?? '', ''),
});

export const normalizeStockByLocation = (item: StockByLocationItemResponse): StockByLocationItem => ({
  locationId: toNumber(item?.locacion_id, 0, 'stock-by-location.items[].locacion_id'),
  locationName: toString(item?.locacion_nombre, 'Sin sector', 'stock-by-location.items[].locacion_nombre'),
  total: toNumber(item?.stock_total, 0),
});

export const normalizeTopUsedProduct = (item: TopUsedProductItemResponse): TopUsedProduct => ({
  productoId: toNumber(item?.producto_id, 0, 'top-used-products.items[].producto_id'),
  nombre: toString(item?.producto_nombre, 'Producto sin nombre', 'top-used-products.items[].producto_nombre'),
  totalUsado: toNumber(item?.total_usado, 0),
});

export const normalizeTopCategory = (item: TopCategoryItemResponse): TopCategory => ({
  categoriaId: toNumber(item?.categoria_id, 0, 'top-categories.items[].categoria_id'),
  nombre: toString(item?.categoria_nombre, 'Sin categoria', 'top-categories.items[].categoria_nombre'),
  totalMovimiento: toNumber(item?.total_movimiento, 0),
  movimientosCount: toNumber(item?.movimientos_count, 0),
});

export const normalizeAdjustmentProduct = (item: AdjustmentProductResponse): AdjustmentTopProduct => ({
  productoId: toNumber(item?.producto_id, 0, 'adjustments-monitor.top_products[].producto_id'),
  nombre: toString(item?.producto_nombre, 'Producto sin nombre', 'adjustments-monitor.top_products[].producto_nombre'),
  ajustes: toNumber(item?.ajustes_count, 0),
});

export const normalizeAdjustmentLocation = (item: AdjustmentLocationResponse): AdjustmentTopLocation => ({
  locacionId: toNumber(item?.locacion_id, 0, 'adjustments-monitor.top_locations[].locacion_id'),
  nombre: toString(item?.locacion_nombre, 'Sector sin nombre', 'adjustments-monitor.top_locations[].locacion_nombre'),
  ajustes: toNumber(item?.ajustes_count, 0),
});

export const dashboardApi = {
  getSummary: () => fetchJson<DashboardSummaryResponse>('/dashboard/summary'),
  getRecentMovements: (params: RecentMovementsParams) =>
    fetchJson<RecentMovementsResponse>('/dashboard/recent-movements', { searchParams: params }),
  getStockByLocation: () => fetchJson<StockByLocationResponse>('/dashboard/stock-by-location'),
  getTopUsedProducts: (params: TopUsedParams) =>
    fetchJson<TopUsedProductsResponse>('/dashboard/top-used-products', { searchParams: params }),
  getTopCategories: (params: TopCategoryParams) =>
    fetchJson<TopCategoriesResponse>('/dashboard/top-categories', {
      searchParams: params,
      fallbackOnStatus: {
        404: {
          days: params?.days,
          limit: params?.limit,
          items: [],
        },
      },
    }),
  getAdjustmentsMonitor: (params: AdjustmentsParams) =>
    fetchJson<AdjustmentsMonitorResponse>('/dashboard/adjustments-monitor', { searchParams: params }),
};
