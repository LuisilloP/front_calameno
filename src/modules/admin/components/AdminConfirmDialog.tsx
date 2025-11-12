"use client";

import { Loader2 } from "lucide-react";
import { AdminModal } from "./AdminModal";

type AdminConfirmDialogProps = {
  isOpen: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  tone?: "danger" | "default";
  onConfirm: () => void;
  onCancel: () => void;
};

export const AdminConfirmDialog = ({
  isOpen,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  loading,
  tone = "default",
  onConfirm,
  onCancel,
}: AdminConfirmDialogProps) => {
  return (
    <AdminModal
      title={title}
      description={description}
      isOpen={isOpen}
      onClose={loading ? () => undefined : onCancel}
    >
      <div className="flex justify-end gap-3">
        <button
          type="button"
          className="rounded-full border border-slate-700/80 px-4 py-2 text-sm text-slate-200 hover:border-slate-500"
          onClick={onCancel}
          disabled={loading}
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white ${
            tone === "danger"
              ? "bg-rose-600/90 hover:bg-rose-600"
              : "bg-emerald-500/80 hover:bg-emerald-500"
          }`}
          onClick={onConfirm}
          disabled={loading}
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {confirmLabel}
        </button>
      </div>
    </AdminModal>
  );
};
