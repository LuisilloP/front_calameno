"use client";

import { FormEvent, useMemo, useRef, useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { AdminModal } from "@/modules/admin/components/AdminModal";
import { ProductoCatalogs, ProductoFormState } from "../types";
import { SearchableSelect } from "@/modules/ui/SearchableSelect";

type ProductoFormProps = {
  isOpen: boolean;
  mode: "create" | "edit";
  catalogs: ProductoCatalogs;
  initialValues?: ProductoFormState;
  loading?: boolean;
  errorMessage?: string | null;
  onSubmit: (values: ProductoFormState) => void;
  onClose: () => void;
};

export const ProductoForm = ({
  isOpen,
  mode,
  catalogs,
  initialValues,
  loading,
  errorMessage,
  onSubmit,
  onClose,
}: ProductoFormProps) => {
  const formKey = useMemo(() => {
    const base = initialValues
      ? `${initialValues.nombre}-${initialValues.sku}-${initialValues.uom_id}-${initialValues.marca_id}-${initialValues.categoria_id}-${initialValues.activo}`
      : "nuevo";
    return `${mode}-${isOpen}-${base}`;
  }, [initialValues, isOpen, mode]);

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={loading ? () => undefined : onClose}
      title={mode === "create" ? "Nuevo producto" : "Editar producto"}
      description="Completa los datos obligatorios para mantener la integridad del inventario."
      footer={
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            className="rounded-full border border-slate-700/80 px-4 py-2 text-sm text-slate-200 hover:border-slate-500 disabled:opacity-50"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="producto-form"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-500/80 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
            disabled={loading}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === "create" ? "Crear producto" : "Guardar cambios"}
          </button>
        </div>
      }
    >
      {isOpen && (
        <ProductoFormFields
          key={formKey}
          mode={mode}
          catalogs={catalogs}
          initialValues={initialValues}
          loading={Boolean(loading)}
          errorMessage={errorMessage}
          onSubmit={onSubmit}
        />
      )}
    </AdminModal>
  );
};

const defaultState: ProductoFormState = {
  nombre: "",
  sku: "",
  activo: true,
};

type ProductoFormFieldsProps = {
  mode: "create" | "edit";
  catalogs: ProductoCatalogs;
  initialValues?: ProductoFormState;
  loading: boolean;
  errorMessage?: string | null;
  onSubmit: (values: ProductoFormState) => void;
};

const ProductoFormFields = ({
  mode,
  catalogs,
  initialValues,
  loading,
  errorMessage,
  onSubmit,
}: ProductoFormFieldsProps) => {
  const [values, setValues] = useState<ProductoFormState>(
    () => ({
      ...defaultState,
      ...initialValues,
    })
  );
  const [localError, setLocalError] = useState<string | null>(null);
  const nameInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  const isCreate = mode === "create";

  const marcaOptions = useMemo(
    () =>
      catalogs.marcas.map((marca) => ({
        value: String(marca.id),
        label: marca.nombre,
      })),
    [catalogs.marcas]
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = values.nombre.trim();
    if (trimmedName.length < 1) {
      setLocalError("El nombre es obligatorio.");
      return;
    }
    if (!values.uom_id) {
      setLocalError("Debes seleccionar una unidad de medida.");
      return;
    }
    if (isCreate && !values.categoria_id) {
      setLocalError("Debes seleccionar una categoria.");
      return;
    }
    setLocalError(null);
    onSubmit({
      ...values,
      nombre: trimmedName,
      sku: values.sku.trim(),
    });
  };

  const renderSelect = (
    label: string,
    field: keyof Pick<
      ProductoFormState,
      "uom_id" | "marca_id" | "categoria_id"
    >,
    options: { id: number; nombre: string }[],
    required?: boolean,
    placeholder?: string
  ) => (
    <div className="space-y-1">
      <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
        {label}
        {required && <span className="text-rose-300"> *</span>}
      </label>
      <select
        className="w-full rounded-2xl border border-slate-800 bg-slate-950/50 px-4 py-3 text-sm text-slate-100 focus:border-slate-300 focus:outline-none"
        value={values[field] ?? ""}
        onChange={(event) =>
          setValues((prev) => ({
            ...prev,
            [field]: event.target.value ? Number(event.target.value) : undefined,
          }))
        }
        aria-label={label}
        disabled={loading}
      >
        <option value="">{placeholder ?? "Selecciona una opcion"}</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.nombre}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <form
      id="producto-form"
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <div className="space-y-2">
        <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
          Nombre *
        </label>
        <input
          ref={nameInputRef}
          className="w-full rounded-2xl border border-slate-800 bg-slate-950/50 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-slate-300 focus:outline-none"
          placeholder="Ej. Laptop X"
          value={values.nombre}
          onChange={(event) =>
            setValues((prev) => ({ ...prev, nombre: event.target.value }))
          }
          disabled={loading}
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
          SKU (opcional)
        </label>
        <input
          className="w-full rounded-2xl border border-slate-800 bg-slate-950/50 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-slate-300 focus:outline-none"
          placeholder="LPX-001"
          value={values.sku}
          onChange={(event) =>
            setValues((prev) => ({ ...prev, sku: event.target.value }))
          }
          disabled={loading}
        />
        {values.sku && (
          <p className="text-xs text-slate-400">
            SKU en mayusculas: {values.sku.toUpperCase()}
          </p>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {renderSelect(
          "Unidad de medida",
          "uom_id",
          catalogs.uoms,
          true,
          "Selecciona la unidad"
        )}
        <div className="space-y-1">
          <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
            Marca
          </label>
          <SearchableSelect
            placeholder="Opcional"
            options={marcaOptions}
            selected={values.marca_id ? [String(values.marca_id)] : []}
            onChange={(ids) =>
              setValues((prev) => ({
                ...prev,
                marca_id: ids[0] ? Number(ids[0]) : undefined,
              }))
            }
            disabled={loading}
          />
        </div>
        {renderSelect(
          "Categoria",
          "categoria_id",
          catalogs.categorias,
          isCreate,
          isCreate ? "Selecciona la categoria" : "Opcional"
        )}
      </div>

      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500"
          checked={values.activo}
          onChange={(event) =>
            setValues((prev) => ({
              ...prev,
              activo: event.target.checked,
            }))
          }
          disabled={loading}
        />
        <span className="text-sm text-slate-200">
          Activo por defecto (aparece en catalogos y movimientos)
        </span>
      </label>

      {(localError || errorMessage) && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          {localError ?? errorMessage}
        </div>
      )}
    </form>
  );
};
