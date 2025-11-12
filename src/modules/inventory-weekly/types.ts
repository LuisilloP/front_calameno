export type StockStatus = "alto" | "bajo" | "critico";

export type InventoryCategory = {
  id: number;
  nombre: string;
};

export type StockDay = {
  fecha: string;
  stock: number;
  estado: StockStatus;
};

export type WeeklyStockProduct = {
  productoId: number;
  productoNombre: string;
  categoriaId: number;
  dias: StockDay[];
};

export type WeeklyStockResponse = WeeklyStockProduct[];

export type WeeklyStockRequest = {
  categories: number[];
  weekStart: string;
};

export type InventoryFiltersState = {
  weekStart: string;
  primaryCategoryId: number | null;
  selectedCategoryIds: number[];
};
