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
            className="h-9 w-32 animate-pulse rounded-full bg-slate-800/60"
          />
        ))}
      </div>
    );
  }

  if (!categories.length) {
    return (
      <div className="rounded-xl border border-slate-800/70 bg-slate-900/50 px-4 py-3 text-sm text-slate-400">
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
            className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
              active
                ? "border-sky-400/70 bg-sky-400/10 text-sky-100 shadow-lg"
                : "border-slate-800/70 bg-slate-900/30 text-slate-200 hover:border-slate-700 hover:text-slate-50"
            }`}
          >
            {category.nombre}
          </button>
        );
      })}
    </div>
  );
};
