"use client";

import React, { JSX } from "react";

type ConfirmModalProps = {
  isOpen: boolean;
  title?: string;
  message?: string | JSX.Element;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmModal({
  isOpen,
  title = "Confirmar",
  message = "¿Estás seguro?",
  confirmLabel = "Sí",
  cancelLabel = "Cancelar",
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black opacity-40"
        onClick={onCancel}
      />

      <div className="relative w-full max-w-md mx-4 bg-card rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-2 text-card-foreground">
          {title}
        </h3>
        <div className="text-sm text-muted-foreground mb-4">{message}</div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            className="px-3 py-2 rounded bg-secondary text-secondary-foreground hover:bg-secondary/80"
            onClick={onCancel}
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            className="px-3 py-2 rounded bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
