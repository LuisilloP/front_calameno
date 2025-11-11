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

export type Categoria = ActivableEntity;

export type CategoriaInput = {
  nombre: string;
  activa: boolean;
};

const RESOURCE = "/categorias";

const run = <T>(
  path: string,
  options: ApiRequestOptions | undefined,
  requester?: RequestExecutor
) => {
  const executor = requester ?? apiRequest;
  return executor<T>(path, options);
};

export const listCategorias = async (
  params: ListParams,
  requester?: RequestExecutor
): Promise<PaginatedResponse<Categoria>> => {
  const payload = await run<unknown>(
    RESOURCE,
    {
      query: params,
    },
    requester
  );
  return toPaginatedResponse<Categoria>(payload, params);
};

export const createCategoria = (
  payload: CategoriaInput,
  requester?: RequestExecutor
) =>
  run<Categoria>(
    RESOURCE,
    {
      method: "POST",
      body: payload,
    },
    requester
  );

export const updateCategoria = (
  id: number,
  payload: Partial<CategoriaInput>,
  requester?: RequestExecutor
) =>
  run<Categoria>(
    `${RESOURCE}/${id}`,
    {
      method: "PUT",
      body: payload,
    },
    requester
  );

export const deleteCategoria = (
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
