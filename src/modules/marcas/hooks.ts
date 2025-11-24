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
  MarcaInput,
  createMarca,
  deleteMarca,
  listMarcas,
  updateMarca,
} from "./api";

const MARCAS_KEY = "marcas";
const CATALOG_KEY = "catalogos";

export const useMarcasList = (params: ListParams) => {
  const { request } = useApiClient();
  return useQuery({
    queryKey: [MARCAS_KEY, params],
    queryFn: () => listMarcas(params, request),
    placeholderData: keepPreviousData,
  });
};

export const useCreateMarca = () => {
  const { request } = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: MarcaInput) =>
      createMarca(payload, request),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [MARCAS_KEY],
      });
      queryClient.invalidateQueries({
        queryKey: [CATALOG_KEY, "marcas"],
      });
    },
  });
};

export const useUpdateMarca = () => {
  const { request } = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<MarcaInput> }) =>
      updateMarca(id, payload, request),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [MARCAS_KEY],
      });
      queryClient.invalidateQueries({
        queryKey: [CATALOG_KEY, "marcas"],
      });
    },
  });
};

export const useDeleteMarca = () => {
  const { request } = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteMarca(id, request),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [MARCAS_KEY],
      });
      queryClient.invalidateQueries({
        queryKey: [CATALOG_KEY, "marcas"],
      });
    },
  });
};

export type { Marca } from "./api";
