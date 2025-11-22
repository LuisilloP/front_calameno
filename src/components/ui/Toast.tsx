"use client";

import React from "react";
import { createPortal } from "react-dom";

type ToastVariant = "success" | "error" | "info";

export type ToastOptions = {
  id?: string;
  title?: string;
  message: string;
  variant?: ToastVariant;
  durationMs?: number;
};

type ToastItem = Required<ToastOptions>;

type ToastContextType = {
  show: (options: ToastOptions) => void;
  success: (message: string, opts?: Omit<ToastOptions, "message" | "variant">) => void;
  error: (message: string, opts?: Omit<ToastOptions, "message" | "variant">) => void;
  info: (message: string, opts?: Omit<ToastOptions, "message" | "variant">) => void;
};

const ToastContext = React.createContext<ToastContextType | undefined>(
  undefined
);

const variantTokens: Record<ToastVariant, string> = {
  success:
    "border-[hsla(var(--success)/0.55)] bg-[hsla(var(--success)/0.12)] text-[hsl(var(--success))]",
  error:
    "border-[hsla(var(--danger)/0.55)] bg-[hsla(var(--danger)/0.12)] text-[hsl(var(--danger))]",
  info:
    "border-[hsla(var(--info)/0.5)] bg-[hsla(var(--info)/0.12)] text-[hsl(var(--info))]",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);
  const containerRef = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    let el = document.getElementById("toast-root");
    if (!el) {
      el = document.createElement("div");
      el.id = "toast-root";
      document.body.appendChild(el);
    }
    containerRef.current = el;
  }, []);

  const remove = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = React.useCallback(
    (options: ToastOptions) => {
      const id = options.id ?? Math.random().toString(36).slice(2);
      const variant: ToastVariant = options.variant ?? "info";
      const duration = options.durationMs ?? 3500;
      const item: ToastItem = {
        id,
        title: options.title ?? "",
        message: options.message,
        variant,
        durationMs: duration,
      };
      setToasts((prev) => [...prev, item]);
      window.setTimeout(() => remove(id), duration);
    },
    [remove]
  );

  const success = React.useCallback<ToastContextType["success"]>(
    (message, opts) => show({ ...(opts ?? {}), message, variant: "success" }),
    [show]
  );
  const error = React.useCallback<ToastContextType["error"]>(
    (message, opts) => show({ ...(opts ?? {}), message, variant: "error" }),
    [show]
  );
  const info = React.useCallback<ToastContextType["info"]>(
    (message, opts) => show({ ...(opts ?? {}), message, variant: "info" }),
    [show]
  );

  const contextValue = React.useMemo<ToastContextType>(
    () => ({ show, success, error, info }),
    [show, success, error, info]
  );

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {containerRef.current
        ? createPortal(
            <div className="pointer-events-none fixed inset-0 z-1000 flex flex-col items-end gap-2 p-4 sm:p-6">
              <div className="ml-auto w-full max-w-sm space-y-2">
                {toasts.map((t) => (
                  <div
                    key={t.id}
                    className={`pointer-events-auto flex items-start gap-3 rounded-2xl border px-4 py-3 shadow-xl backdrop-blur-sm ${variantTokens[t.variant]}`}
                    role="status"
                    aria-live="polite"
                  >
                    <div className="flex-1">
                      {t.title ? (
                        <div className="text-xs font-semibold tracking-wide">
                          {t.title}
                        </div>
                      ) : null}
                      <div className="text-sm">{t.message}</div>
                    </div>
                    <button
                      type="button"
                      aria-label="Cerrar notificación"
                      className="rounded-md px-2 py-1 text-xs text-current/70 transition hover:bg-[hsla(var(--foreground)/0.08)] hover:text-current"
                      onClick={() => remove(t.id)}
                    >
                      Cerrar
                    </button>
                  </div>
                ))}
              </div>
            </div>,
            containerRef.current
          )
        : null}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
}
