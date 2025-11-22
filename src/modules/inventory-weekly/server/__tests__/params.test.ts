import { describe, expect, it } from "vitest";
import {
  normalizeWeekStartParam,
  parseCategoryIds,
  shouldForceMock,
} from "../params";

describe("inventory-weekly params helpers", () => {
  it("parses, cleans and sorts category ids", () => {
    const parsed = parseCategoryIds("3, 1, 1, foo, 2");
    expect(parsed).toEqual([1, 2, 3]);
  });

  it("returns empty array when no valid values are provided", () => {
    expect(parseCategoryIds(",,a,b")).toEqual([]);
    expect(parseCategoryIds(null)).toEqual([]);
  });

  it("normalizes week start to monday and tolerates missing value", () => {
    const normalized = normalizeWeekStartParam("2025-02-04");
    expect(normalized).toBe("2025-02-03");

    const fallback = normalizeWeekStartParam(null);
    expect(fallback).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("detects mock forcing flags regardless of casing or whitespace", () => {
    expect(shouldForceMock("true")).toBe(true);
    expect(shouldForceMock(" TRUE ")).toBe(true);
    expect(shouldForceMock("false")).toBe(false);
    expect(shouldForceMock(undefined)).toBe(false);
  });
});
