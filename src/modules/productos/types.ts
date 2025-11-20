export type CatalogItem = {
  id: number;
  nombre: string;
  abreviatura?: string;
};

export type Producto = {
  id: number;
  nombre: string;
  sku?: string | null;
  activo: boolean;
  uom_id: number;
  marca_id?: number | null;
  categoria_id?: number | null;
};

export type ProductoPayload = {
  nombre: string;
  sku?: string | null;
  activo: boolean;
  uom_id: number;
  marca_id?: number | null;
  categoria_id?: number | null;
};

export type ProductoFormState = {
  nombre: string;
  sku: string;
  activo: boolean;
  uom_id?: number;
  marca_id?: number | null;
  categoria_id?: number | null;
};

export type ProductoCatalogs = {
  uoms: CatalogItem[];
  marcas: CatalogItem[];
  categorias: CatalogItem[];
};
