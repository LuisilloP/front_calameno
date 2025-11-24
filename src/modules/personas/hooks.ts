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
  createPersona,
  deletePersona,
  listPersonas,
  PersonaInput,
  updatePersona,
} from "./api";

const PERSONAS_KEY = "personas";
const invalidatePersonasCatalog = () => invalidateCatalog("personas");

export const usePersonasList = (params: ListParams) => {
  const { request } = useApiClient();
  return useQuery({
    queryKey: [PERSONAS_KEY, params],
    queryFn: () => listPersonas(params, request),
    placeholderData: keepPreviousData,
  });
};

export const useCreatePersona = () => {
  const { request } = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: PersonaInput) =>
      createPersona(payload, request),
    onSuccess: () => {
      invalidatePersonasCatalog();
      queryClient.invalidateQueries({
        queryKey: [PERSONAS_KEY],
      });
    },
  });
};

export const useUpdatePersona = () => {
  const { request } = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<PersonaInput> }) =>
      updatePersona(id, payload, request),
    onSuccess: () => {
      invalidatePersonasCatalog();
      queryClient.invalidateQueries({
        queryKey: [PERSONAS_KEY],
      });
    },
  });
};

export const useDeletePersona = () => {
  const { request } = useApiClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deletePersona(id, request),
    onSuccess: () => {
      invalidatePersonasCatalog();
      queryClient.invalidateQueries({
        queryKey: [PERSONAS_KEY],
      });
    },
  });
};

export type { Persona } from "./api";
