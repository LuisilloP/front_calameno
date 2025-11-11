"use client";

import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AdminPageShell } from "@/modules/admin/components/AdminPageShell";
import { AdminToastProvider } from "@/modules/admin/components/AdminToastProvider";
import { useAdminToast } from "@/modules/admin/components/AdminToastProvider";
import { AdminConfirmDialog } from "@/modules/admin/components/AdminConfirmDialog";
import { EntityFormValues } from "@/modules/admin/components/AdminEntityFormModal";
import { LocacionesTable } from "../components/LocacionesTable";
import { LocacionesForm } from "../components/LocacionesForm";
import {
  useCreateLocacion,
  useLocacionesList,
  useToggleLocacion,
  useUpdateLocacion,
  Locacion,
} from "../hooks";
import {
  buildListParams,
  DEFAULT_PAGE_SIZE,
} from "@/modules/admin/types";
import { handleBusinessError } from "@/modules/admin/utils/businessErrors";

const useLocacionesPageLogic = () => {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [search, setSearch] = useState("");
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selected, setSelected] = useState<Locacion | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [banner, setBanner] = useState<string | null>(null);
  const [pendingToggle, setPendingToggle] = useState<Locacion | null>(null);

  const params = useMemo(
    () => buildListParams(pageIndex, pageSize),
    [pageIndex, pageSize]
  );

  const listQuery = useLocacionesList(params);
  const filteredRows = useMemo(() => {
    const items = listQuery.data?.items ?? [];
    if (!search) return items;
    const text = search.toLowerCase();
    return items.filter((row) =>
      row.nombre.toLowerCase().includes(text)
    );
  }, [listQuery.data, search]);

  return {
    pageIndex,
    pageSize,
    setPageIndex,
    setPageSize,
    search,
    setSearch,
    isFormOpen,
    setIsFormOpen,
    formMode,
    setFormMode,
    selected,
    setSelected,
    formError,
    setFormError,
    banner,
    setBanner,
    pendingToggle,
    setPendingToggle,
    listQuery,
    filteredRows,
    total: listQuery.data?.total ?? 0,
  };
};

const LocacionesPageContent = () => {
  const {
    pageIndex,
    pageSize,
    setPageIndex,
    setPageSize,
    search,
    setSearch,
    isFormOpen,
    setIsFormOpen,
    formMode,
    setFormMode,
    selected,
    setSelected,
    formError,
    setFormError,
    banner,
    setBanner,
    pendingToggle,
    setPendingToggle,
    listQuery,
    filteredRows,
    total,
  } = useLocacionesPageLogic();

  const { pushToast } = useAdminToast();
  const queryClient = useQueryClient();
  const createMutation = useCreateLocacion();
  const updateMutation = useUpdateLocacion();
  const toggleMutation = useToggleLocacion();

  const resetFormState = () => {
    setSelected(null);
    setFormError(null);
    setBanner(null);
  };

  const openCreate = () => {
    setFormMode("create");
    setIsFormOpen(true);
    resetFormState();
  };

  const openEdit = (item: Locacion) => {
    setFormMode("edit");
    setSelected(item);
    setIsFormOpen(true);
    setFormError(null);
    setBanner(null);
  };

  const handleSubmit = async (values: EntityFormValues) => {
    try {
      if (formMode === "create") {
        await createMutation.mutateAsync(values);
        pushToast({
          tone: "success",
          message: `Locacion ${values.nombre} creada.`,
        });
      } else if (selected) {
        await updateMutation.mutateAsync({
          id: selected.id,
          payload: values,
        });
        pushToast({
          tone: "success",
          message: `Locacion ${values.nombre} actualizada.`,
        });
      }

      setIsFormOpen(false);
      resetFormState();
    } catch (error) {
      await handleBusinessError(error, {
        duplicateMessage: "Ya existe una locacion con ese nombre.",
        queryClient,
        queryKey: "locaciones",
        pushToast,
        setFormError: (message) => setFormError(message),
        setBanner,
      });
    }
  };

  const requestToggle = (item: Locacion) => {
    if (item.activa) {
      setPendingToggle(item);
    } else {
      runToggle(item, false);
    }
  };

  const runToggle = async (
    item: Locacion,
    closingModal = false
  ) => {
    try {
      await toggleMutation.mutateAsync({
        id: item.id,
        activa: !item.activa,
      });
      pushToast({
        tone: item.activa ? "warning" : "success",
        message: item.activa
          ? `Locacion ${item.nombre} desactivada.`
          : `Locacion ${item.nombre} activada.`,
      });
      if (closingModal) {
        setPendingToggle(null);
      }
    } catch (error) {
      await handleBusinessError(error, {
        duplicateMessage: "Ya existe una locacion con ese nombre.",
        queryClient,
        queryKey: "locaciones",
        pushToast,
        setFormError: (message) => setFormError(message),
        setBanner,
      });
    }
  };

  return (
    <AdminPageShell
      title="Modulo de locaciones"
      subtitle="Gestiona bodegas y areas disponibles para movimientos."
      helper="CRUD completo con cache React Query"
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

      <LocacionesTable
        data={filteredRows}
        total={total}
        pageIndex={pageIndex}
        pageSize={pageSize}
        searchValue={search}
        isLoading={listQuery.isLoading || listQuery.isFetching}
        onSearchChange={setSearch}
        onPageChange={(next) => setPageIndex(next)}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPageIndex(0);
        }}
        onCreateClick={openCreate}
        onEdit={openEdit}
        onToggleActive={requestToggle}
      />

      <LocacionesForm
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
          resetFormState();
        }}
      />

      <AdminConfirmDialog
        isOpen={Boolean(pendingToggle)}
        title={`${
          pendingToggle?.activa ? "Desactivar" : "Activar"
        } locacion`}
        description={
          pendingToggle?.activa
            ? "Esta locacion ya no estara disponible para movimientos."
            : "La locacion volvera a estar disponible."
        }
        confirmLabel={
          pendingToggle?.activa ? "Desactivar" : "Activar"
        }
        tone={pendingToggle?.activa ? "danger" : "default"}
        loading={toggleMutation.isPending}
        onCancel={() => setPendingToggle(null)}
        onConfirm={() => {
          if (pendingToggle) {
            runToggle(pendingToggle, true);
          }
        }}
      />
    </AdminPageShell>
  );
};

const LocacionesPage = () => (
  <AdminToastProvider>
    <LocacionesPageContent />
  </AdminToastProvider>
);

export default LocacionesPage;
