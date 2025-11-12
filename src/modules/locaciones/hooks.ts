"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useApiClient } from "@/modules/admin/hooks/useApiClient";
import { ListParams } from "@/modules/admin/types";
import {
  createLocacion,
  listLocaciones,
  LocacionInput,
  toggleLocacion,
  updateLocacion,
} from "./api";

const LOCACIONES_KEY = "locaciones";

export const useLocacionesList = (params: ListParams) => {
  const { request } = useApiClient();
  return useQuery({
    queryKey: [LOCACIONES_KEY, params],
    queryFn: () => listLocaciones(params, request),
    keepPreviousData: true,
  });
};

export const useCreateLocacion = () => {
  const { request } = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: LocacionInput) =>
      createLocacion(payload, request),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: [LOCACIONES_KEY],
      }),
  });
};

export const useUpdateLocacion = () => {
  const { request } = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<LocacionInput> }) =>
      updateLocacion(id, payload, request),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: [LOCACIONES_KEY],
      }),
  });
};

export const useToggleLocacion = () => {
  const { request } = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, activa }: { id: number; activa: boolean }) =>
      toggleLocacion(id, activa, request),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: [LOCACIONES_KEY],
      }),
  });
};

export type { Locacion } from "./api";
