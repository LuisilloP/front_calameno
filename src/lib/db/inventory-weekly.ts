import {
  InventoryCategory,
  StockStatus,
  WeeklyStockProduct,
} from "@/modules/inventory-weekly/types";
import { normalizeToMonday } from "@/modules/inventory-weekly/utils/date";

type InventoryProductSeed = {
  id: number;
  nombre: string;
  categoriaId: number;
  baseStock: number;
  variability: number;
  trend: number;
};

const CATEGORY_SEED: InventoryCategory[] = [
  { id: 1, nombre: "Electronica" },
  { id: 2, nombre: "Consumibles" },
  { id: 3, nombre: "Ergonomia" },
  { id: 4, nombre: "Infraestructura" },
  { id: 5, nombre: "Servicios Internos" },
];

const PRODUCT_SEED: InventoryProductSeed[] = [
  {
    id: 10,
    nombre: "Laptop X14 Pro",
    categoriaId: 1,
    baseStock: 42,
    variability: 16,
    trend: -2,
  },
  {
    id: 11,
    nombre: "Monitor 27'' HDR",
    categoriaId: 1,
    baseStock: 33,
    variability: 9,
    trend: -1,
  },
  {
    id: 12,
    nombre: "Dock USB-C Elite",
    categoriaId: 1,
    baseStock: 24,
    variability: 7,
    trend: -3,
  },
  {
    id: 20,
    nombre: "Cartucho tinta XL",
    categoriaId: 2,
    baseStock: 58,
    variability: 20,
    trend: -4,
  },
  {
    id: 21,
    nombre: "Pack sanitizante 500ml",
    categoriaId: 2,
    baseStock: 35,
    variability: 11,
    trend: -2,
  },
  {
    id: 22,
    nombre: "Bolsas reciclaje 30L",
    categoriaId: 2,
    baseStock: 68,
    variability: 22,
    trend: -5,
  },
  {
    id: 30,
    nombre: "Silla ergonomica Nova",
    categoriaId: 3,
    baseStock: 18,
    variability: 5,
    trend: 1,
  },
  {
    id: 31,
    nombre: "Reposapies ajustable",
    categoriaId: 3,
    baseStock: 27,
    variability: 8,
    trend: 0,
  },
  {
    id: 40,
    nombre: "Switch gigabit 48p",
    categoriaId: 4,
    baseStock: 12,
    variability: 4,
    trend: -1,
  },
  {
    id: 41,
    nombre: "UPS 3KVA",
    categoriaId: 4,
    baseStock: 9,
    variability: 3,
    trend: 2,
  },
  {
    id: 50,
    nombre: "Kit bienvenida remoto",
    categoriaId: 5,
    baseStock: 16,
    variability: 6,
    trend: -1,
  },
  {
    id: 51,
    nombre: "Merchandising eventos",
    categoriaId: 5,
    baseStock: 45,
    variability: 13,
    trend: -6,
  },
];

let categoriesCache: InventoryCategory[] | null = null;
let productsCache: InventoryProductSeed[] | null = null;

const SEED_LOCK: { initialized: boolean } = { initialized: false };

const seedData = () => {
  if (SEED_LOCK.initialized) return;
  categoriesCache = [...CATEGORY_SEED].sort((a, b) =>
    a.nombre.localeCompare(b.nombre, "es")
  );
  productsCache = [...PRODUCT_SEED];
  SEED_LOCK.initialized = true;
};

const ensureSeeded = () => {
  if (!SEED_LOCK.initialized) {
    seedData();
  }
};

const formatIso = (date: Date) => date.toISOString().slice(0, 10);

const getWeekSeed = (date: Date) => {
  const normalized = normalizeToMonday(date);
  return Math.floor(normalized.getTime() / (7 * 24 * 60 * 60 * 1000));
};

const computeStatus = (value: number): StockStatus => {
  if (value >= 30) return "alto";
  if (value >= 10) return "bajo";
  return "critico";
};

const computeDailyStock = (
  product: InventoryProductSeed,
  dayIndex: number,
  weekSeed: number
) => {
  const base = product.baseStock;
  const oscillation = Math.sin((product.id + dayIndex + weekSeed) * 0.85);
  const noise =
    ((product.id * 13 + dayIndex * 7 + weekSeed * 11) % 5) - 2.2;
  const drift = product.trend * (weekSeed % 5);
  const decay = Math.max(product.trend, 0) * (dayIndex * 0.3);
  const value =
    base +
    oscillation * product.variability +
    drift -
    decay +
    noise * 1.4;
  return Math.max(0, Math.round(value));
};

type WeeklyStockParams = {
  categoryIds: number[];
  weekStart: string;
};

const isValidCategory = (id: number) =>
  categoriesCache?.some((category) => category.id === id);

export const inventoryWeeklyDb = {
  listCategories(): InventoryCategory[] {
    ensureSeeded();
    return categoriesCache ? [...categoriesCache] : [];
  },
  listWeeklyStock(params: WeeklyStockParams): WeeklyStockProduct[] {
    ensureSeeded();
    const weekStartDate = normalizeToMonday(new Date(params.weekStart));
    const weekSeed = getWeekSeed(weekStartDate);
    const startTimestamp = weekStartDate.getTime();

    const filteredCategoryIds = params.categoryIds
      .filter((value, index, array) => array.indexOf(value) === index)
      .filter((id) => isValidCategory(id));

    if (!productsCache || filteredCategoryIds.length === 0) {
      return [];
    }

    return productsCache
      .filter((product) => filteredCategoryIds.includes(product.categoriaId))
      .map<WeeklyStockProduct>((product) => {
        const dias = Array.from({ length: 7 }, (_, index) => {
          const currentDate = new Date(startTimestamp + index * 24 * 60 * 60 * 1000);
          const stock = computeDailyStock(product, index, weekSeed);
          return {
            fecha: formatIso(currentDate),
            stock,
            estado: computeStatus(stock),
          };
        });
        return {
          productoId: product.id,
          productoNombre: product.nombre,
          categoriaId: product.categoriaId,
          dias,
        };
      });
  },
};

export type { WeeklyStockParams };
