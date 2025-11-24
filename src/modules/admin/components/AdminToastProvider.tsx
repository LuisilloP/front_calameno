"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
} from "lucide-react";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

type ToastTone = "success" | "error" | "warning" | "info";

export type AdminToast = {
  id?: string;
  title?: string;
  message: string;
  tone?: ToastTone;
  duration?: number;
};

type AdminToastContextValue = {
  pushToast: (toast: AdminToast) => void;
  dismissToast: (id: string) => void;
};

const AdminToastContext = createContext<
  AdminToastContextValue | undefined
>(undefined);

const icons = {
  success: <CheckCircle2 className="h-5 w-5" />,
  error: <AlertTriangle className="h-5 w-5" />,
  warning: <AlertTriangle className="h-5 w-5" />,
  info: <Info className="h-5 w-5" />,
};

const toneClasses = {
  success:
    "border-[hsla(var(--success)/0.5)] text-[hsl(var(--success))] bg-[hsla(var(--success)/0.12)]",
  error:
    "border-[hsla(var(--danger)/0.55)] text-[hsl(var(--danger))] bg-[hsla(var(--danger)/0.12)]",
  warning:
    "border-[hsla(var(--accent)/0.5)] text-[hsl(var(--accent))] bg-[hsla(var(--accent)/0.12)]",
  info:
    "border-[hsla(var(--info)/0.5)] text-[hsl(var(--info))] bg-[hsla(var(--info)/0.12)]",
};

export const AdminToastProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [toasts, setToasts] = useState<AdminToast[]>([]);
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>(
    {}
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
    const timeout = timers.current[id];
    if (timeout) {
      clearTimeout(timeout);
      delete timers.current[id];
    }
  }, []);

  const pushToast = useCallback(
    (toast: AdminToast) => {
      const fallbackId = Math.random().toString(36).slice(2);
      const id =
        toast.id ??
        (typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : fallbackId);
      setToasts((current) => [...current, { ...toast, id }]);
      const timeout = setTimeout(
        () => dismissToast(id),
        toast.duration ?? 4000
      );
      timers.current[id] = timeout;
    },
    [dismissToast]
  );

  const value = useMemo(
    () => ({
      pushToast,
      dismissToast,
    }),
    [dismissToast, pushToast]
  );

  return (
    <AdminToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-6 top-6 z-50 space-y-3">
        {toasts.map((toast) => {
          const tone = toast.tone ?? "info";
          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex max-w-xs items-start gap-3 rounded-2xl border px-4 py-3 shadow-xl shadow-black/15 ${toneClasses[tone]}`}
            >
              <div className="mt-0.5 text-[hsl(var(--foreground))]">
                {icons[tone] ?? icons.info}
              </div>
              <div className="flex-1 text-sm">
                {toast.title && (
                  <p className="font-semibold text-[hsl(var(--foreground))]">
                    {toast.title}
                  </p>
                )}
                <p className="text-[hsl(var(--foreground))]">{toast.message}</p>
              </div>
              <button
                type="button"
                onClick={() => toast.id && dismissToast(toast.id)}
                className="text-[hsl(var(--muted))] transition hover:text-[hsl(var(--foreground))]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </AdminToastContext.Provider>
  );
};

export const useAdminToast = () => {
  const context = useContext(AdminToastContext);
  if (!context) {
    throw new Error(
      "useAdminToast debe usarse dentro de un AdminToastProvider"
    );
  }
  return context;
};
