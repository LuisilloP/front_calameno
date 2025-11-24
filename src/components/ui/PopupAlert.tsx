"use client";

import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

export type MovementAlertData = {
  tipo: "ingreso" | "uso"; // uso -> egreso visual
  producto: string;
  cantidad: number | string;
  unidad?: string;
  locacionDestino?: string; // ingreso o destino de uso
  locacionOrigen?: string; // bodega central en usos
  persona?: string;
  proveedor?: string;
  nota?: string;
  fechaIso?: string;
};

export type PopupAlertProps = {
  data: MovementAlertData;
  onClose: () => void;
  autoCloseMs?: number;
};

const fmtFecha = (iso?: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("es-AR", { dateStyle: "medium", timeStyle: "short" }).format(d);
};

export function PopupAlert({ data, onClose, autoCloseMs = 6000 }: PopupAlertProps) {
  const [rootEl] = React.useState<HTMLElement | null>(() => {
    if (typeof document === "undefined") return null;
    const existing = document.getElementById("popup-alert-root");
    if (existing) return existing;
    const created = document.createElement("div");
    created.id = "popup-alert-root";
    return created;
  });

  useEffect(() => {
    if (!rootEl) return;
    if (!rootEl.isConnected) {
      document.body.appendChild(rootEl);
    }
    return () => {
      if (rootEl.parentElement) {
        rootEl.parentElement.removeChild(rootEl);
      }
    };
  }, [rootEl]);

  useEffect(() => {
    const timer = window.setTimeout(onClose, autoCloseMs);
    return () => window.clearTimeout(timer);
  }, [onClose, autoCloseMs]);

  if (!rootEl) return null;

  const isIngreso = data.tipo === "ingreso";
  const heading = isIngreso
    ? "Producto ingresado correctamente"
    : "Producto egresado correctamente";
  const locacionLabel = isIngreso
    ? data.locacionDestino
    : data.locacionDestino ?? data.locacionOrigen;
  const locacionPrefix = isIngreso
    ? "Bodega destino"
    : data.locacionDestino
        ? "Consumido en"
        : "Bodega origen";

  const accentBorder = isIngreso
    ? "border-[hsla(var(--success)/0.6)]"
    : "border-[hsla(var(--danger)/0.6)]";
  const accentGlow = isIngreso
    ? "shadow-[0_10px_35px_rgba(34,197,94,0.2)]"
    : "shadow-[0_10px_35px_rgba(239,68,68,0.2)]";
  const headingColor = isIngreso
    ? "text-[hsl(var(--success))]"
    : "text-[hsl(var(--danger))]";
  const pillBg = isIngreso
    ? "bg-[hsla(var(--success)/0.15)] text-[hsl(var(--success))] border border-[hsla(var(--success)/0.5)]"
    : "bg-[hsla(var(--danger)/0.15)] text-[hsl(var(--danger))] border border-[hsla(var(--danger)/0.5)]";

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className={`relative w-full max-w-xl rounded-3xl border ${accentBorder} bg-[hsl(var(--surface))] p-7 text-[hsl(var(--foreground))] shadow-2xl ${accentGlow}`}
      >
        <button
          type="button"
          aria-label="Cerrar"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--surface-strong))] p-1.5 text-[hsl(var(--muted))] transition hover:border-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))]"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="mb-4 flex flex-col items-center gap-2 text-center">
          <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${pillBg}`}>
            {isIngreso ? "Ingreso" : "Egreso"}
          </span>
          <h2 className={`text-2xl font-semibold tracking-wide ${headingColor}`}>{heading}</h2>
        </div>
        <div className="space-y-3 text-sm text-center">
          <p className="text-lg font-semibold">
            {data.producto}
          </p>
          <p>
            <span className="font-semibold">Cantidad:</span> {data.cantidad}{" "}
            {data.unidad ? <span className="text-[hsl(var(--muted))]">({data.unidad})</span> : null}
          </p>
          {locacionLabel && (
            <p>
              <span className="font-semibold">{locacionPrefix}:</span> {locacionLabel}
            </p>
          )}
          {data.persona && (
            <p>
              <span className="font-semibold">Persona:</span> {data.persona}
            </p>
          )}
          {data.proveedor && (
            <p>
              <span className="font-semibold">Proveedor:</span> {data.proveedor}
            </p>
          )}
          {data.nota && (
            <p>
              <span className="font-semibold">Nota:</span> {data.nota}
            </p>
          )}
          {data.fechaIso && (
            <p className="text-xs text-[hsl(var(--muted))]">
              Registrado: {fmtFecha(data.fechaIso)}
            </p>
          )}
        </div>
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={onClose}
            className={`rounded-xl border px-5 py-2 text-sm font-semibold transition ${isIngreso ? "border-[hsl(var(--success))] bg-[hsla(var(--success)/0.12)] hover:bg-[hsla(var(--success)/0.2)]" : "border-[hsl(var(--danger))] bg-[hsla(var(--danger)/0.12)] hover:bg-[hsla(var(--danger)/0.2)]"}`}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>,
    rootEl
  );
}
