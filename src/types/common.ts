export type SortOrder = "asc" | "desc";

export interface PageMeta {
  currentPage: number;
  lastPage: number;
  perPage: number;
  total: number;
}

export interface Paginated<T> {
  data: T[];
  meta: PageMeta;
}

export interface ApiError {
  code: string;
  message: string;
  status?: number;
  errors?: Record<string, string[]>;
  traceId?: string;
}
