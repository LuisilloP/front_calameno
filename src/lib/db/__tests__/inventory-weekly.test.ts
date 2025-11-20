import { describe, expect, it } from "vitest";
import { inventoryWeeklyDb } from "@/lib/db/inventory-weekly";

describe("inventoryWeeklyDb", () => {
  it("should return categories sorted alphabetically", () => {
    const categories = inventoryWeeklyDb.listCategories();
    expect(categories.length).toBeGreaterThan(0);
    const sorted = [...categories].sort((a, b) =>
      a.nombre.localeCompare(b.nombre, "es")
    );
    expect(categories).toEqual(sorted);
  });

  it("should return weekly stock with 7 days per product", () => {
    const categories = inventoryWeeklyDb.listCategories();
    const firstCategory = categories[0];
    const weekStart = "2025-02-03";
    const weekly = inventoryWeeklyDb.listWeeklyStock({
      categoryIds: [firstCategory.id],
      weekStart,
    });
    expect(weekly.length).toBeGreaterThan(0);
    weekly.forEach((item) => {
      expect(item.dias).toHaveLength(7);
      item.dias.forEach((day, index) => {
        expect(day.fecha).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        if (index > 0) {
          const prev = new Date(item.dias[index - 1].fecha);
          const current = new Date(day.fecha);
          expect(current.getTime() - prev.getTime()).toBe(24 * 60 * 60 * 1000);
        }
        expect(["alto", "bajo", "critico"]).toContain(day.estado);
      });
    });
  });

  it("returns empty array for invalid categories", () => {
    const data = inventoryWeeklyDb.listWeeklyStock({
      categoryIds: [9999],
      weekStart: "2025-02-03",
    });
    expect(data).toEqual([]);
  });
});
