import type { PageMeta, Paginated, SortOrder } from "@/types/common";

export type { PageMeta, Paginated, SortOrder } from "@/types/common";

export interface QuerySort {
  field: string;
  order: SortOrder;
}

export type QueryFilters = Record<string, string | number | boolean | Array<string | number> | undefined>;

export interface QueryOptions {
  page?: number;
  perPage?: number;
  sort?: QuerySort | QuerySort[];
  filters?: QueryFilters;
}

export function buildQuery(options?: QueryOptions): URLSearchParams {
  const params = new URLSearchParams();
  if (!options) {
    return params;
  }

  if (options.page) {
    params.append("page", options.page.toString());
  }

  if (options.perPage) {
    params.append("per_page", options.perPage.toString());
  }

  if (options.sort) {
    const sorts = Array.isArray(options.sort) ? options.sort : [options.sort];
    const sortValue = sorts
      .map((sort) => `${sort.order === "desc" ? "-" : ""}${sort.field}`)
      .filter(Boolean)
      .join(",");
    if (sortValue) {
      params.append("sort", sortValue);
    }
  }

  if (options.filters) {
    Object.entries(options.filters).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      const paramKey = key.startsWith("filter[") ? key : `filter[${key}]`;
      if (Array.isArray(value)) {
        value.forEach((item) => params.append(paramKey, String(item)));
      } else {
        params.append(paramKey, String(value));
      }
    });
  }

  return params;
}

export function buildCacheKey(resource: string, options?: QueryOptions): string {
  const params = buildQuery(options);
  const query = params.toString();
  return query ? `${resource}?${query}` : resource;
}
