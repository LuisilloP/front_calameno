"use client";

import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AdminPageShell } from "@/modules/admin/components/AdminPageShell";
import {
  AdminToastProvider,
  useAdminToast,
} from "@/modules/admin/components/AdminToastProvider";
import { AdminConfirmDialog } from "@/modules/admin/components/AdminConfirmDialog";
import { EntityFormValues } from "@/modules/admin/components/AdminEntityFormModal";
import { MarcasTable } from "../components/MarcasTable";
import { MarcasForm } from "../components/MarcasForm";
import {
  useMarcasList,
  useCreateMarca,
  useDeleteMarca,
  useUpdateMarca,
  Marca,
} from "../hooks";
import {
  buildListParams,
  DEFAULT_PAGE_SIZE,
} from "@/modules/admin/types";
import { handleBusinessError } from "@/modules/admin/utils/businessErrors";
import { sortByIdDesc } from "@/modules/admin/utils/sorting";

const useMarcasState = () => {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [search, setSearch] = useState("");
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selected, setSelected] = useState<Marca | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [banner, setBanner] = useState<string | null>(null);
  const [pendingToggle, setPendingToggle] = useState<Marca | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Marca | null>(null);

  const params = useMemo(
    () => buildListParams(pageIndex, pageSize),
    [pageIndex, pageSize]
  );

  const listQuery = useMarcasList(params);
  const filteredRows = useMemo(() => {
    const items = sortByIdDesc(listQuery.data?.items ?? []);
    if (!search) return items;
    const text = search.toLowerCase();
    return items.filter((row) =>
      row.nombre.toLowerCase().includes(text)
    );
  }, [listQuery.data, search]);

  return {
    pageIndex,
    setPageIndex,
    pageSize,
    setPageSize,
    search,
    setSearch,
    formMode,
    setFormMode,
    isFormOpen,
    setIsFormOpen,
    selected,
    setSelected,
    formError,
    setFormError,
    banner,
    setBanner,
    pendingToggle,
    setPendingToggle,
    pendingDelete,
    setPendingDelete,
    listQuery,
    filteredRows,
    total: listQuery.data?.total ?? 0,
  };
};

const MarcasPageContent = () => {
  const {
    pageIndex,
    setPageIndex,
    pageSize,
    setPageSize,
    search,
    setSearch,
    formMode,
    setFormMode,
    isFormOpen,
    setIsFormOpen,
    selected,
    setSelected,
    formError,
    setFormError,
    banner,
    setBanner,
    pendingToggle,
    setPendingToggle,
    pendingDelete,
    setPendingDelete,
    listQuery,
    filteredRows,
    total,
  } = useMarcasState();

  const { pushToast } = useAdminToast();
  const queryClient = useQueryClient();
  const createMutation = useCreateMarca();
  const updateMutation = useUpdateMarca();
  const deleteMutation = useDeleteMarca();

  const resetForm = () => {
    setSelected(null);
    setFormError(null);
    setBanner(null);
  };

  const handleError = (error: unknown) =>
    handleBusinessError(error, {
      duplicateMessage: "Ya existe una marca con ese nombre.",
      queryClient,
      queryKey: "marcas",
      pushToast,
      setFormError: (message) => setFormError(message),
      setBanner,
    });

  const handleSubmit = async (values: EntityFormValues) => {
    try {
      if (formMode === "create") {
        await createMutation.mutateAsync(values);
        pushToast({
          tone: "success",
          message: `Marca ${values.nombre} creada.`,
        });
      } else if (selected) {
        await updateMutation.mutateAsync({
          id: selected.id,
          payload: values,
        });
        pushToast({
          tone: "success",
          message: `Marca ${values.nombre} actualizada.`,
        });
      }

      setIsFormOpen(false);
      resetForm();
    } catch (error) {
      await handleError(error);
    }
  };

  const requestToggle = (item: Marca) => {
    if (item.activa) {
      setPendingToggle(item);
    } else {
      runToggle(item);
    }
  };

  const runToggle = async (item: Marca, close = false) => {
    try {
      await updateMutation.mutateAsync({
        id: item.id,
        payload: { activa: !item.activa },
      });
      pushToast({
        tone: item.activa ? "warning" : "success",
        message: item.activa
          ? `Marca ${item.nombre} desactivada.`
          : `Marca ${item.nombre} activada.`,
      });
      if (close) {
        setPendingToggle(null);
      }
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
        message: `Marca ${pendingDelete.nombre} eliminada.`,
      });
      setPendingDelete(null);
    } catch (error) {
      await handleError(error);
    }
  };

  return (
    <AdminPageShell
      title="Modulo de marcas"
      subtitle="Mantiene organizado el catalogo de productos."
      helper="CRUD con confirmaciones y toasts"
    >
      {banner && (
        <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          <div className="flex items-center justify-between">
            <span>{banner}</span>
            <button
              type="button"
              className="text-xs underline"
              onClick={() => setBanner(null)}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {listQuery.isError && (
        <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          <div className="flex items-center justify-between">
            <span>No se pudo cargar la tabla.</span>
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

      <MarcasTable
        data={filteredRows}
        total={total}
        pageIndex={pageIndex}
        pageSize={pageSize}
        searchValue={search}
        isLoading={listQuery.isLoading || listQuery.isFetching}
        onSearchChange={setSearch}
        onPageChange={(page) => setPageIndex(page)}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPageIndex(0);
        }}
        onCreateClick={() => {
          setFormMode("create");
          setIsFormOpen(true);
          resetForm();
        }}
        onEdit={(item) => {
          setSelected(item);
          setFormMode("edit");
          setIsFormOpen(true);
          setFormError(null);
        }}
        onToggleActive={requestToggle}
        onDelete={(item) => setPendingDelete(item)}
      />

      <MarcasForm
        isOpen={isFormOpen}
        mode={formMode}
        loading={
          formMode === "create"
            ? createMutation.isPending
            : updateMutation.isPending
        }
        errorMessage={formError}
        initialValues={
          formMode === "edit" && selected
            ? {
                nombre: selected.nombre,
                activa: selected.activa,
              }
            : undefined
        }
        onSubmit={handleSubmit}
        onClose={() => {
          setIsFormOpen(false);
          resetForm();
        }}
      />

      <AdminConfirmDialog
        isOpen={Boolean(pendingToggle)}
        title={`${
          pendingToggle?.activa ? "Desactivar" : "Activar"
        } marca`}
        description={
          pendingToggle?.activa
            ? "La marca no podra asignarse a nuevos productos."
            : "La marca vuelve a estar disponible."
        }
        confirmLabel={
          pendingToggle?.activa ? "Desactivar" : "Activar"
        }
        tone={pendingToggle?.activa ? "danger" : "default"}
        loading={updateMutation.isPending}
        onCancel={() => setPendingToggle(null)}
        onConfirm={() => pendingToggle && runToggle(pendingToggle, true)}
      />

      <AdminConfirmDialog
        isOpen={Boolean(pendingDelete)}
        title="Eliminar marca"
        description="Esta accion no se puede deshacer."
        confirmLabel="Eliminar"
        tone="danger"
        loading={deleteMutation.isPending}
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
      />
    </AdminPageShell>
  );
};

const MarcasPage = () => (
  <AdminToastProvider>
    <MarcasPageContent />
  </AdminToastProvider>
);

export default MarcasPage;
