import {
  ApiRequestOptions,
  apiRequest,
  RequestExecutor,
} from "@/modules/admin/api/client";
import {
  ActivableEntity,
  ListParams,
  PaginatedResponse,
  toPaginatedResponse,
} from "@/modules/admin/types";

export type Persona = ActivableEntity;

export type PersonaInput = {
  nombre: string;
  activa: boolean;
};

const RESOURCE = "/personas";

const run = <T>(
  path: string,
  options: ApiRequestOptions | undefined,
  requester?: RequestExecutor
) => {
  const executor = requester ?? apiRequest;
  return executor<T>(path, options);
};

export const listPersonas = async (
  params: ListParams,
  requester?: RequestExecutor
): Promise<PaginatedResponse<Persona>> => {
  const payload = await run<unknown>(
    RESOURCE,
    {
      query: params,
    },
    requester
  );
  return toPaginatedResponse<Persona>(payload, params);
};

export const createPersona = (
  payload: PersonaInput,
  requester?: RequestExecutor
) =>
  run<Persona>(
    RESOURCE,
    {
      method: "POST",
      body: payload,
    },
    requester
  );

export const updatePersona = (
  id: number,
  payload: Partial<PersonaInput>,
  requester?: RequestExecutor
) =>
  run<Persona>(
    `${RESOURCE}/${id}`,
    {
      method: "PUT",
      body: payload,
    },
    requester
  );

export const deletePersona = (
  id: number,
  requester?: RequestExecutor
) =>
  run<void>(
    `${RESOURCE}/${id}`,
    {
      method: "DELETE",
    },
    requester
  );
