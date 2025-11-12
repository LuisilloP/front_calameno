import {
  apiRequest,
  ApiRequestOptions,
  RequestExecutor,
} from "@/modules/admin/api/client";
import {
  ListParams,
  PaginatedResponse,
  toPaginatedResponse,
  buildListParams,
} from "@/modules/admin/types";
import { CatalogItem, Producto, ProductoPayload } from "./types";

const RESOURCE = "/productos";
const UOMS_RESOURCE = "/uoms";
const MARCAS_RESOURCE = "/marcas";
const CATEGORIAS_RESOURCE = "/categorias";

const exec = <T>(
  path: string,
  options: ApiRequestOptions = {},
  requester?: RequestExecutor
) => {
  const runner = requester ?? apiRequest;
  return runner<T>(path, options);
};

export const listProductos = async (
  params: ListParams,
  requester?: RequestExecutor
): Promise<PaginatedResponse<Producto>> => {
  const payload = await exec<unknown>(
    `${RESOURCE}`,
    {
      method: "GET",
      query: params,
    },
    requester
  );
  return toPaginatedResponse<Producto>(payload, params);
};

export const getProducto = (id: number, requester?: RequestExecutor) =>
  exec<Producto>(`${RESOURCE}/${id}`, undefined, requester);

export const createProducto = (
  payload: ProductoPayload,
  requester?: RequestExecutor
) =>
  exec<Producto>(
    RESOURCE,
    {
      method: "POST",
      body: payload,
    },
    requester
  );

export const updateProducto = (
  id: number,
  payload: Partial<ProductoPayload>,
  requester?: RequestExecutor
) =>
  exec<Producto>(
    `${RESOURCE}/${id}`,
    {
      method: "PUT",
      body: payload,
    },
    requester
  );

export const deleteProducto = (id: number, requester?: RequestExecutor) =>
  exec<void>(
    `${RESOURCE}/${id}`,
    {
      method: "DELETE",
    },
    requester
  );

export const toggleProductoActivo = (
  id: number,
  activo: boolean,
  requester?: RequestExecutor
) => updateProducto(id, { activo }, requester);

const fetchCatalog = (
  path: string,
  requester?: RequestExecutor
) =>
  exec<CatalogItem[]>(
    path,
    {
      method: "GET",
      query: buildListParams(0, 500),
    },
    requester
  );

export const listUomsCatalog = (requester?: RequestExecutor) =>
  fetchCatalog(UOMS_RESOURCE, requester);

export const listMarcasCatalog = (requester?: RequestExecutor) =>
  fetchCatalog(MARCAS_RESOURCE, requester);

export const listCategoriasCatalog = (requester?: RequestExecutor) =>
  fetchCatalog(CATEGORIAS_RESOURCE, requester);
