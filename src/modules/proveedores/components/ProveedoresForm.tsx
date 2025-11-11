"use client";

import {
  AdminEntityFormModal,
  EntityFormValues,
} from "@/modules/admin/components/AdminEntityFormModal";

type ProveedoresFormProps = {
  isOpen: boolean;
  mode: "create" | "edit";
  loading?: boolean;
  errorMessage?: string | null;
  initialValues?: EntityFormValues;
  onSubmit: (values: EntityFormValues) => void;
  onClose: () => void;
};

export const ProveedoresForm = ({
  isOpen,
  mode,
  loading,
  errorMessage,
  initialValues,
  onSubmit,
  onClose,
}: ProveedoresFormProps) => {
  const isEditing = mode === "edit";

  return (
    <AdminEntityFormModal
      isOpen={isOpen}
      title={isEditing ? "Editar proveedor" : "Nuevo proveedor"}
      description="Activa y suspende proveedores sin perder el historial."
      submitLabel={
        isEditing ? "Guardar proveedor" : "Crear proveedor"
      }
      loading={loading}
      initialValues={initialValues}
      errorMessage={errorMessage}
      onSubmit={onSubmit}
      onClose={onClose}
    />
  );
};
