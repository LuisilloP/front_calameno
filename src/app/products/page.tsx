"use client";

import * as React from "react";

import { RequireAuth } from "@/components/core/require-auth";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/components/ui/toast";
import { ProductForm } from "@/components/products/ProductForm";
import { ProductTable } from "@/components/products/ProductTable";
import { useProductStore } from "@/store/product.store";
import type { Product, ProductDto } from "@/types/product";

export default function ProductsPage() {
  const create = useProductStore((state) => state.create);
  const update = useProductStore((state) => state.update);
  const remove = useProductStore((state) => state.remove);

  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Product | null>(null);
  const [pendingDelete, setPendingDelete] = React.useState<Product | null>(null);

  const handleCreate = async (values: ProductDto) => {
    await create(values);
    toast.success("Producto creado");
    setOpen(false);
  };

  const handleUpdate = async (values: ProductDto) => {
    if (!editing) return;
    await update(editing.id, values);
    toast.success("Producto actualizado");
    setOpen(false);
    setEditing(null);
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;
    await remove(pendingDelete.id);
    toast.success("Producto eliminado");
    setPendingDelete(null);
  };

  const isEditMode = Boolean(editing);

  return (
    <RequireAuth>
      <section className="container-responsive py-10">
        <header className="mb-6 space-y-1">
          <h1 className="text-2xl font-semibold">Productos</h1>
          <p className="text-sm text-muted-foreground">
            Crea y administra productos con sus unidades de compra y vida util para integrarlos al ERP.
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
              <DialogTitle>{isEditMode ? "Editar producto" : "Nuevo producto"}</DialogTitle>
            </DialogHeader>
            <ProductForm
              defaultValues={editing ?? undefined}
              onSubmit={isEditMode ? handleUpdate : handleCreate}
              submitLabel={isEditMode ? "Actualizar" : "Crear"}
            />
          </DialogContent>
        </Dialog>

        <ProductTable
          onCreate={() => {
            setEditing(null);
            setOpen(true);
          }}
          onEdit={(product) => {
            setEditing(product);
            setOpen(true);
          }}
          onDelete={(product) => setPendingDelete(product)}
        />

        <ConfirmDialog
          open={Boolean(pendingDelete)}
          onOpenChange={(value) => {
            if (!value) {
              setPendingDelete(null);
            }
          }}
          title="Eliminar producto?"
          description={pendingDelete ? `Se eliminara "${pendingDelete.name}". Esta accion no se puede deshacer.` : undefined}
          confirmLabel="Eliminar"
          onConfirm={handleDelete}
        />
      </section>
    </RequireAuth>
  );
}
