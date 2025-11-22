import { describe, expect, it } from "vitest";
import { inventoryWeeklyKeys, normalizeWeeklyRequest } from "../query-keys";

describe("inventoryWeekly query helpers", () => {
  it("normalizes request params", () => {
    const normalized = normalizeWeeklyRequest({
      categories: [3, 1, 3, 2],
      weekStart: "2025-02-04",
    });

    expect(normalized).toEqual({
      categories: [1, 2, 3],
      weekStart: "2025-02-03",
    });
  });

  it("returns null when categories are missing", () => {
    expect(
      normalizeWeeklyRequest({ categories: [], weekStart: "2025-02-01" })
    ).toBeNull();
  });

  it("builds stable query keys", () => {
    expect(inventoryWeeklyKeys.categories()).toEqual([
      "inventory-weekly",
      "categories",
    ]);
    expect(
      inventoryWeeklyKeys.weekly({ categories: [1], weekStart: "2025-02-03" })
    ).toEqual(["inventory-weekly", "weekly", { categories: [1], weekStart: "2025-02-03" }]);
  });
});
