import { InventoryCategory } from "../types";

type CategoryTabsProps = {
  categories: InventoryCategory[];
  activeId: number | null;
  onChange: (categoryId: number) => void;
  isLoading?: boolean;
};

export const CategoryTabs = ({
  categories,
  activeId,
  onChange,
  isLoading,
}: CategoryTabsProps) => {
  if (isLoading) {
    return (
      <div className="flex gap-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={`skeleton-${index}`}
            className="h-9 w-32 animate-pulse rounded-full bg-[hsl(var(--surface-strong))]"
          />
        ))}
      </div>
    );
  }

  if (!categories.length) {
    return (
      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface-strong))] px-4 py-3 text-sm text-[hsl(var(--muted))]">
        No hay categorias disponibles.
      </div>
    );
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-1" role="tablist">
      {categories.map((category) => {
        const active = category.id === activeId;
        return (
          <button
            key={category.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(category.id)}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--surface))] ${
              active
                ? "border-[hsl(var(--accent))] bg-[hsla(var(--accent)/0.2)] text-[hsl(var(--foreground))] shadow-lg shadow-black/10"
                : "border-[hsl(var(--border))] bg-[hsl(var(--surface-strong))] text-[hsl(var(--muted-strong))] hover:text-[hsl(var(--foreground))]"
            }`}
          >
            {category.nombre}
          </button>
        );
      })}
    </div>
  );
};
