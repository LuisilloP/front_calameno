export type ActivableEntity = {
  id: number;
  nombre: string;
  activa: boolean;
};

export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  skip: number;
  limit: number;
};

export type ListParams = {
  skip: number;
  limit: number;
};

export const DEFAULT_PAGE_SIZE = 10;

export const buildListParams = (
  pageIndex: number,
  limit: number
): ListParams => ({
  skip: pageIndex * limit,
  limit,
});

export const createEmptyPagination = <T>(
  params: ListParams
): PaginatedResponse<T> => ({
  items: [],
  total: 0,
  ...params,
});

export const toPaginatedResponse = <T>(
  payload: unknown,
  fallback: ListParams
): PaginatedResponse<T> => {
  if (Array.isArray(payload)) {
    return {
      items: payload as T[],
      total: (payload as T[]).length,
      ...fallback,
    };
  }

  if (payload && typeof payload === "object") {
    const source = payload as Record<string, unknown>;
    const items =
      (Array.isArray(source.items) && (source.items as T[])) ||
      (Array.isArray(source.data) && (source.data as T[])) ||
      (Array.isArray(source.results) && (source.results as T[])) ||
      [];
    const total =
      (typeof source.total === "number" && source.total) ||
      (typeof source.count === "number" && source.count) ||
      items.length;
    const skipValue =
      (typeof source.skip === "number" && source.skip) ||
      (typeof source.offset === "number" && source.offset) ||
      fallback.skip;
    const limitValue =
      (typeof source.limit === "number" && source.limit) ||
      (typeof source.page_size === "number" && source.page_size) ||
      fallback.limit;

    return {
      items,
      total,
      skip: skipValue,
      limit: limitValue,
    };
  }

  return {
    items: [],
    total: 0,
    ...fallback,
  };
};
