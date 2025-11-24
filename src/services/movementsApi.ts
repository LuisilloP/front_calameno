const RAW_BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:8000/api/v1";

const resolveBaseUrl = () => {
  const trimmed = RAW_BASE_URL.trim();
  if (!trimmed) {
    throw new Error(
      "[movementsApi] NEXT_PUBLIC_BASE_URL no está configurada. Revisa el archivo .env."
    );
  }
  return trimmed.endsWith("/") ? trimmed.slice(0, -1) : trimmed;
};

const BASE_URL = resolveBaseUrl();

export type MovementType = "ingreso" | "uso" | "traspaso" | "ajuste";

export type MovimientoCreatePayload = {
  tipo: MovementType;
  producto_id: number;
  cantidad: number;
  from_locacion_id?: number | null;
  to_locacion_id?: number | null;
  persona_id?: number | null;
  proveedor_id?: number | null;
  nota?: string | null;
};

export type MovimientoOut = MovimientoCreatePayload & {
  id: number;
  created_at: string;
};

export type ProductoCatalogItem = {
  id: number;
  nombre: string;
  sku?: string | null;
  uom?: {
    id: number;
    nombre: string;
    abreviatura?: string | null;
  } | null;
  uom_id?: number | null;
  uom_nombre?: string | null;
  uom_abreviatura?: string | null;
};

export type UomCatalogItem = {
  id: number;
  nombre: string;
  abreviatura?: string | null;
  descripcion?: string | null;
};

export type LocacionCatalogItem = {
  id: number;
  nombre: string;
  codigo?: string | null;
};

export type PersonaCatalogItem = {
  id: number;
  nombre: string;
  apellidos?: string | null;
  area?: string | null;
};

export type ProveedorCatalogItem = {
  id: number;
  nombre: string;
  razon_social?: string | null;
};

export type ApiErrorDetail = {
  status: number;
  message: string;
  detail?: string;
  errorDetail?: string;
  fieldErrors?: Record<string, string[]>;
};

type RequestOptions = {
  method?: "GET" | "POST";
  body?: unknown;
  signal?: AbortSignal;
  query?: Record<
    string,
    string | number | boolean | undefined | null
  >;
};

const defaultHeaders: HeadersInit = {
  Accept: "application/json",
};

const buildQueryString = (query?: RequestOptions["query"]) => {
  if (!query) return "";
  const entries = Object.entries(query).reduce(
    (acc, [key, value]) => {
      if (value === undefined || value === null) return acc;
      return acc.concat([[key, String(value)]]);
    },
    [] as Array<[string, string]>
  );
  if (entries.length === 0) return "";
  return `?${new URLSearchParams(entries).toString()}`;
};

const parseJson = async <T>(response: Response): Promise<T | undefined> => {
  try {
    return (await response.json()) as T;
  } catch {
    return undefined;
  }
};

const buildApiError = async (response: Response): Promise<ApiErrorDetail> => {
  const payload = await parseJson<{
    detail?: string;
    error_detail?: string;
    errorDetail?: string;
    message?: string;
    errors?: Record<string, string[]>;
  }>(response);

  return {
    status: response.status,
    message: payload?.message || payload?.detail || response.statusText,
    detail: payload?.detail,
    errorDetail: payload?.error_detail || payload?.errorDetail,
    fieldErrors: payload?.errors,
  };
};

const request = async <T>(path: string, options: RequestOptions = {}) => {
  const queryString = buildQueryString(options.query);
  const url = `${BASE_URL}${path.startsWith("/") ? path : `/${path}`}${queryString}`;
  const init: RequestInit = {
    method: options.method ?? "GET",
    headers: {
      ...defaultHeaders,
      "Content-Type": "application/json",
    },
    signal: options.signal,
  };

  if (options.body !== undefined) {
    init.body = JSON.stringify(options.body);
  }

  const response = await fetch(url, init);
  if (!response.ok) {
    throw await buildApiError(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
};

const normalizeListResponse = <T>(payload: unknown): T[] => {
  if (Array.isArray(payload)) return payload as T[];
  if (payload && typeof payload === "object") {
    const items = (payload as { items?: T[] }).items;
    if (Array.isArray(items)) return items;
  }
  return [];
};

const listProductos = async (): Promise<ProductoCatalogItem[]> => {
  const response = await request<unknown>("/productos", {
    query: { skip: 0, limit: 500 },
  });
  return normalizeListResponse<ProductoCatalogItem>(response);
};

const listLocaciones = async (): Promise<LocacionCatalogItem[]> => {
  const response = await request<unknown>("/locaciones", {
    query: { skip: 0, limit: 500 },
  });
  return normalizeListResponse<LocacionCatalogItem>(response);
};

const listPersonas = async (): Promise<PersonaCatalogItem[]> => {
  const response = await request<unknown>("/personas", {
    query: { skip: 0, limit: 500 },
  });
  return normalizeListResponse<PersonaCatalogItem>(response);
};

const listProveedores = async (): Promise<ProveedorCatalogItem[]> => {
  const response = await request<unknown>("/proveedores", {
    query: { skip: 0, limit: 500 },
  });
  return normalizeListResponse<ProveedorCatalogItem>(response);
};

const listUoms = async (): Promise<UomCatalogItem[]> => {
  const response = await request<unknown>("/uoms", {
    query: { skip: 0, limit: 500 },
  });
  return normalizeListResponse<UomCatalogItem>(response);
};

export type StockItem = {
  producto_id: number;
  locacion_id: number;
  stock: string | number;
};

const getStock = async (
  productoId: number,
  locacionId?: number | null,
  signal?: AbortSignal
) => {
  const response = await request<unknown>("/stock", {
    query: {
      producto_id: productoId,
      locacion_id: locacionId ?? undefined,
    },
    signal,
  });
  const items = normalizeListResponse<StockItem>(response);
  return items[0];
};

const createMovimiento = (payload: MovimientoCreatePayload) =>
  request<MovimientoOut>("/movimientos", {
    method: "POST",
    body: payload,
  });

export const movementsApi = {
  listProductos,
  listLocaciones,
  listPersonas,
  listProveedores,
  listUoms,
  getStock,
  createMovimiento,
};

export type CatalogKind =
  | "productos"
  | "locaciones"
  | "personas"
  | "proveedores"
  | "uoms";

export type CatalogMap = {
  productos: ProductoCatalogItem;
  locaciones: LocacionCatalogItem;
  personas: PersonaCatalogItem;
  proveedores: ProveedorCatalogItem;
  uoms: UomCatalogItem;
};
