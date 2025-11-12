"use client";

import {
  AdminEntityFormModal,
  EntityFormValues,
} from "@/modules/admin/components/AdminEntityFormModal";

type CategoriasFormProps = {
  isOpen: boolean;
  mode: "create" | "edit";
  loading?: boolean;
  errorMessage?: string | null;
  initialValues?: EntityFormValues;
  onSubmit: (values: EntityFormValues) => void;
  onClose: () => void;
};

export const CategoriasForm = ({
  isOpen,
  mode,
  loading,
  errorMessage,
  initialValues,
  onSubmit,
  onClose,
}: CategoriasFormProps) => {
  const isEditing = mode === "edit";

  return (
    <AdminEntityFormModal
      isOpen={isOpen}
      title={isEditing ? "Editar categoria" : "Nueva categoria"}
      description="Define etiquetas para agrupar productos y reportes."
      submitLabel={
        isEditing ? "Guardar categoria" : "Crear categoria"
      }
      loading={loading}
      initialValues={initialValues}
      errorMessage={errorMessage}
      onSubmit={onSubmit}
      onClose={onClose}
    />
  );
};
