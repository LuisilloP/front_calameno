import type { PageMeta } from "./common";

export type UomCategory = "weight" | "volume" | "unit";

export interface Uom {
  id: number;
  name: string;
  category: UomCategory;
  ratioToBase: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface UomDto {
  name: string;
  category: UomCategory;
  ratioToBase: number;
}

export interface UomList {
  items: Uom[];
  meta: PageMeta;
}
