"use client";

import {
  AdminEntityFormModal,
  EntityFormValues,
} from "@/modules/admin/components/AdminEntityFormModal";

type MarcasFormProps = {
  isOpen: boolean;
  mode: "create" | "edit";
  loading?: boolean;
  errorMessage?: string | null;
  initialValues?: EntityFormValues;
  onSubmit: (values: EntityFormValues) => void;
  onClose: () => void;
};

export const MarcasForm = ({
  isOpen,
  mode,
  loading,
  errorMessage,
  initialValues,
  onSubmit,
  onClose,
}: MarcasFormProps) => {
  const isEditing = mode === "edit";

  return (
    <AdminEntityFormModal
      isOpen={isOpen}
      title={isEditing ? "Editar marca" : "Nueva marca"}
      description="Define marcas para identificar productos."
      submitLabel={
        isEditing ? "Guardar marca" : "Crear marca"
      }
      loading={loading}
      initialValues={initialValues}
      errorMessage={errorMessage}
      onSubmit={onSubmit}
      onClose={onClose}
    />
  );
};
