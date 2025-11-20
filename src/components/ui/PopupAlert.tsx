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
  const [rootEl, setRootEl] = React.useState<HTMLElement | null>(null);

  useEffect(() => {
    let el = document.getElementById("popup-alert-root");
    if (!el) {
      el = document.createElement("div");
      el.id = "popup-alert-root";
      document.body.appendChild(el);
    }
    setRootEl(el);
  }, []);

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
    ? "border-emerald-500/60"
    : "border-red-500/60";
  const accentGlow = isIngreso
    ? "shadow-emerald-500/30"
    : "shadow-red-500/30";
  const headingColor = isIngreso ? "text-emerald-300" : "text-red-300";
  const pillBg = isIngreso
    ? "bg-emerald-500/10 text-emerald-200 border border-emerald-500/40"
    : "bg-red-500/10 text-red-200 border border-red-500/40";

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-sm" />
      <div
        className={`relative w-full max-w-xl rounded-3xl border ${accentBorder} bg-slate-900/90 p-7 shadow-2xl ${accentGlow} text-slate-100`}
      >
        <button
          type="button"
          aria-label="Cerrar"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full border border-slate-700/60 bg-slate-800/60 p-1.5 text-slate-300 transition hover:border-slate-500 hover:text-white"
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
            {data.unidad ? <span className="text-slate-300">({data.unidad})</span> : null}
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
            <p className="text-xs text-slate-400">
              Registrado: {fmtFecha(data.fechaIso)}
            </p>
          )}
        </div>
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={onClose}
            className={`rounded-xl border px-5 py-2 text-sm font-semibold transition ${isIngreso ? "border-emerald-500/50 bg-emerald-600/20 hover:border-emerald-400 hover:bg-emerald-600/30" : "border-red-500/50 bg-red-600/20 hover:border-red-400 hover:bg-red-600/30"}`}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>,
    rootEl
  );
}