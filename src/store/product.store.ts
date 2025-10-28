import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { buildCacheKey, type QueryOptions } from "@/lib/pagination";
import { productService } from "@/services/product.service";
import type { Product, ProductDto } from "@/types/product";
import type { Uom } from "@/types/uom";

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

interface PaginatedProductResult {
  items: Product[];
  total: number;
  page: number;
  lastPage: number;
  perPage: number;
}

interface ProductStoreState {
  ttlMs: number;
  byKey: Record<string, CacheEntry<PaginatedProductResult>>;
  loadingKeys: Set<string>;
  errorByKey: Record<string, string | null>;
  uomsForSelect: CacheEntry<Uom[]> | null;
  list: (options?: QueryOptions) => Promise<PaginatedProductResult>;
  create: (payload: ProductDto) => Promise<Product>;
  update: (id: number, payload: ProductDto) => Promise<Product>;
  remove: (id: number) => Promise<void>;
  fetchUomsForSelect: () => Promise<Uom[]>;
  invalidate: (key?: string) => void;
}

const TTL_MS = 60_000;

const cloneCache = (data: Record<string, CacheEntry<PaginatedProductResult>>) =>
  Object.fromEntries(
    Object.entries(data).map(([key, entry]) => [
      key,
      {
        data: {
          items: entry.data.items.map((item) => ({ ...item })),
          total: entry.data.total,
          page: entry.data.page,
          lastPage: entry.data.lastPage,
          perPage: entry.data.perPage,
        },
        expiresAt: entry.expiresAt,
      },
    ]),
  );

export const useProductStore = create<ProductStoreState>()(
  devtools((set, get) => ({
    ttlMs: TTL_MS,
    byKey: {},
    loadingKeys: new Set<string>(),
    errorByKey: {},
    uomsForSelect: null,
    async list(options) {
      const key = buildCacheKey("products", options);
      const cache = get().byKey[key];
      if (cache && cache.expiresAt > Date.now()) {
        return cache.data;
      }

      if (!get().loadingKeys.has(key)) {
        set((state) => {
          const next = new Set(state.loadingKeys);
          next.add(key);
          return { loadingKeys: next };
        });
      }

      try {
        const response = await productService.list(options);
        const result: PaginatedProductResult = {
          items: response.data,
          total: response.meta.total,
          page: response.meta.currentPage,
          lastPage: response.meta.lastPage,
          perPage: response.meta.perPage,
        };
        set((state) => ({
          byKey: {
            ...state.byKey,
            [key]: {
              data: result,
              expiresAt: Date.now() + state.ttlMs,
            },
          },
          loadingKeys: new Set(Array.from(state.loadingKeys).filter((item) => item !== key)),
          errorByKey: {
            ...state.errorByKey,
            [key]: null,
          },
        }));
        return result;
      } catch (error) {
        set((state) => ({
          loadingKeys: new Set(Array.from(state.loadingKeys).filter((item) => item !== key)),
          errorByKey: {
            ...state.errorByKey,
            [key]: error instanceof Error ? error.message : "Error al cargar productos",
          },
        }));
        throw error;
      }
    },
    async create(payload) {
      const snapshot = cloneCache(get().byKey);
      const optimistic: Product = {
        id: Date.now(),
        ...payload,
      };

      set((state) => {
        const nextByKey = cloneCache(state.byKey);
        Object.values(nextByKey).forEach((entry) => {
          if (entry.data.page !== 1) return;
          entry.data.items = [optimistic, ...entry.data.items].slice(0, entry.data.perPage);
          entry.data.total += 1;
          entry.expiresAt = Date.now() + state.ttlMs;
        });
        return { byKey: nextByKey };
      });

      try {
        const created = await productService.create(payload);
        set((state) => {
          const nextByKey = cloneCache(state.byKey);
          Object.values(nextByKey).forEach((entry) => {
            const index = entry.data.items.findIndex((item) => item.id === optimistic.id);
            if (index >= 0) {
              entry.data.items[index] = created;
            }
            entry.expiresAt = Date.now() + state.ttlMs;
          });
          return { byKey: nextByKey };
        });
        return created;
      } catch (error) {
        set({ byKey: snapshot });
        throw error;
      }
    },
    async update(id, payload) {
      const snapshot = cloneCache(get().byKey);
      set((state) => {
        const nextByKey = cloneCache(state.byKey);
        Object.values(nextByKey).forEach((entry) => {
          entry.data.items = entry.data.items.map((item) => (item.id === id ? { ...item, ...payload } : item));
          entry.expiresAt = Date.now() + state.ttlMs;
        });
        return { byKey: nextByKey };
      });

      try {
        const updated = await productService.update(id, payload);
        set((state) => {
          const nextByKey = cloneCache(state.byKey);
          Object.values(nextByKey).forEach((entry) => {
            entry.data.items = entry.data.items.map((item) => (item.id === id ? updated : item));
            entry.expiresAt = Date.now() + state.ttlMs;
          });
          return { byKey: nextByKey };
        });
        return updated;
      } catch (error) {
        set({ byKey: snapshot });
        throw error;
      }
    },
    async remove(id) {
      const snapshot = cloneCache(get().byKey);
      set((state) => {
        const nextByKey = cloneCache(state.byKey);
        Object.values(nextByKey).forEach((entry) => {
          const prevLength = entry.data.items.length;
          entry.data.items = entry.data.items.filter((item) => item.id !== id);
          if (entry.data.items.length !== prevLength) {
            entry.data.total = Math.max(entry.data.total - 1, 0);
          }
          entry.expiresAt = Date.now() + state.ttlMs;
        });
        return { byKey: nextByKey };
      });

      try {
        await productService.destroy(id);
      } catch (error) {
        set({ byKey: snapshot });
        throw error;
      }
    },
    async fetchUomsForSelect() {
      const cache = get().uomsForSelect;
      if (cache && cache.expiresAt > Date.now()) {
        return cache.data;
      }

      const uoms = await productService.uomsForSelect();
      set((state) => ({
        uomsForSelect: {
          data: uoms,
          expiresAt: Date.now() + state.ttlMs,
        },
      }));
      return uoms;
    },
    invalidate(key) {
      if (key) {
        set((state) => {
          const next = { ...state.byKey };
          delete next[key];
          return { byKey: next };
        });
      } else {
        set({ byKey: {}, uomsForSelect: null });
      }
    },
  })),
);

export const selectProductList =
  (options?: QueryOptions) =>
  (state: ProductStoreState): PaginatedProductResult | undefined =>
    state.byKey[buildCacheKey("products", options)]?.data;
