"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { useApiClient } from "@/modules/admin/hooks/useApiClient";
import { ListParams } from "@/modules/admin/types";
import { invalidateCatalog } from "@/hooks/useCatalogResource";
import {
  createProveedor,
  deleteProveedor,
  listProveedores,
  ProveedorInput,
  updateProveedor,
} from "./api";

const PROVEEDORES_KEY = "proveedores";
const invalidateProveedoresCatalog = () => invalidateCatalog("proveedores");

export const useProveedoresList = (params: ListParams) => {
  const { request } = useApiClient();
  return useQuery({
    queryKey: [PROVEEDORES_KEY, params],
    queryFn: () => listProveedores(params, request),
    placeholderData: keepPreviousData,
  });
};

export const useCreateProveedor = () => {
  const { request } = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ProveedorInput) =>
      createProveedor(payload, request),
    onSuccess: () => {
      invalidateProveedoresCatalog();
      queryClient.invalidateQueries({
        queryKey: [PROVEEDORES_KEY],
      });
    },
  });
};

export const useUpdateProveedor = () => {
  const { request } = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<ProveedorInput> }) =>
      updateProveedor(id, payload, request),
    onSuccess: () => {
      invalidateProveedoresCatalog();
      queryClient.invalidateQueries({
        queryKey: [PROVEEDORES_KEY],
      });
    },
  });
};

export const useDeleteProveedor = () => {
  const { request } = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteProveedor(id, request),
    onSuccess: () => {
      invalidateProveedoresCatalog();
      queryClient.invalidateQueries({
        queryKey: [PROVEEDORES_KEY],
      });
    },
  });
};

export type { Proveedor } from "./api";
