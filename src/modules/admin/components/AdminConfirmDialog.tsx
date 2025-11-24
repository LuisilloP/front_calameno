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
          className="rounded-full border border-[hsl(var(--border))] px-4 py-2 text-sm text-[hsl(var(--foreground))] transition hover:border-[hsl(var(--accent))]"
          onClick={onCancel}
          disabled={loading}
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white ${
            tone === "danger"
              ? "bg-[hsl(var(--danger))] hover:bg-[hsla(var(--danger)/0.9)]"
              : "bg-[hsl(var(--accent))] hover:bg-[hsla(var(--accent)/0.9)]"
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
