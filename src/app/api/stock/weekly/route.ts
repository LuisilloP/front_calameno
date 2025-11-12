import { NextRequest, NextResponse } from "next/server";
import { inventoryWeeklyDb } from "@/lib/db/inventory-weekly";
import { inventoryWeeklyApi } from "@/services/inventoryWeeklyApi";
import { normalizeIsoToMonday } from "@/modules/inventory-weekly/utils/date";

export const dynamic = "force-dynamic";

const FORCE_MOCK =
  process.env.INVENTORY_WEEKLY_FORCE_MOCK?.toLowerCase() === "true";

const parseCategoryIds = (value: string | null) => {
  if (!value) return [];
  return value
    .split(",")
    .map((part) => Number(part.trim()))
    .filter((num) => Number.isFinite(num));
};

const respond = (payload: unknown, source: string) =>
  NextResponse.json(payload, {
    headers: {
      "x-inventory-source": source,
    },
  });

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const categoriesParam = searchParams.get("categories");
  const weekStartParam = searchParams.get("weekStart");

  const categories = parseCategoryIds(categoriesParam);
  if (categories.length === 0) {
    return NextResponse.json(
      { message: "Parametro categories requerido" },
      { status: 400 }
    );
  }

  let weekStartIso: string;
  try {
    weekStartIso = normalizeIsoToMonday(
      weekStartParam ?? new Date().toISOString()
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Parametros invalidos", detail: (error as Error).message },
      { status: 400 }
    );
  }

  if (!FORCE_MOCK) {
    try {
      const data = await inventoryWeeklyApi.listWeeklyStock({
        categoryIds: categories,
        weekStart: weekStartIso,
      });
      return respond(data, "backend");
    } catch (error) {
      console.error("[InventoryWeekly] weekly fallback", error);
    }
  }

  const fallback = inventoryWeeklyDb.listWeeklyStock({
    categoryIds: categories,
    weekStart: weekStartIso,
  });
  return respond(fallback, FORCE_MOCK ? "mock" : "mock-fallback");
}
