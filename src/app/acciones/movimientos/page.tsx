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
import {
  CENTRAL_LOCATION_ID,
  CENTRAL_LOCATION_NAME,
} from "@/config/warehouse";

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

const parseStockValue = (raw?: string | number | null) => {
  if (typeof raw === "number") return raw;
  if (typeof raw === "string") {
    const normalized = raw.replace(",", ".").trim();
    const parsed = Number(normalized);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
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
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const selected = useMemo(
    () => options?.find((opt) => opt.id === value),
    [options, value]
  );

  useEffect(() => {
    if (!value) {
      // Reset controlled display when parent clears the selection.
      setQuery("");
      setIsTyping(false);
      setOpen(false);
      return;
    }
    if (selected) {
      setQuery(selected.label);
    }
  }, [selected, value]);

  const handleSelect = (opt: CatalogOption) => {
    onChange(opt.id);
    setQuery(opt.label);
    setIsTyping(false);
    setOpen(false);
  };

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
  const displayValue = isTyping ? query : selected?.label ?? "";

  return (
    <div className="relative space-y-1" ref={containerRef}>
      <label className="text-sm font-semibold text-[hsl(var(--muted-strong))]">{label}</label>
      <div
        className={cn(
          "rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface-strong))] px-4 py-2 focus-within:border-[hsl(var(--accent))]",
          disabled && "opacity-60 pointer-events-none",
          error && "border-red-500/70"
        )}
        onClick={() => {
          if (!disabled) setOpen(true);
        }}
      >
        <div className="flex items-center gap-2">
          <input
            className="w-full bg-transparent text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted))] focus:outline-none cursor-pointer"
            placeholder={placeholder}
            value={displayValue}
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
              }
            }}
          />
          {value && (
            <button
              type="button"
              className="text-xs text-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]"
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
        <p className="text-xs text-[hsl(var(--muted))]">{helperText}</p>
      )}
      {error && <p className="text-xs text-red-400">{error}</p>}

      {status === "loading" && (
        <p className="text-xs text-[hsl(var(--muted))] flex items-center gap-2">
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
        <div className="absolute left-0 right-0 z-30 mt-1 max-h-64 overflow-y-auto rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-2xl shadow-black/10">
          {filtered.length === 0 ? (
            <div className="px-4 py-3 text-sm text-[hsl(var(--muted))]">
              Sin coincidencias
            </div>
          ) : (
            filtered.map((opt) => (
              <button
                type="button"
                key={opt.id}
                className={cn(
                  "flex w-full flex-col px-4 py-2 text-left text-sm hover:bg-[hsl(var(--surface-strong))]",
                  value === opt.id && "bg-[hsla(var(--accent)/0.1)] text-[hsl(var(--foreground))]"
                )}
                onMouseDown={(event) => {
                  event.preventDefault(); // evita que el blur cierre antes de seleccionar
                  handleSelect(opt);
                }}
                onClick={() => handleSelect(opt)}
              >
                <span className="font-semibold text-[hsl(var(--foreground))]">
                  {opt.label}
                </span>
                {(opt.caption || opt.meta) && (
                  <span className="text-xs text-[hsl(var(--muted))]">
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

const ReadOnlyLocationCard = ({
  label,
  value,
  helperText,
}: {
  label: string;
  value: string;
  helperText?: string;
}) => (
  <div className="space-y-2">
    <label className="text-sm font-semibold text-[hsl(var(--muted-strong))]">{label}</label>
    <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface-strong))] px-4 py-2 text-sm text-[hsl(var(--foreground))]">
      {value}
    </div>
    {helperText && <p className="text-xs text-[hsl(var(--muted))]">{helperText}</p>}
  </div>
);

const initialFormState: MovementFormState = {
  tipo: "ingreso",
  productoId: undefined,
  quantity: "",
  fromLocationId: undefined,
  toLocationId: CENTRAL_LOCATION_ID,
  personaId: undefined,
  proveedorId: undefined,
  nota: "",
  confirmUnit: false,
};

const movementTypeBadge: Record<MovementType, string> = {
  ingreso: "bg-[hsla(var(--success)/0.12)] text-[hsl(var(--success))] border border-[hsla(var(--success)/0.6)]",
  uso: "bg-[hsla(var(--info)/0.12)] text-[hsl(var(--info))] border border-[hsla(var(--info)/0.6)]",
  traspaso: "bg-[hsla(var(--accent)/0.12)] text-[hsl(var(--accent))] border border-[hsla(var(--accent)/0.6)]",
  ajuste: "bg-[hsla(var(--danger)/0.12)] text-[hsl(var(--danger))] border border-[hsla(var(--danger)/0.6)]",
};

const movementTypeAccent: Record<MovementType, string> = {
  ingreso:
    "border-[hsla(var(--success)/0.6)] bg-[hsla(var(--success)/0.12)] hover:border-[hsl(var(--success))] text-[hsl(var(--foreground))]",
  uso: "border-[hsla(var(--info)/0.6)] bg-[hsla(var(--info)/0.12)] hover:border-[hsl(var(--info))] text-[hsl(var(--foreground))]",
  traspaso:
    "border-[hsla(var(--accent)/0.6)] bg-[hsla(var(--accent)/0.12)] hover:border-[hsl(var(--accent))] text-[hsl(var(--foreground))]",
  ajuste:
    "border-[hsla(var(--danger)/0.6)] bg-[hsla(var(--danger)/0.12)] hover:border-[hsl(var(--danger))] text-[hsl(var(--foreground))]",
};

const movementTypeHeadingColor: Record<MovementType, string> = {
  ingreso: "text-[hsl(var(--success))]",
  uso: "text-[hsl(var(--info))]",
  traspaso: "text-[hsl(var(--accent))]",
  ajuste: "text-[hsl(var(--danger))]",
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
  const [stockInfo, setStockInfo] = useState<{
    status: "idle" | "loading" | "ready" | "error";
    value?: number;
    error?: string;
  }>({ status: "idle" });

  const selectedProduct = useMemo(
    () => productos.data?.find((p) => p.id === form.productoId),
    [form.productoId, productos.data]
  );

  const unidadMap = useMemo(() => {
    const map = new Map<number, string>();
    uoms.data?.forEach((unidad) => {
      const label =
        unidad.abreviatura?.trim() || unidad.nombre?.trim() || "";
      if (label) {
        map.set(unidad.id, label);
      }
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
    return productos.data.map((producto) => {
      const inlineUnit = formatUom(producto);
      const catalogUnit = producto.uom_id
        ? unidadMap.get(producto.uom_id)
        : undefined;
      const meta = catalogUnit ?? inlineUnit;
      return {
        id: producto.id,
        label: producto.nombre,
        caption: producto.sku ? `SKU ${producto.sku}` : undefined,
        meta: meta || undefined,
      };
    });
  }, [productos.data, unidadMap]);

  const allLocationOptions = useMemo<CatalogOption[] | undefined>(() => {
    if (!locaciones.data) return undefined;
    return locaciones.data.map((loc) => ({
      id: loc.id,
      label: loc.nombre,
      meta: loc.codigo ? `Código ${loc.codigo}` : undefined,
    }));
  }, [locaciones.data]);

  const usoDestinationOptions = useMemo<CatalogOption[] | undefined>(() => {
    if (!allLocationOptions) return undefined;
    return allLocationOptions.filter(
      (loc) => loc.id !== CENTRAL_LOCATION_ID
    );
  }, [allLocationOptions]);

  const locacionesById = useMemo(() => {
    const map = new Map<number, string>();
    locaciones.data?.forEach((loc) => map.set(loc.id, loc.nombre));
    return map;
  }, [locaciones.data]);

  const centralLocationLabel =
    locacionesById.get(CENTRAL_LOCATION_ID) ?? CENTRAL_LOCATION_NAME;
  const stockLocationId =
    form.tipo === "ingreso"
      ? CENTRAL_LOCATION_ID
      : form.fromLocationId ?? CENTRAL_LOCATION_ID;
  const stockLocationLabel =
    locacionesById.get(stockLocationId) ??
    (stockLocationId === CENTRAL_LOCATION_ID
      ? centralLocationLabel
      : `Locacion ${stockLocationId}`);

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

  /* eslint-disable react-hooks/set-state-in-effect */
  // Sincroniza con la API de stock cuando cambia el producto seleccionado.
  useEffect(() => {
    if (!form.productoId) {
      setStockInfo({ status: "idle" });
      return;
    }

    const controller = new AbortController();
    setStockInfo({ status: "loading" });

    movementsApi
      .getStock(form.productoId, stockLocationId, controller.signal)
      .then((result) => {
        const parsed = parseStockValue(result?.stock);
        setStockInfo({
          status: "ready",
          value: parsed,
        });
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        const message =
          typeof error === "object" && error && "message" in error
            ? ((error as { message?: string }).message ??
              "No se pudo obtener stock.")
            : "No se pudo obtener stock.";
        setStockInfo({ status: "error", error: message });
      });

    return () => controller.abort();
  }, [form.productoId, stockLocationId]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // popup toasts are handled by ToastProvider via useToast

  const handleTipoChange = (tipo: MovementType) => {
    const rules = resolveMovementRules(tipo);
    setForm((current) => {
      const next: MovementFormState = {
        ...current,
        tipo,
        fromLocationId: rules.forbidFrom ? undefined : current.fromLocationId,
        toLocationId: rules.forbidTo ? undefined : current.toLocationId,
      };
      if (tipo === "ingreso") {
        next.fromLocationId = undefined;
        next.toLocationId = CENTRAL_LOCATION_ID;
      } else if (tipo === "uso") {
        next.fromLocationId = CENTRAL_LOCATION_ID;
        if (next.toLocationId === CENTRAL_LOCATION_ID) {
          next.toLocationId = undefined;
        }
      }
      return next;
    });
    setErrors((prev) => ({ ...prev, tipo: undefined, form: undefined }));
  };

  const handleSubmit = async (event?: React.FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    setHasTriedSubmit(true);
    setSubmitState("validating");
    setApiError(null);

    const validation = validateMovementForm(form);
    const stockErrors = validation.isValid
      ? validateStockForUse(validation.quantity)
      : {};
    const mergedErrors = { ...validation.errors, ...stockErrors };
    setErrors(mergedErrors);

    if (!validation.isValid || Object.keys(stockErrors).length) {
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
        const destinoLabel = movimiento.to_locacion_id
          ? locacionesById.get(movimiento.to_locacion_id) ??
            `ID ${movimiento.to_locacion_id}`
          : undefined;
        const alert: MovementAlertData = {
          tipo: movimiento.tipo === "ingreso" ? "ingreso" : "uso",
          producto:
            productosById.get(movimiento.producto_id) ??
            `ID ${movimiento.producto_id}`,
          cantidad: movimiento.cantidad,
          unidad: productUnitLabel || undefined,
          locacionDestino:
            movimiento.tipo === "ingreso"
              ? destinoLabel ?? centralLocationLabel
              : destinoLabel,
          locacionOrigen:
            movimiento.tipo === "uso" ? centralLocationLabel : undefined,
          persona: movimiento.persona_id
            ? personasById.get(movimiento.persona_id) ??
              `ID ${movimiento.persona_id}`
            : undefined,
          proveedor: movimiento.proveedor_id
            ? proveedoresById.get(movimiento.proveedor_id) ??
              `ID ${movimiento.proveedor_id}`
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

  const validateStockForUse = (quantity?: number): MovementFormErrors => {
    if (form.tipo !== "uso") return {};

    if (stockInfo.status !== "ready" || typeof stockInfo.value !== "number") {
      return {
        form:
          "No pudimos validar el stock disponible en bodega central. Recarga el producto antes de registrar el uso.",
      };
    }

    const available = stockInfo.value;
    if (available <= 1) {
      return {
        quantity:
          "El stock es menor o igual a 1 en la bodega central. No puedes registrar este uso.",
      };
    }

    if (typeof quantity === "number" && quantity > available) {
      return {
        quantity: `No puedes registrar ${quantity} porque supera el stock disponible (${available}).`,
      };
    }

    return {};
  };

  const isSubmitting = submitState === "submitting";
  return (
    <main className="min-h-screen bg-[hsl(var(--surface))] p-6 text-[hsl(var(--foreground))] [button:cursor-pointer] [input:cursor-pointer]">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="flex flex-col gap-2 rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-6 shadow-lg shadow-black/10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-[hsl(var(--muted))]">
                Movimientos
              </p>
              <h1 className="text-3xl font-semibold text-[hsl(var(--foreground))]">
                Registrar movimiento de inventario
              </h1>
              <p className="text-sm text-[hsl(var(--muted))]">
                Controla ingresos y usos desde una sola
                pantalla.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-[hsl(var(--muted))]">
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
            className="space-y-6 rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-6 shadow-lg shadow-black/10"
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

            {form.productoId && (
              <div className="mt-1 flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900/60 px-3 py-2 text-xs text-slate-300">
                <span className="text-slate-200">
                  Stock en {stockLocationLabel}:
                </span>
                {stockInfo.status === "loading" && (
                  <span className="inline-flex items-center gap-1 text-slate-400">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Consultando...
                  </span>
                )}
                {stockInfo.status === "error" && (
                  <span className="text-amber-300">
                    {stockInfo.error ?? "No se pudo obtener stock."}
                  </span>
                )}
                {stockInfo.status === "ready" && (
                  <span className="font-semibold text-slate-100">
                    {typeof stockInfo.value === "number"
                      ? stockInfo.value.toLocaleString("es-CL", {
                          minimumFractionDigits: 3,
                          maximumFractionDigits: 3,
                        })
                      : "Sin dato"}
                  </span>
                )}
              </div>
            )}

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
              <ReadOnlyLocationCard
                label={
                  form.tipo === "ingreso" ? "Ingreso en bodega" : "Bodega origen"
                }
                value={centralLocationLabel}
                helperText={
                  form.tipo === "ingreso"
                    ? "Los ingresos suman stock solo en la bodega central."
                    : "Todos los usos descuentan stock desde la bodega central."
                }
              />

              {form.tipo === "ingreso" ? (
                <ReadOnlyLocationCard
                  label="Destino del ingreso"
                  value={centralLocationLabel}
                  helperText="El stock fisico vive en la bodega central."
                />
              ) : (
                <CatalogAutocomplete
                  label="Donde se consumio (opcional)"
                  placeholder="Ej. Cocina fria, Bar eventos"
                  options={usoDestinationOptions}
                  status={locaciones.status}
                  value={form.toLocationId}
                  disabled={locaciones.status !== "ready"}
                  error={errors.toLocationId}
                  helperText="Usos registran donde se gasto el producto sin afectar stock en esa locacion; el stock siempre vive en la bodega central."
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      toLocationId: value,
                    }))
                  }
                  onRetry={locaciones.reload}
                />
              )}
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
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-200">
                Nota interna (opcional)
              </label>
              <textarea
                className="min-h-[100px] w-full rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-slate-400 focus:outline-none"
                placeholder="Ej: Ajuste por merma en cocina fria."
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
                  "flex items-center gap-2 rounded-2xl bg-[hsl(var(--accent))] px-6 py-3 text-sm font-semibold text-[hsl(var(--accent-foreground))] transition hover:bg-[hsla(var(--accent)/0.9)]",
                  isSubmitting && "pointer-events-none opacity-80"
                )}
                disabled={isSubmitting}
              >
                {isSubmitting && (
                  <Loader2 className="h-4 w-4 animate-spin text-[hsl(var(--accent-foreground))]" />
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
            </div>
          </form>

          <aside className="space-y-4">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                Reglas vigentes
              </p>
              <ul className="mt-3 space-y-2 text-sm text-slate-300">
                {form.tipo === "ingreso" && (
                  <li>Se registra directo en la bodega central; no se define origen.</li>
                )}
                {form.tipo === "uso" && (
                  <li>Descuenta desde la bodega central y puede etiquetar un destino logico opcional.</li>
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
                  <li>
                    {lastMovement.tipo === "ingreso"
                      ? `Ingreso registrado en ${centralLocationLabel}`
                      : lastMovement.to_locacion_id
                          ? `Consumido en ${
                              locacionesById.get(lastMovement.to_locacion_id) ??
                              `ID ${lastMovement.to_locacion_id}`
                            }`
                          : "Uso sin destino etiquetado"}
                  </li>
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
    idle: { text: "Pendiente", color: "text-[hsl(var(--muted))] border-[hsl(var(--border))]" },
    loading: {
      text: "Cargando",
      color: "text-[hsl(var(--foreground))] border-[hsl(var(--border))]",
      spinner: true,
    },
    ready: { text: "Listo", color: "text-[hsl(var(--success))] border-[hsla(var(--success)/0.6)]" },
    error: {
      text: "Error",
      color: "text-[hsl(var(--danger))] border-[hsla(var(--danger)/0.6)]",
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
