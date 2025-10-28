"use client";

import * as React from "react";
import { toast } from "@/components/ui/toast";

import { RequireAuth } from "@/components/core/require-auth";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { UomForm } from "@/components/uoms/UomForm";
import { UomTable } from "@/components/uoms/UomTable";
import { useUomStore } from "@/store/uom.store";
import type { Uom, UomDto } from "@/types/uom";

export default function UomsPage() {
  const create = useUomStore((state) => state.create);
  const update = useUomStore((state) => state.update);
  const remove = useUomStore((state) => state.remove);

  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Uom | null>(null);
  const [pendingDelete, setPendingDelete] = React.useState<Uom | null>(null);

  const handleCreate = async (values: UomDto) => {
    await create(values);
    toast.success("Unidad de medida creada");
    setOpen(false);
  };

  const handleUpdate = async (values: UomDto) => {
    if (!editing) return;
    await update(editing.id, values);
    toast.success("Unidad de medida actualizada");
    setOpen(false);
    setEditing(null);
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;
    await remove(pendingDelete.id);
    toast.success("Unidad de medida eliminada");
    setPendingDelete(null);
  };

  const isEditMode = Boolean(editing);

  return (
    <RequireAuth>
      <section className="container-responsive py-10">
        <header className="mb-6 space-y-1">
          <h1 className="text-2xl font-semibold">Unidades de medida</h1>
          <p className="text-sm text-muted-foreground">
            Gestiona unidades base y derivadas para estandarizar tus productos en el inventario.
          </p>
        </header>

        <Dialog
          open={open}
          onOpenChange={(value) => {
            setOpen(value);
            if (!value) {
              setEditing(null);
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isEditMode ? "Editar unidad" : "Nueva unidad"}</DialogTitle>
            </DialogHeader>
            <UomForm
              defaultValues={editing ?? undefined}
              onSubmit={isEditMode ? handleUpdate : handleCreate}
              submitLabel={isEditMode ? "Actualizar" : "Crear"}
            />
          </DialogContent>
        </Dialog>

        <UomTable
          onCreate={() => {
            setEditing(null);
            setOpen(true);
          }}
          onEdit={(uom) => {
            setEditing(uom);
            setOpen(true);
          }}
          onDelete={(uom) => setPendingDelete(uom)}
        />

        <ConfirmDialog
          open={Boolean(pendingDelete)}
          onOpenChange={(value) => {
            if (!value) {
              setPendingDelete(null);
            }
          }}
          title="Eliminar unidad de medida?"
          description={pendingDelete ? `Se eliminara "${pendingDelete.name}". Esta accion no se puede deshacer.` : undefined}
          confirmLabel="Eliminar"
          onConfirm={handleDelete}
        />
      </section>
    </RequireAuth>
  );
}
