"use client";

import { FormEvent, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { AdminModal } from "./AdminModal";

export type EntityFormValues = {
  nombre: string;
  activa: boolean;
};

type AdminEntityFormModalProps = {
  isOpen: boolean;
  title: string;
  description?: string;
  submitLabel?: string;
  loading?: boolean;
  initialValues?: EntityFormValues;
  errorMessage?: string | null;
  onSubmit: (values: EntityFormValues) => void;
  onClose: () => void;
};

const defaultValues: EntityFormValues = {
  nombre: "",
  activa: true,
};

export const AdminEntityFormModal = ({
  isOpen,
  title,
  description,
  submitLabel = "Guardar",
  loading,
  initialValues,
  errorMessage,
  onSubmit,
  onClose,
}: AdminEntityFormModalProps) => {
  const mergedValues = useMemo(
    () => ({
      ...defaultValues,
      ...initialValues,
    }),
    [initialValues]
  );

  const formKey = useMemo(
    () =>
      `${mergedValues.nombre}-${mergedValues.activa}-${
        isOpen ? "open" : "closed"
      }`,
    [mergedValues.nombre, mergedValues.activa, isOpen]
  );

  return (
    <AdminModal
      title={title}
      description={description}
      isOpen={isOpen}
      onClose={loading ? () => undefined : onClose}
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
            form="admin-entity-form"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-500/80 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
            disabled={loading}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {submitLabel}
          </button>
        </div>
      }
    >
      {isOpen && (
        <EntityFormFields
          key={formKey}
          initialValues={mergedValues}
          loading={Boolean(loading)}
          errorMessage={errorMessage}
          onSubmit={onSubmit}
        />
      )}
    </AdminModal>
  );
};

type EntityFormFieldsProps = {
  initialValues: EntityFormValues;
  loading: boolean;
  errorMessage?: string | null;
  onSubmit: (values: EntityFormValues) => void;
};

const EntityFormFields = ({
  initialValues,
  loading,
  errorMessage,
  onSubmit,
}: EntityFormFieldsProps) => {
  const [values, setValues] = useState<EntityFormValues>(() => initialValues);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = values.nombre.trim();
    if (trimmed.length < 1) {
      setFormError("El nombre es obligatorio.");
      return;
    }
    setFormError(null);
    onSubmit({ ...values, nombre: trimmed });
  };

  return (
    <form
      id="admin-entity-form"
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      <div className="space-y-2">
        <label className="text-xs uppercase tracking-[0.3em] text-slate-400">
          Nombre
        </label>
        <input
          className="w-full rounded-2xl border border-slate-800 bg-slate-950/50 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-slate-300 focus:outline-none"
          placeholder="Ej. Bodega A"
          value={values.nombre}
          minLength={1}
          onChange={(event) =>
            setValues((prev) => ({
              ...prev,
              nombre: event.target.value,
            }))
          }
          disabled={loading}
        />
        {(formError || errorMessage) && (
          <p className="text-xs text-rose-300">
            {formError ?? errorMessage}
          </p>
        )}
      </div>

      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500"
          checked={values.activa}
          onChange={(event) =>
            setValues((prev) => ({
              ...prev,
              activa: event.target.checked,
            }))
          }
          disabled={loading}
        />
        <span className="text-sm text-slate-200">
          Activa por defecto (puedes desactivar luego)
        </span>
      </label>
    </form>
  );
};
