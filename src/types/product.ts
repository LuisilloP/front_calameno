import type { PageMeta } from "./common";

export interface Product {
  id: number;
  name: string;
  category?: string | null;
  baseUomId: number;
  purchaseUomId?: number | null;
  purchaseToBase?: number | null;
  shelfLifeDays?: number | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductDto {
  name: string;
  category?: string;
  baseUomId: number;
  purchaseUomId?: number | null;
  purchaseToBase?: number | null;
  shelfLifeDays?: number | null;
}

export interface ProductList {
  items: Product[];
  meta: PageMeta;
}
