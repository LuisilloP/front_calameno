"use client";

import {
  AdminEntityFormModal,
  EntityFormValues,
} from "@/modules/admin/components/AdminEntityFormModal";

type PersonasFormProps = {
  isOpen: boolean;
  mode: "create" | "edit";
  loading?: boolean;
  errorMessage?: string | null;
  initialValues?: EntityFormValues;
  onSubmit: (values: EntityFormValues) => void;
  onClose: () => void;
};

export const PersonasForm = ({
  isOpen,
  mode,
  loading,
  errorMessage,
  initialValues,
  onSubmit,
  onClose,
}: PersonasFormProps) => {
  const isEditing = mode === "edit";

  return (
    <AdminEntityFormModal
      isOpen={isOpen}
      title={isEditing ? "Editar persona" : "Nueva persona"}
      description="Las personas activas pueden asignarse a movimientos."
      submitLabel={
        isEditing ? "Guardar persona" : "Crear persona"
      }
      loading={loading}
      initialValues={initialValues}
      errorMessage={errorMessage}
      onSubmit={onSubmit}
      onClose={onClose}
    />
  );
};
