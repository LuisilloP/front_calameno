import { describe, expect, it } from "vitest";
import {
  normalizeInventoryCategory,
  normalizeStockDay,
  normalizeWeeklyProduct,
} from "../inventoryWeeklyApi";

describe("inventoryWeeklyApi normalization", () => {
  it("coerces category ids and names from multiple backend shapes", () => {
    expect(
      normalizeInventoryCategory({ categoria_id: "12", name: "Secos" })
    ).toEqual({ id: 12, nombre: "Secos" });

    expect(normalizeInventoryCategory({})).toEqual({
      id: 0,
      nombre: "Categoria sin nombre",
    });
  });

  it("normalizes stock days and defaults status when missing", () => {
    const normalized = normalizeStockDay({
      date: "2025-03-02",
      valor: "10",
    });

    expect(normalized).toEqual({
      fecha: "2025-03-02",
      stock: 10,
      estado: "alto",
    });
  });

  it("maps weekly products, filters empty days and coerces ids", () => {
    const product = normalizeWeeklyProduct({
      producto_id: "7",
      nombre: "Tornillo",
      categoria_id: "4",
      dias: [
        { date: "2025-02-03", valor: "10", status: "bajo" },
        { dia: "2025-02-04", stock: "5", status: "desconocido" },
        { date: "", stock: 3 },
      ],
    });

    expect(product.productoId).toBe(7);
    expect(product.categoriaId).toBe(4);
    expect(product.dias).toHaveLength(2);
    expect(product.dias[0]).toEqual({
      fecha: "2025-02-03",
      stock: 10,
      estado: "bajo",
    });
    expect(product.dias[1].estado).toBe("alto");
  });
});
