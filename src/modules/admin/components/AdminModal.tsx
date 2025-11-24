"use client";

import { ReactNode, useEffect } from "react";
import { X } from "lucide-react";

type AdminModalProps = {
  title: string;
  description?: string;
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  widthClassName?: string;
};

export const AdminModal = ({
  title,
  description,
  isOpen,
  onClose,
  children,
  footer,
  widthClassName = "max-w-lg",
}: AdminModalProps) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={`relative mx-4 w-full ${widthClassName} rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-6 shadow-2xl shadow-black/20`}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-[hsl(var(--muted))]">
              Admin
            </p>
            <h3 className="mt-1 text-xl font-semibold text-[hsl(var(--foreground))]">
              {title}
            </h3>
            {description && (
              <p className="mt-1 text-sm text-[hsl(var(--muted))]">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-[hsl(var(--border))] p-1 text-[hsl(var(--muted))] transition hover:border-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))]"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-6">{children}</div>
        {footer && <div className="mt-6">{footer}</div>}
      </div>
    </div>
  );
};
