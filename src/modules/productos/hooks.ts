"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useApiClient } from "@/modules/admin/hooks/useApiClient";
import { ListParams } from "@/modules/admin/types";
import { invalidateCatalog } from "@/hooks/useCatalogResource";
import {
  createProducto,
  deleteProducto,
  getProducto,
  listCategoriasCatalog,
  listMarcasCatalog,
  listProductos,
  listUomsCatalog,
  toggleProductoActivo,
  updateProducto,
} from "./api";
import { ProductoPayload, CatalogItem } from "./types";

const PRODUCTOS_KEY = "productos";
const CATALOG_KEY = "catalogos";
const STALE_TIME = 1000 * 60 * 10;
const invalidateProductoCatalog = () => invalidateCatalog("productos");

export const useProductosList = (params: ListParams) => {
  const { request } = useApiClient();
  return useQuery({
    queryKey: [PRODUCTOS_KEY, params],
    queryFn: () => listProductos(params, request),
    keepPreviousData: true,
  });
};

export const useProductoDetail = (id?: number) => {
  const { request } = useApiClient();
  return useQuery({
    queryKey: [PRODUCTOS_KEY, "detail", id],
    queryFn: () => {
      if (!id) {
        throw new Error("id requerido");
      }
      return getProducto(id, request);
    },
    enabled: Boolean(id),
  });
};

export const useCreateProducto = () => {
  const { request } = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ProductoPayload) => createProducto(payload, request),
    onSuccess: () => {
      invalidateProductoCatalog();
      queryClient.invalidateQueries({
        queryKey: [PRODUCTOS_KEY],
      });
    },
  });
};

export const useUpdateProducto = () => {
  const { request } = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: Partial<ProductoPayload>;
    }) => updateProducto(id, payload, request),
    onSuccess: () => {
      invalidateProductoCatalog();
      queryClient.invalidateQueries({
        queryKey: [PRODUCTOS_KEY],
      });
    },
  });
};

export const useDeleteProducto = () => {
  const { request } = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteProducto(id, request),
    onSuccess: () => {
      invalidateProductoCatalog();
      queryClient.invalidateQueries({
        queryKey: [PRODUCTOS_KEY],
      });
    },
  });
};

export const useToggleProducto = () => {
  const { request } = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, activo }: { id: number; activo: boolean }) =>
      toggleProductoActivo(id, activo, request),
    onSuccess: () => {
      invalidateProductoCatalog();
      queryClient.invalidateQueries({
        queryKey: [PRODUCTOS_KEY],
      });
    },
  });
};

const makeCatalogHook = (
  key: string,
  fetcher: (requester: ReturnType<typeof useApiClient>["request"]) => Promise<
    CatalogItem[]
  >
) => {
  return () => {
    const { request } = useApiClient();
    return useQuery({
      queryKey: [CATALOG_KEY, key],
      queryFn: () => fetcher(request),
      staleTime: STALE_TIME,
    });
  };
};

export const useCatalogoUoms = makeCatalogHook("uoms", listUomsCatalog);
export const useCatalogoMarcas = makeCatalogHook("marcas", listMarcasCatalog);
export const useCatalogoCategorias = makeCatalogHook(
  "categorias",
  listCategoriasCatalog
);

export type { Producto, CatalogItem } from "./types";
