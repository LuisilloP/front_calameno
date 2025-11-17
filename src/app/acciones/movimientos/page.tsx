"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, Loader2, RefreshCcw } from "lucide-react";
import {
  MOVEMENT_TYPE_DEFINITIONS,
  MovementFormErrors,
  MovementFormState,
  buildMovimientoPayload,
  resolveMovementRules,
  validateMovementForm,
} from "@/lib/movements/form";
import { useCatalogResource } from "@/hooks/useCatalogResource";
import {
  ApiErrorDetail,
  MovementType,
  MovimientoOut,
  ProductoCatalogItem,
  movementsApi,
} from "@/services/movementsApi";
import { PopupAlert, MovementAlertData } from "@/components/ui/PopupAlert";

type CatalogOption = {
  id: number;
  label: string;
  caption?: string;
  meta?: string;
};

type CatalogAutocompleteProps = {
  label: string;
  placeholder: string;
  options?: CatalogOption[];
  status: "idle" | "loading" | "ready" | "error";
  value?: number;
  onChange: (value?: number) => void;
  disabled?: boolean;
  error?: string;
  helperText?: string;
  onRetry?: () => void;
};

const cn = (...classes: Array<string | undefined | null | false>) =>
  classes.filter(Boolean).join(" ");

const formatUom = (producto?: ProductoCatalogItem) => {
  if (!producto) return "";
  return (
    producto.uom?.abreviatura ||
    producto.uom?.nombre ||
    producto.uom_abreviatura ||
    producto.uom_nombre ||
    (producto.uom_id ? `UOM ${producto.uom_id}` : "unidad")
  );
};

const formatMovementDate = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const CatalogAutocomplete = ({
  label,
  placeholder,
  options,
  status,
  value,
  onChange,
  disabled,
  error,
  helperText,
  onRetry,
}: CatalogAutocompleteProps) => {
  const selected = options?.find((opt) => opt.id === value);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
        setIsTyping(false);
        if (selected) {
          setQuery(selected.label);
        }
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [selected]);

  const filtered =
    options?.filter((opt) => {
      if (!query) return true;
      const haystack = `${opt.label} ${opt.caption ?? ""} ${
        opt.meta ?? ""
      }`.toLowerCase();
      return haystack.includes(query.toLowerCase());
    }) ?? [];

  return (
    <div className="relative space-y-1" ref={containerRef}>
      <label className="text-sm font-semibold text-slate-200">{label}</label>
      <div
        className={cn(
          "rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-2 focus-within:border-slate-300",
          disabled && "opacity-60 pointer-events-none",
          error && "border-red-500/70"
        )}
        onClick={() => {
          if (!disabled) setOpen(true);
        }}
      >
        <div className="flex items-center gap-2">
          <input
            className="w-full bg-transparent text-sm text-slate-50 placeholder:text-slate-500 focus:outline-none"
            placeholder={placeholder}
            value={isTyping ? query : selected?.label ?? ""}
            disabled={disabled || status !== "ready"}
            onFocus={() => setOpen(true)}
            onChange={(event) => {
              setIsTyping(true);
              setOpen(true);
              setQuery(event.target.value);
            }}
            onBlur={() => {
              setIsTyping(false);
              if (selected) {
                setQuery(selected.label);
              } else {
                setQuery("");
              }
            }}
          />
          {value && (
            <button
              type="button"
              className="text-xs text-slate-400 hover:text-slate-100"
              onClick={(event) => {
                event.stopPropagation();
                onChange(undefined);
                setQuery("");
                setIsTyping(false);
              }}
            >
              Limpiar
            </button>
          )}
        </div>
      </div>
      {helperText && (
        <p className="text-xs text-slate-400">{helperText}</p>
      )}
      {error && <p className="text-xs text-red-400">{error}</p>}

      {status === "loading" && (
        <p className="text-xs text-slate-400 flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Cargando catálogo...
        </p>
      )}

      {status === "error" && (
        <div className="text-xs text-amber-300 flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          <span>No se pudo cargar este catálogo.</span>
          {onRetry && (
            <button
              type="button"
              className="underline decoration-dotted underline-offset-2"
              onClick={(event) => {
                event.stopPropagation();
                onRetry();
              }}
            >
              Reintentar
            </button>
          )}
        </div>
      )}

      {status === "ready" && open && (
        <div className="absolute left-0 right-0 z-30 mt-1 max-h-64 overflow-y-auto rounded-xl border border-slate-800 bg-slate-900/95 shadow-2xl">
          {filtered.length === 0 ? (
            <div className="px-4 py-3 text-sm text-slate-400">
              Sin coincidencias
            </div>
          ) : (
            filtered.slice(0, 40).map((opt) => (
              <button
                type="button"
                key={opt.id}
                className={cn(
                  "flex w-full flex-col px-4 py-2 text-left text-sm hover:bg-slate-800/60",
                  value === opt.id && "bg-slate-800/80 text-slate-50"
                )}
                onClick={() => {
                  onChange(opt.id);
                  setQuery(opt.label);
                  setIsTyping(false);
                  setOpen(false);
                }}
              >
                <span className="font-semibold text-slate-100">
                  {opt.label}
                </span>
                {(opt.caption || opt.meta) && (
                  <span className="text-xs text-slate-400">
                    {[opt.caption, opt.meta].filter(Boolean).join(" · ")}
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

const initialFormState: MovementFormState = {
  tipo: "ingreso",
  productoId: undefined,
  quantity: "",
  fromLocationId: undefined,
  toLocationId: undefined,
  personaId: undefined,
  proveedorId: undefined,
  nota: "",
  confirmUnit: false,
};

const movementTypeBadge: Record<MovementType, string> = {
  ingreso: "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30",
  uso: "bg-sky-500/10 text-sky-300 border border-sky-500/30",
  traspaso: "bg-indigo-500/10 text-indigo-300 border border-indigo-500/30",
  ajuste: "bg-amber-500/10 text-amber-300 border border-amber-500/30",
};

const movementTypeAccent: Record<MovementType, string> = {
  ingreso:
    "border-emerald-400/80 bg-emerald-500/10 hover:border-emerald-300 text-emerald-100",
  uso: "border-sky-400/80 bg-sky-500/10 hover:border-sky-300 text-sky-100",
  traspaso:
    "border-indigo-400/80 bg-indigo-500/10 hover:border-indigo-300 text-indigo-100",
  ajuste:
    "border-amber-400/80 bg-amber-500/10 hover:border-amber-300 text-amber-100",
};

const movementTypeHeadingColor: Record<MovementType, string> = {
  ingreso: "text-emerald-100",
  uso: "text-sky-100",
  traspaso: "text-indigo-100",
  ajuste: "text-amber-100",
};

const MovementRegistrationPage = () => {
  const productos = useCatalogResource("productos");
  const locaciones = useCatalogResource("locaciones");
  const personas = useCatalogResource("personas");
  const proveedores = useCatalogResource("proveedores");
  const uoms = useCatalogResource("uoms");

  const [form, setForm] = useState<MovementFormState>(initialFormState);
  const [errors, setErrors] = useState<MovementFormErrors>({});
  const [submitState, setSubmitState] = useState<
    "idle" | "validating" | "submitting" | "success" | "error"
  >("idle");
  const [apiError, setApiError] = useState<ApiErrorDetail | null>(null);
  const [lastMovement, setLastMovement] = useState<MovimientoOut | null>(null);
  const [hasTriedSubmit, setHasTriedSubmit] = useState(false);
  const [movementAlert, setMovementAlert] = useState<MovementAlertData | null>(null);

  const selectedProduct = useMemo(
    () => productos.data?.find((p) => p.id === form.productoId),
    [form.productoId, productos.data]
  );

  const unidadMap = useMemo(() => {
    const map = new Map<number, string>();
    uoms.data?.forEach((unidad) => {
      map.set(
        unidad.id,
        unidad.nombre.trim()
      );
    });
    return map;
  }, [uoms.data]);

  const productUnitLabel = useMemo(() => {
    if (!selectedProduct) return "";
    const inline = formatUom(selectedProduct);
    if (inline && !inline.startsWith("UOM ")) {
      return inline;
    }
    if (selectedProduct.uom_id) {
      const resolved = unidadMap.get(selectedProduct.uom_id);
      if (resolved) return resolved;
    }
    return inline;
  }, [selectedProduct, unidadMap]);

  const productoOptions = useMemo<CatalogOption[] | undefined>(() => {
    if (!productos.data) return undefined;
    return productos.data.map((producto) => ({
      id: producto.id,
      label: producto.nombre,
      caption: producto.sku ? `SKU ${producto.sku}` : undefined,
      meta: formatUom(producto),
    }));
  }, [productos.data]);

  const locacionOptions = useMemo<CatalogOption[] | undefined>(() => {
    if (!locaciones.data) return undefined;
    return locaciones.data.map((loc) => ({
      id: loc.id,
      label: loc.nombre,
      meta: loc.codigo ? `Código ${loc.codigo}` : undefined,
    }));
  }, [locaciones.data]);

  const locacionesById = useMemo(() => {
    const map = new Map<number, string>();
    locaciones.data?.forEach((loc) => map.set(loc.id, loc.nombre));
    return map;
  }, [locaciones.data]);

  const productosById = useMemo(() => {
    const map = new Map<number, string>();
    productos.data?.forEach((prod) => map.set(prod.id, prod.nombre));
    return map;
  }, [productos.data]);

  const personaOptions = useMemo<CatalogOption[] | undefined>(() => {
    if (!personas.data) return undefined;
    return personas.data.map((p) => ({
      id: p.id,
      label: `${p.nombre} ${p.apellidos ?? ""}`.trim(),
      meta: p.area ?? undefined,
    }));
  }, [personas.data]);

  const personasById = useMemo(() => {
    const map = new Map<number, string>();
    personas.data?.forEach((p) => map.set(p.id, `${p.nombre} ${p.apellidos ?? ""}`.trim()));
    return map;
  }, [personas.data]);

  const proveedorOptions = useMemo<CatalogOption[] | undefined>(() => {
    if (!proveedores.data) return undefined;
    return proveedores.data.map((p) => ({
      id: p.id,
      label: p.nombre,
      meta: p.razon_social ?? undefined,
    }));
  }, [proveedores.data]);

  const proveedoresById = useMemo(() => {
    const map = new Map<number, string>();
    proveedores.data?.forEach((pr) => map.set(pr.id, pr.nombre));
    return map;
  }, [proveedores.data]);

  // popup toasts are handled by ToastProvider via useToast

  const handleTipoChange = (tipo: MovementType) => {
    const rules = resolveMovementRules(tipo);
    setForm((current) => ({
      ...current,
      tipo,
      fromLocationId: rules.forbidFrom ? undefined : current.fromLocationId,
      toLocationId: rules.forbidTo ? undefined : current.toLocationId,
    }));
    setErrors((prev) => ({ ...prev, tipo: undefined, form: undefined }));
  };

  const handleSubmit = async (event?: React.FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    setHasTriedSubmit(true);
    setSubmitState("validating");
    setApiError(null);

    const validation = validateMovementForm(form);
    setErrors(validation.errors);

    if (!validation.isValid) {
      return;
    }

    setSubmitState("submitting");
    try {
      const payload = buildMovimientoPayload(form, validation.quantity);
      const movimiento = await movementsApi.createMovimiento(payload);
      setLastMovement(movimiento);
      setForm({ ...initialFormState });
      setErrors({});
      setSubmitState("success");
      // Build alert data
      if (movimiento.tipo === "ingreso" || movimiento.tipo === "uso") {
        const alert: MovementAlertData = {
          tipo: movimiento.tipo === "ingreso" ? "ingreso" : "uso",
          producto: productosById.get(movimiento.producto_id) ?? `ID ${movimiento.producto_id}`,
          cantidad: movimiento.cantidad,
          unidad: productUnitLabel || undefined,
          locacionDestino: movimiento.to_locacion_id
            ? locacionesById.get(movimiento.to_locacion_id) ?? `ID ${movimiento.to_locacion_id}`
            : undefined,
          locacionOrigen: movimiento.from_locacion_id
            ? locacionesById.get(movimiento.from_locacion_id) ?? `ID ${movimiento.from_locacion_id}`
            : undefined,
          persona: movimiento.persona_id
            ? personasById.get(movimiento.persona_id) ?? `ID ${movimiento.persona_id}`
            : undefined,
          proveedor: movimiento.proveedor_id
            ? proveedoresById.get(movimiento.proveedor_id) ?? `ID ${movimiento.proveedor_id}`
            : undefined,
          nota: movimiento.nota || undefined,
          fechaIso: movimiento.created_at,
        };
        setMovementAlert(alert);
      }
      setHasTriedSubmit(false);
    } catch (error) {
      const apiErr =
        typeof error === "object" && error && "status" in error
          ? (error as ApiErrorDetail)
          : null;
      setApiError(apiErr);
      setSubmitState("error");
    }
  };

  const showValidationBanner =
    hasTriedSubmit && submitState === "validating" && Object.keys(errors).length;

  const isSubmitting = submitState === "submitting";
  const rules = resolveMovementRules(form.tipo);

  return (
    <main className="min-h-screen bg-slate-950/95 p-6 text-slate-50">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="flex flex-col gap-2 rounded-3xl border border-slate-800 bg-slate-900/60 p-6 shadow-2xl shadow-slate-900/50">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
                Movimientos
              </p>
              <h1 className="text-3xl font-semibold text-slate-50">
                Registrar movimiento de inventario
              </h1>
              <p className="text-sm text-slate-400">
                Controla ingresos, usos, traspasos y ajustes desde una sola
                pantalla.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-slate-400">
              <StatusPill
                label="Productos"
                status={productos.status}
                onRetry={productos.reload}
              />
              <StatusPill
                label="Locaciones"
                status={locaciones.status}
                onRetry={locaciones.reload}
              />
              <StatusPill
                label="Personas"
                status={personas.status}
                onRetry={personas.reload}
              />
              <StatusPill
                label="Proveedores"
                status={proveedores.status}
                onRetry={proveedores.reload}
              />
              <StatusPill
                label="Unidades"
                status={uoms.status}
                onRetry={uoms.reload}
              />
            </div>
          </div>

          {/* Popup toast will appear on success; inline banner removed */}

          {showValidationBanner && (
            <div className="flex items-center gap-2 rounded-2xl border border-amber-500/40 bg-amber-500/10 px-4 py-2 text-sm text-amber-100">
              <AlertCircle className="h-4 w-4" />
              Revisa los campos marcados antes de enviar.
            </div>
          )}

          {submitState === "error" && (
            <div className="flex flex-col gap-2 rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-100">
              <div className="flex items-center gap-2 font-semibold">
                <AlertCircle className="h-4 w-4" />
                No pudimos registrar el movimiento.
              </div>
              {apiError?.errorDetail && (
                <p className="text-xs text-red-200">
                  Detalle: {apiError.errorDetail}
                </p>
              )}
              {apiError?.detail && (
                <p className="text-xs text-red-200">{apiError.detail}</p>
              )}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  className="text-xs font-semibold text-slate-50 underline decoration-dotted underline-offset-2"
                  onClick={() => handleSubmit()}
                >
                  Reintentar envío
                </button>
                {apiError?.status && (
                  <span className="text-[11px] text-slate-400">
                    Código {apiError.status}
                  </span>
                )}
              </div>
            </div>
          )}
        </header>

        {movementAlert && (
          <PopupAlert
            data={movementAlert}
            onClose={() => setMovementAlert(null)}
          />
        )}

        <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <form
            className="space-y-6 rounded-3xl border border-slate-800 bg-slate-900/60 p-6 shadow-2xl shadow-slate-900/50"
            onSubmit={handleSubmit}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              {MOVEMENT_TYPE_DEFINITIONS.map((tipo) => (
                <button
                  key={tipo.value}
                  type="button"
                  className={cn(
                    "rounded-2xl border px-4 py-3 text-left transition",
                    form.tipo === tipo.value
                      ? movementTypeAccent[tipo.value]
                      : "border-slate-800 bg-transparent text-slate-50 hover:border-slate-600"
                  )}
                  onClick={() => handleTipoChange(tipo.value)}
                >
                  <p
                    className={cn(
                      "text-sm font-semibold",
                      form.tipo === tipo.value
                        ? movementTypeHeadingColor[tipo.value]
                        : "text-slate-50"
                    )}
                  >
                    {tipo.label}
                  </p>
                  <p
                    className={cn(
                      "text-xs",
                      form.tipo === tipo.value
                        ? "text-white/70"
                        : "text-slate-400"
                    )}
                  >
                    {tipo.description}
                  </p>
                </button>
              ))}
            </div>

            <CatalogAutocomplete
              label="Producto"
              placeholder="Buscar por nombre o SKU"
              options={productoOptions}
              status={productos.status}
              value={form.productoId}
              error={errors.productoId}
              onChange={(value) =>
                setForm((current) => ({
                  ...current,
                  productoId: value,
                  confirmUnit: false,
                }))
              }
              helperText={
                productos.isEmpty
                  ? "No hay productos disponibles."
                  : "El catálogo se cachea hasta que recargues la página."
              }
              onRetry={productos.reload}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-200">
                  Cantidad
                </label>
                <div
                  className={cn(
                    "rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-3 focus-within:border-slate-400",
                    errors.quantity && "border-red-500/60"
                  )}
                >
                  <input
                    className="w-full bg-transparent text-lg font-semibold text-slate-50 placeholder:text-slate-500 focus:outline-none"
                    placeholder="0.000"
                    inputMode="decimal"
                    value={form.quantity}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        quantity: event.target.value,
                      }))
                    }
                  />
                </div>
                {errors.quantity && (
                  <p className="text-xs text-red-400">{errors.quantity}</p>
                )}
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                  Unidad
                </p>
                {selectedProduct ? (
                  <>
                    <p className="text-xl font-semibold text-slate-50">
                      {productUnitLabel ||
                        (uoms.status === "loading"
                          ? "Cargando unidad..."
                          : "Sin unidad registrada")}
                    </p>
                    <label className="mt-3 flex items-start gap-2 text-sm text-slate-300">
                      <input
                        type="checkbox"
                        className="mt-1 h-4 w-4 accent-slate-100"
                        checked={form.confirmUnit}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            confirmUnit: event.target.checked,
                          }))
                        }
                      />
                      Confirmo que registraré la cantidad en la unidad
                      mostrada.
                    </label>
                    {errors.confirmUnit && (
                      <p className="text-xs text-red-400">
                        {errors.confirmUnit}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-slate-400">
                    Selecciona un producto para mostrar la unidad asociada.
                  </p>
                )}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <CatalogAutocomplete
                label="Locación origen"
                placeholder="Buscar locación"
                options={locacionOptions}
                status={locaciones.status}
                value={form.fromLocationId}
                disabled={!rules.allowFrom}
                error={errors.fromLocationId}
                helperText={
                  rules.forbidFrom
                    ? "Los ingresos no requieren origen."
                    : undefined
                }
                onChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    fromLocationId: value,
                  }))
                }
                onRetry={locaciones.reload}
              />

              <CatalogAutocomplete
                label="Locación destino"
                placeholder="Buscar locación"
                options={locacionOptions}
                status={locaciones.status}
                value={form.toLocationId}
                disabled={!rules.allowTo}
                error={errors.toLocationId}
                helperText={
                  rules.forbidTo ? "Los usos no requieren destino." : undefined
                }
                onChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    toLocationId: value,
                  }))
                }
                onRetry={locaciones.reload}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <CatalogAutocomplete
                label="Persona (opcional)"
                placeholder="Asignar responsable"
                options={personaOptions}
                status={personas.status}
                value={form.personaId}
                onChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    personaId: value,
                  }))
                }
                helperText="Se usa para auditorías rápidas."
                onRetry={personas.reload}
              />
              <CatalogAutocomplete
                label="Proveedor (opcional)"
                placeholder="Buscar proveedor"
                options={proveedorOptions}
                status={proveedores.status}
                value={form.proveedorId}
                onChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    proveedorId: value,
                  }))
                }
                helperText="Útil para ingresos o ajustes extraordinarios."
                onRetry={proveedores.reload}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-200">
                Nota interna (opcional)
              </label>
              <textarea
                className="min-h-[100px] w-full rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-slate-400 focus:outline-none"
                placeholder="Ej: Ajuste por merma en cocina fría."
                value={form.nota}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    nota: event.target.value,
                  }))
                }
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                className={cn(
                  "flex items-center gap-2 rounded-2xl bg-slate-50 px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-white",
                  isSubmitting && "pointer-events-none opacity-80"
                )}
                disabled={isSubmitting}
              >
                {isSubmitting && (
                  <Loader2 className="h-4 w-4 animate-spin text-slate-900" />
                )}
                Registrar movimiento
              </button>
              <button
                type="button"
                className="text-sm text-slate-400 underline underline-offset-4"
                onClick={() => {
                  setForm({ ...initialFormState });
                  setErrors({});
                  setHasTriedSubmit(false);
                }}
              >
                Limpiar formulario
              </button>
              {submitState === "submitting" && (
                <span className="text-xs uppercase tracking-[0.3em] text-slate-500">
                  Enviando...
                </span>
              )}
            </div>
          </form>

          <aside className="space-y-4">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                Reglas vigentes
              </p>
              <ul className="mt-3 space-y-2 text-sm text-slate-300">
                {form.tipo === "ingreso" && (
                  <li>Requiere destino y bloquea origen.</li>
                )}
                {form.tipo === "uso" && (
                  <li>Requiere origen y bloquea destino.</li>
                )}
                {form.tipo === "traspaso" && (
                  <li>Necesita origen y destino distintos.</li>
                )}
                {form.tipo === "ajuste" && (
                  <li>Debe incluir al menos una locación.</li>
                )}
                <li>Siempre validamos cantidades positivas con 3 decimales.</li>
              </ul>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                Catálogos
              </p>
              <p className="mt-2 text-sm text-slate-300">
                Las listas se cachean en memoria. Puedes forzar una actualización
                con el botón{" "}
                <span className="mx-1 inline-flex items-center gap-1 rounded-full border border-slate-700 px-2 py-0.5 text-xs">
                  <RefreshCcw className="h-3 w-3" />
                  Recargar
                </span>{" "}
                en cada tarjeta.
              </p>
            </div>

            {lastMovement && (
              <div className="rounded-3xl border border-emerald-500/40 bg-emerald-500/10 p-5 text-sm text-emerald-100">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">
                    Último registro
                  </p>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-semibold capitalize",
                      movementTypeBadge[lastMovement.tipo]
                    )}
                  >
                    {lastMovement.tipo}
                  </span>
                </div>
                <p className="mt-2 text-lg font-semibold text-white">
                  #{lastMovement.id} ·{" "}
                  {formatMovementDate(lastMovement.created_at)}
                </p>
                <ul className="mt-2 space-y-1 text-xs text-emerald-200">
                  <li>
                    Producto:{" "}
                    {productosById.get(lastMovement.producto_id) ??
                      `ID ${lastMovement.producto_id}`}
                  </li>
                  <li>Cantidad: {lastMovement.cantidad}</li>
                  {lastMovement.from_locacion_id && (
                    <li>
                      Origen:{" "}
                      {locacionesById.get(lastMovement.from_locacion_id) ??
                        `ID ${lastMovement.from_locacion_id}`}
                    </li>
                  )}
                  {lastMovement.to_locacion_id && (
                    <li>
                      Destino:{" "}
                      {locacionesById.get(lastMovement.to_locacion_id) ??
                        `ID ${lastMovement.to_locacion_id}`}
                    </li>
                  )}
                  {lastMovement.persona_id && (
                    <li>Persona ID: {lastMovement.persona_id}</li>
                  )}
                  {lastMovement.proveedor_id && (
                    <li>Proveedor ID: {lastMovement.proveedor_id}</li>
                  )}
                  {lastMovement.nota && <li>Nota: {lastMovement.nota}</li>}
                </ul>
              </div>
            )}
          </aside>
        </section>
      </div>
    </main>
  );
};

const StatusPill = ({
  label,
  status,
  onRetry,
}: {
  label: string;
  status: "idle" | "loading" | "ready" | "error";
  onRetry?: () => void;
}) => {
  const content = {
    idle: { text: "Pendiente", color: "text-slate-400 border-slate-700/70" },
    loading: {
      text: "Cargando",
      color: "text-slate-200 border-slate-500/40",
      spinner: true,
    },
    ready: { text: "Listo", color: "text-emerald-300 border-emerald-500/50" },
    error: {
      text: "Error",
      color: "text-amber-300 border-amber-500/40",
      retry: true,
    },
  }[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[11px]",
        content.color
      )}
    >
      {content.spinner && <Loader2 className="h-3 w-3 animate-spin" />}
      {label}: {content.text}
      {content.retry && onRetry && (
        <button
          type="button"
          className="text-[10px] underline decoration-dotted underline-offset-2"
          onClick={onRetry}
        >
          Recargar
        </button>
      )}
    </span>
  );
};

export default MovementRegistrationPage;
