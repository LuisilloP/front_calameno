import { NextResponse } from "next/server";
import { inventoryWeeklyDb } from "@/lib/db/inventory-weekly";
import { inventoryWeeklyApi } from "@/services/inventoryWeeklyApi";

export const dynamic = "force-dynamic";

const FORCE_MOCK =
  process.env.INVENTORY_WEEKLY_FORCE_MOCK?.toLowerCase() === "true";

const respond = (payload: unknown, source: string) =>
  NextResponse.json(payload, {
    headers: {
      "x-inventory-source": source,
    },
  });

export async function GET() {
  if (!FORCE_MOCK) {
    try {
      const categories = await inventoryWeeklyApi.listCategories();
      return respond(categories, "backend");
    } catch (error) {
      console.error("[InventoryWeekly] categories fallback", error);
    }
  }

  const fallback = inventoryWeeklyDb.listCategories();
  return respond(fallback, FORCE_MOCK ? "mock" : "mock-fallback");
}
