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

export type Locacion = ActivableEntity;

export type LocacionInput = {
  nombre: string;
  activa: boolean;
};

const RESOURCE = "/locaciones";

const run = <T>(
  path: string,
  options: ApiRequestOptions | undefined,
  requester?: RequestExecutor
) => {
  const executor = requester ?? apiRequest;
  return executor<T>(path, options);
};

export const listLocaciones = async (
  params: ListParams,
  requester?: RequestExecutor
): Promise<PaginatedResponse<Locacion>> => {
  const payload = await run<unknown>(
    RESOURCE,
    {
      query: params,
    },
    requester
  );
  return toPaginatedResponse<Locacion>(payload, params);
};

export const createLocacion = (
  payload: LocacionInput,
  requester?: RequestExecutor
) =>
  run<Locacion>(
    RESOURCE,
    {
      method: "POST",
      body: payload,
    },
    requester
  );

export const updateLocacion = (
  id: number,
  payload: Partial<LocacionInput>,
  requester?: RequestExecutor
) =>
  run<Locacion>(
    `${RESOURCE}/${id}`,
    {
      method: "PUT",
      body: payload,
    },
    requester
  );

export const toggleLocacion = (
  id: number,
  activa: boolean,
  requester?: RequestExecutor
) => updateLocacion(id, { activa }, requester);
