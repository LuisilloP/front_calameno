import { inventoryWeeklyDb } from "@/lib/db/inventory-weekly";
import { InventoryWeeklyClient } from "@/modules/inventory-weekly/components/InventoryWeeklyClient";
import { getCurrentWeekStartISO } from "@/modules/inventory-weekly/utils/date";

export default function InventoryWeeklyPage() {
  const categories = inventoryWeeklyDb.listCategories();
  const weekStart = getCurrentWeekStartISO();

  return (
    <InventoryWeeklyClient
      initialCategories={categories}
      initialWeekStart={weekStart}
    />
  );
}
