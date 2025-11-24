"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { useApiClient } from "@/modules/admin/hooks/useApiClient";
import { ListParams } from "@/modules/admin/types";
import {
  CategoriaInput,
  createCategoria,
  deleteCategoria,
  listCategorias,
  updateCategoria,
} from "./api";

const CATEGORIAS_KEY = "categorias";

export const useCategoriasList = (params: ListParams) => {
  const { request } = useApiClient();
  return useQuery({
    queryKey: [CATEGORIAS_KEY, params],
    queryFn: () => listCategorias(params, request),
    placeholderData: keepPreviousData,
  });
};

export const useCreateCategoria = () => {
  const { request } = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CategoriaInput) =>
      createCategoria(payload, request),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: [CATEGORIAS_KEY],
      }),
  });
};

export const useUpdateCategoria = () => {
  const { request } = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<CategoriaInput> }) =>
      updateCategoria(id, payload, request),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: [CATEGORIAS_KEY],
      }),
  });
};

export const useDeleteCategoria = () => {
  const { request } = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteCategoria(id, request),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: [CATEGORIAS_KEY],
      }),
  });
};

export type { Categoria } from "./api";
