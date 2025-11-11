"use client";

import {
  AdminEntityFormModal,
  EntityFormValues,
} from "@/modules/admin/components/AdminEntityFormModal";

type LocacionesFormProps = {
  isOpen: boolean;
  mode: "create" | "edit";
  loading?: boolean;
  errorMessage?: string | null;
  initialValues?: EntityFormValues;
  onSubmit: (values: EntityFormValues) => void;
  onClose: () => void;
};

export const LocacionesForm = ({
  isOpen,
  mode,
  loading,
  errorMessage,
  initialValues,
  onSubmit,
  onClose,
}: LocacionesFormProps) => {
  const isEditing = mode === "edit";

  return (
    <AdminEntityFormModal
      isOpen={isOpen}
      title={isEditing ? "Editar locacion" : "Nueva locacion"}
      description="Las locaciones activas estaran disponibles en el registro de movimientos."
      submitLabel={isEditing ? "Guardar locacion" : "Crear locacion"}
      loading={loading}
      initialValues={initialValues}
      errorMessage={errorMessage}
      onSubmit={onSubmit}
      onClose={onClose}
    />
  );
};
