"use client";

import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AdminPageShell } from "@/modules/admin/components/AdminPageShell";
import {
  AdminToastProvider,
  useAdminToast,
} from "@/modules/admin/components/AdminToastProvider";
import { AdminConfirmDialog } from "@/modules/admin/components/AdminConfirmDialog";
import { ProductoTable } from "../components/ProductoTable";
import { ProductoForm } from "../components/ProductoForm";
import { ProductoFilters } from "../components/ProductoFilters";
import {
  useCatalogoCategorias,
  useCatalogoMarcas,
  useCatalogoUoms,
  useCreateProducto,
  useDeleteProducto,
  useProductosList,
  useToggleProducto,
  useUpdateProducto,
  Producto,
} from "../hooks";
import { ProductoFormState } from "../types";
import {
  buildListParams,
  DEFAULT_PAGE_SIZE,
} from "@/modules/admin/types";
import { normalizeApiError } from "@/modules/admin/api/client";

const INITIAL_LIMIT = DEFAULT_PAGE_SIZE;

const ProductosPageContent = () => {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(INITIAL_LIMIT);
  const [searchValue, setSearchValue] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [selectedProducto, setSelectedProducto] = useState<Producto | null>(
    null
  );
  const [pendingDelete, setPendingDelete] = useState<Producto | null>(null);
  const [bannerMessage, setBannerMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const params = useMemo(
    () => buildListParams(pageIndex, pageSize),
    [pageIndex, pageSize]
  );

  const listQuery = useProductosList(params);
  const { data: uomsData } = useCatalogoUoms();
  const { data: marcasData } = useCatalogoMarcas();
  const { data: categoriasData } = useCatalogoCategorias();

  const catalogs = {
    uoms: uomsData ?? [],
    marcas: marcasData ?? [],
    categorias: categoriasData ?? [],
  };

  const filteredRows = useMemo(() => {
    const items = listQuery.data?.items ?? [];
    if (!searchValue.trim()) return items;
    const term = searchValue.toLowerCase();
    return items.filter(
      (item) =>
        item.nombre.toLowerCase().includes(term) ||
        item.sku?.toLowerCase().includes(term)
    );
  }, [listQuery.data, searchValue]);

  const total = listQuery.data?.total ?? 0;
  const queryClient = useQueryClient();
  const { pushToast } = useAdminToast();

  const createMutation = useCreateProducto();
  const updateMutation = useUpdateProducto();
  const deleteMutation = useDeleteProducto();
  const toggleMutation = useToggleProducto();

  const resetFormState = () => {
    setSelectedProducto(null);
    setFormError(null);
    setBannerMessage(null);
  };

  const openCreateModal = () => {
    setFormMode("create");
    setIsFormOpen(true);
    resetFormState();
  };

  const openEditModal = (producto: Producto) => {
    setFormMode("edit");
    setSelectedProducto(producto);
    setIsFormOpen(true);
    setFormError(null);
  };

  const handleError = async (error: unknown) => {
    const parsed = normalizeApiError(error);
    const code = parsed.code ?? "";
    if (code === "producto_sku_duplicate") {
      const message = "SKU ya registrado. Verifica un identificador único.";
      setFormError(message);
      pushToast({ tone: "warning", message });
      return;
    }
    if (code.endsWith("_not_found")) {
      pushToast({
        tone: "info",
        message: parsed.message ?? "El registro ya no existe. Refrescamos la tabla.",
      });
      await queryClient.invalidateQueries({ queryKey: ["productos"] });
      return;
    }
    const message =
      parsed.message || "No se pudo completar la operación. Intenta nuevamente.";
    setBannerMessage(message);
    pushToast({ tone: "error", message });
  };

  const handleSubmit = async (values: ProductoFormState) => {
    const payload = {
      nombre: values.nombre,
      sku: values.sku ? values.sku.toUpperCase() : undefined,
      activo: values.activo,
      uom_id: values.uom_id!,
      marca_id: values.marca_id ?? undefined,
      categoria_id: values.categoria_id ?? undefined,
    };

    try {
      if (formMode === "create") {
        await createMutation.mutateAsync(payload);
        pushToast({
          tone: "success",
          message: `Producto ${values.nombre} creado.`,
        });
      } else if (selectedProducto) {
        await updateMutation.mutateAsync({
          id: selectedProducto.id,
          payload,
        });
        pushToast({
          tone: "success",
          message: `Producto ${values.nombre} actualizado.`,
        });
      }
      setIsFormOpen(false);
      resetFormState();
    } catch (error) {
      await handleError(error);
    }
  };

  const handleToggle = async (producto: Producto) => {
    try {
      await toggleMutation.mutateAsync({
        id: producto.id,
        activo: !producto.activo,
      });
      pushToast({
        tone: producto.activo ? "warning" : "success",
        message: producto.activo
          ? `${producto.nombre} se desactivó.`
          : `${producto.nombre} ahora está activo.`,
      });
    } catch (error) {
      await handleError(error);
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteMutation.mutateAsync(pendingDelete.id);
      pushToast({
        tone: "warning",
        message: `${pendingDelete.nombre} eliminado.`,
      });
      setPendingDelete(null);
    } catch (error) {
      await handleError(error);
    }
  };

  const currentInitialValues = useMemo(() => {
    if (!selectedProducto) return undefined;
    return {
      nombre: selectedProducto.nombre,
      sku: selectedProducto.sku ?? "",
      activo: selectedProducto.activo,
      uom_id: selectedProducto.uom_id,
      marca_id: selectedProducto.marca_id ?? undefined,
      categoria_id: selectedProducto.categoria_id ?? undefined,
    };
  }, [selectedProducto]);

  return (
    <AdminPageShell
      title="Gestión de productos"
      subtitle="Administra el catálogo y sincroniza referencias con marcas, categorías y unidades."
      helper="CRUD completo con React Query"
    >
      {bannerMessage && (
        <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          <div className="flex items-center justify-between">
            <span>{bannerMessage}</span>
            <button
              type="button"
              className="text-xs underline"
              onClick={() => setBannerMessage(null)}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {listQuery.isError && (
        <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          <div className="flex items-center justify-between">
            <span>No se pudo cargar la tabla. Reintenta.</span>
            <button
              type="button"
              className="text-xs underline"
              onClick={() => listQuery.refetch()}
            >
              Reintentar
            </button>
          </div>
        </div>
      )}

      <ProductoFilters
        searchValue={searchValue}
        onSearchChange={(value) => {
          setSearchValue(value);
          setPageIndex(0);
        }}
      />

      <ProductoTable
        data={filteredRows}
        total={total}
        pageIndex={pageIndex}
        pageSize={pageSize}
        searchValue={searchValue}
        isLoading={listQuery.isLoading || listQuery.isFetching}
        catalogs={catalogs}
        onSearchChange={setSearchValue}
        onPageChange={(page) => setPageIndex(page)}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPageIndex(0);
        }}
        onCreate={openCreateModal}
        onEdit={openEditModal}
        onToggleActive={handleToggle}
        onDelete={(producto) => setPendingDelete(producto)}
      />

      <ProductoForm
        isOpen={isFormOpen}
        mode={formMode}
        catalogs={catalogs}
        initialValues={currentInitialValues}
        loading={
          formMode === "create"
            ? createMutation.isPending
            : updateMutation.isPending
        }
        errorMessage={formError}
        onSubmit={handleSubmit}
        onClose={() => {
          setIsFormOpen(false);
          resetFormState();
        }}
      />

      <AdminConfirmDialog
        isOpen={Boolean(pendingDelete)}
        title="Eliminar producto"
        description="Esta acción eliminará definitivamente el producto del catálogo."
        confirmLabel="Eliminar"
        tone="danger"
        loading={deleteMutation.isPending}
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
      />
    </AdminPageShell>
  );
};

const ProductosPage = () => (
  <AdminToastProvider>
    <ProductosPageContent />
  </AdminToastProvider>
);

export default ProductosPage;
