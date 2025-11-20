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

export type Marca = ActivableEntity;

export type MarcaInput = {
  nombre: string;
  activa: boolean;
};

const RESOURCE = "/marcas";

const run = <T>(
  path: string,
  options: ApiRequestOptions | undefined,
  requester?: RequestExecutor
) => {
  const executor = requester ?? apiRequest;
  return executor<T>(path, options);
};

export const listMarcas = async (
  params: ListParams,
  requester?: RequestExecutor
): Promise<PaginatedResponse<Marca>> => {
  const payload = await run<unknown>(
    RESOURCE,
    {
      query: params,
    },
    requester
  );
  return toPaginatedResponse<Marca>(payload, params);
};

export const createMarca = (
  payload: MarcaInput,
  requester?: RequestExecutor
) =>
  run<Marca>(
    RESOURCE,
    {
      method: "POST",
      body: payload,
    },
    requester
  );

export const updateMarca = (
  id: number,
  payload: Partial<MarcaInput>,
  requester?: RequestExecutor
) =>
  run<Marca>(
    `${RESOURCE}/${id}`,
    {
      method: "PUT",
      body: payload,
    },
    requester
  );

export const deleteMarca = (
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
