import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { buildCacheKey, type QueryOptions } from "@/lib/pagination";
import { uomService } from "@/services/uom.service";
import type { Uom, UomDto } from "@/types/uom";

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

interface PaginatedResult {
  items: Uom[];
  total: number;
  page: number;
  lastPage: number;
  perPage: number;
}

interface UomStoreState {
  ttlMs: number;
  byKey: Record<string, CacheEntry<PaginatedResult>>;
  loadingKeys: Set<string>;
  errorByKey: Record<string, string | null>;
  list: (options?: QueryOptions) => Promise<PaginatedResult>;
  create: (payload: UomDto) => Promise<Uom>;
  update: (id: number, payload: UomDto) => Promise<Uom>;
  remove: (id: number) => Promise<void>;
  invalidate: (key?: string) => void;
}

const TTL_MS = 60_000;

const cloneCache = (data: Record<string, CacheEntry<PaginatedResult>>) =>
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

export const useUomStore = create<UomStoreState>()(
  devtools((set, get) => ({
    ttlMs: TTL_MS,
    byKey: {},
    loadingKeys: new Set<string>(),
    errorByKey: {},
    async list(options) {
      const key = buildCacheKey("uoms", options);
      const { byKey } = get();
      const cache = byKey[key];

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
        const response = await uomService.list(options);
        const result: PaginatedResult = {
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
            [key]: error instanceof Error ? error.message : "Error al cargar unidades de medida",
          },
        }));
        throw error;
      }
    },
    async create(payload) {
      const snapshot = cloneCache(get().byKey);
      const optimisticItem: Uom = {
        id: Date.now(),
        ...payload,
      };

      set((state) => {
        const nextByKey = cloneCache(state.byKey);
        Object.entries(nextByKey).forEach(([key, entry]) => {
          if (entry.data.page !== 1) return;
          entry.data.items = [optimisticItem, ...entry.data.items].slice(0, entry.data.perPage);
          entry.data.total += 1;
          nextByKey[key] = {
            data: entry.data,
            expiresAt: Date.now() + state.ttlMs,
          };
        });
        return { byKey: nextByKey };
      });

      try {
        const created = await uomService.create(payload);
        set((state) => {
          const nextByKey = cloneCache(state.byKey);
          Object.entries(nextByKey).forEach(([key, entry]) => {
            const index = entry.data.items.findIndex((item) => item.id === optimisticItem.id);
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
        const updated = await uomService.update(id, payload);
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
          const previousLength = entry.data.items.length;
          entry.data.items = entry.data.items.filter((item) => item.id !== id);
          if (entry.data.items.length !== previousLength) {
            entry.data.total = Math.max(entry.data.total - 1, 0);
          }
          entry.expiresAt = Date.now() + state.ttlMs;
        });
        return { byKey: nextByKey };
      });

      try {
        await uomService.destroy(id);
      } catch (error) {
        set({ byKey: snapshot });
        throw error;
      }
    },
    invalidate(key) {
      if (key) {
        set((state) => {
          const next = { ...state.byKey };
          delete next[key];
          return { byKey: next };
        });
      } else {
        set({ byKey: {} });
      }
    },
  })),
);

export const selectUomList =
  (options?: QueryOptions) =>
  (state: UomStoreState): PaginatedResult | undefined =>
    state.byKey[buildCacheKey("uoms", options)]?.data;
