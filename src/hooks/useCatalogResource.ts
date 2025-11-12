"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import {
  CatalogKind,
  CatalogMap,
  movementsApi,
} from "@/services/movementsApi";

export type CatalogStatus = "idle" | "loading" | "ready" | "error";

type CatalogEntry<K extends CatalogKind> = {
  status: CatalogStatus;
  data?: CatalogMap[K][];
  error?: string;
  timestamp?: number;
  promise?: Promise<void>;
};

type CatalogStore = Partial<{
  [K in CatalogKind]: CatalogEntry<K>;
}>;

const catalogStore: CatalogStore = {};
const listeners = new Set<() => void>();

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const notify = () => {
  listeners.forEach((listener) => listener());
};

const catalogFetchers: {
  [K in CatalogKind]: () => Promise<CatalogMap[K][]>;
} = {
  productos: movementsApi.listProductos,
  locaciones: movementsApi.listLocaciones,
  personas: movementsApi.listPersonas,
  proveedores: movementsApi.listProveedores,
  uoms: movementsApi.listUoms,
};

const getEntry = <K extends CatalogKind>(kind: K): CatalogEntry<K> => {
  let entry = catalogStore[kind];
  if (!entry) {
    entry = { status: "idle" } as CatalogEntry<K>;
    catalogStore[kind] = entry;
  }
  return entry as CatalogEntry<K>;
};

const setEntry = <K extends CatalogKind>(
  kind: K,
  entry: CatalogEntry<K>
) => {
  catalogStore[kind] = entry;
  notify();
};

export type UseCatalogResourceResult<K extends CatalogKind> = {
  status: CatalogStatus;
  data?: CatalogMap[K][];
  error?: string;
  isEmpty: boolean;
  reload: () => void;
};

export const useCatalogResource = <K extends CatalogKind>(
  kind: K
): UseCatalogResourceResult<K> => {
  const getSnapshot = useCallback(() => getEntry(kind), [kind]);
  const getServerSnapshot = useCallback(() => getEntry(kind), [kind]);

  const snapshot = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  const runFetch = useCallback(
    (force = false) => {
      const current = getEntry(kind);
      if (!force && (current.status === "loading" || current.status === "ready")) {
        return;
      }

      const fetcher = catalogFetchers[kind];
      const promise = fetcher()
        .then((data) => {
          setEntry(kind, {
            status: "ready",
            data,
            timestamp: Date.now(),
          });
        })
        .catch((error: unknown) => {
          const message =
            error instanceof Error ? error.message : String(error ?? "Error");
          setEntry(kind, {
            status: "error",
            error: message,
          });
        });

      setEntry(kind, {
        status: "loading",
        promise,
      });
    },
    [kind]
  );

  useEffect(() => {
    const entry = getEntry(kind);
    if (entry.status === "idle" || entry.status === "error") {
      runFetch(entry.status === "error");
    }
  }, [kind, runFetch]);

  return {
    status: snapshot.status,
    data: snapshot.data,
    error: snapshot.error,
    isEmpty:
      snapshot.status === "ready" && (snapshot.data?.length ?? 0) === 0,
    reload: () => runFetch(true),
  };
};
