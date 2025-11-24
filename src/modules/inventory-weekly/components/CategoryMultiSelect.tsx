import { SearchableSelect } from "@/modules/ui/SearchableSelect";
import { InventoryCategory } from "../types";

type CategoryMultiSelectProps = {
  categories: InventoryCategory[];
  value: number[];
  onChange: (categoryIds: number[]) => void;
  disabled?: boolean;
};

export const CategoryMultiSelect = ({
  categories,
  value,
  onChange,
  disabled,
}: CategoryMultiSelectProps) => {
  const options = categories.map((category) => ({
    value: String(category.id),
    label: category.nombre,
  }));

  const handleChange = (nextValues: string[]) => {
    const nextIds = nextValues
      .map((val) => Number(val))
      .filter((id) => Number.isFinite(id));
    onChange(nextIds);
  };

  return (
    <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface-strong))] p-4 shadow-sm shadow-black/5">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[hsl(var(--muted-strong))]">
        Seleccion avanzada
      </p>
      <p className="text-sm text-[hsl(var(--muted))]">
        Combina categorias para comparar stock en una misma tabla.
      </p>
      <SearchableSelect
        className="mt-3"
        label="Categorias activas"
        placeholder="Buscar categoria..."
        options={options}
        selected={value.map(String)}
        onChange={handleChange}
        disabled={disabled || categories.length === 0}
        emptyText="Sin coincidencias"
      />
    </div>
  );
};
