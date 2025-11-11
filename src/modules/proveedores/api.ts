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

export type Proveedor = ActivableEntity;

export type ProveedorInput = {
  nombre: string;
  activa: boolean;
};

const RESOURCE = "/proveedores";

const run = <T>(
  path: string,
  options: ApiRequestOptions | undefined,
  requester?: RequestExecutor
) => {
  const executor = requester ?? apiRequest;
  return executor<T>(path, options);
};

export const listProveedores = async (
  params: ListParams,
  requester?: RequestExecutor
): Promise<PaginatedResponse<Proveedor>> => {
  const payload = await run<unknown>(
    RESOURCE,
    {
      query: params,
    },
    requester
  );
  return toPaginatedResponse<Proveedor>(payload, params);
};

export const createProveedor = (
  payload: ProveedorInput,
  requester?: RequestExecutor
) =>
  run<Proveedor>(
    RESOURCE,
    {
      method: "POST",
      body: payload,
    },
    requester
  );

export const updateProveedor = (
  id: number,
  payload: Partial<ProveedorInput>,
  requester?: RequestExecutor
) =>
  run<Proveedor>(
    `${RESOURCE}/${id}`,
    {
      method: "PUT",
      body: payload,
    },
    requester
  );

export const deleteProveedor = (
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
