import {
  MovementType,
  MovimientoCreatePayload,
} from "@/services/movementsApi";
import {
  CENTRAL_LOCATION_ID,
  CENTRAL_LOCATION_NAME,
} from "@/config/warehouse";

export const MOVEMENT_TYPE_DEFINITIONS: Array<{
  value: MovementType;
  label: string;
  description: string;
}> = [
  {
    value: "ingreso",
    label: "Ingreso",
    description: `Suma stock directamente en ${CENTRAL_LOCATION_NAME}.`,
  },
  {
    value: "uso",
    label: "Uso",
    description:
      "Descuenta stock desde la bodega central y permite etiquetar el punto de consumo.",
  },
];

export type MovementFormState = {
  tipo: MovementType;
  productoId?: number;
  quantity: string;
  fromLocationId?: number;
  toLocationId?: number;
  personaId?: number;
  proveedorId?: number;
  nota: string;
  confirmUnit: boolean;
};

export type MovementFormErrors = Partial<
  Record<
    | "tipo"
    | "productoId"
    | "quantity"
    | "fromLocationId"
    | "toLocationId"
    | "confirmUnit"
    | "nota",
    string
  >
> & { form?: string };

export type MovementRules = {
  allowFrom: boolean;
  allowTo: boolean;
  requiresFrom: boolean;
  requiresTo: boolean;
  requiresAnyLocation: boolean;
  requiresBothDistinct: boolean;
  forbidFrom: boolean;
  forbidTo: boolean;
};

export const resolveMovementRules = (tipo: MovementType): MovementRules => {
  switch (tipo) {
    case "ingreso":
      return {
        allowFrom: false,
        allowTo: false,
        requiresFrom: false,
        requiresTo: true,
        requiresAnyLocation: false,
        requiresBothDistinct: false,
        forbidFrom: true,
        forbidTo: false,
      };
    case "uso":
      return {
        allowFrom: false,
        allowTo: true,
        requiresFrom: true,
        requiresTo: false,
        requiresAnyLocation: false,
        requiresBothDistinct: false,
        forbidFrom: false,
        forbidTo: false,
      };
    case "traspaso":
      return {
        allowFrom: true,
        allowTo: true,
        requiresFrom: true,
        requiresTo: true,
        requiresAnyLocation: true,
        requiresBothDistinct: true,
        forbidFrom: false,
        forbidTo: false,
      };
    case "ajuste":
    default:
      return {
        allowFrom: true,
        allowTo: true,
        requiresFrom: false,
        requiresTo: false,
        requiresAnyLocation: true,
        requiresBothDistinct: false,
        forbidFrom: false,
        forbidTo: false,
      };
  }
};

const normalizeQuantity = (value: string) => value.replace(",", ".").trim();

const countDecimals = (value: number) => {
  if (!Number.isFinite(value)) return 0;
  const [, decimals] = value.toString().split(".");
  return decimals?.length ?? 0;
};

const isPositiveNumber = (value: number) =>
  Number.isFinite(value) && value > 0;

export const validateMovementForm = (
  form: MovementFormState
): { isValid: boolean; errors: MovementFormErrors; quantity?: number } => {
  const errors: MovementFormErrors = {};

  if (!form.tipo) {
    errors.tipo = "Selecciona un tipo de movimiento.";
  }

  if (!form.productoId) {
    errors.productoId = "Selecciona un producto.";
  }

  const normalizedQty = normalizeQuantity(form.quantity);
  const parsedQty = Number(normalizedQty);
  if (!normalizedQty) {
    errors.quantity = "Ingresa una cantidad.";
  } else if (!Number.isFinite(parsedQty)) {
    errors.quantity = "La cantidad debe ser numerica.";
  } else if (!isPositiveNumber(parsedQty)) {
    errors.quantity = "La cantidad debe ser mayor a 0.";
  } else if (countDecimals(parsedQty) > 3) {
    errors.quantity = "Usa maximo 3 decimales.";
  }

  if (form.productoId && !form.confirmUnit) {
    errors.confirmUnit = "Confirma la unidad mostrada.";
  }

  const rules = resolveMovementRules(form.tipo);

  if (rules.forbidFrom && form.fromLocationId !== undefined) {
    errors.fromLocationId =
      "Este tipo de movimiento no admite sector origen.";
  }

  if (rules.forbidTo && form.toLocationId !== undefined) {
    errors.toLocationId =
      "Este tipo de movimiento no admite sector destino.";
  }

  if (rules.requiresFrom && !form.fromLocationId) {
    errors.fromLocationId = "Selecciona el sector origen.";
  }

  if (rules.requiresTo && !form.toLocationId) {
    errors.toLocationId = "Selecciona el sector destino.";
  }

  if (
    rules.requiresAnyLocation &&
    !form.fromLocationId &&
    !form.toLocationId
  ) {
    errors.fromLocationId ??= "Debes definir al menos un sector.";
    errors.toLocationId ??= "Debes definir al menos un sector.";
  }

  if (
    rules.requiresBothDistinct &&
    form.fromLocationId &&
    form.toLocationId &&
    form.fromLocationId === form.toLocationId
  ) {
    errors.toLocationId = "Origen y destino deben ser distintos.";
  }

  if (form.tipo === "ingreso") {
    if (form.toLocationId !== CENTRAL_LOCATION_ID) {
      errors.toLocationId = `Todos los ingresos llegan a ${CENTRAL_LOCATION_NAME}.`;
    }
    if (
      form.fromLocationId &&
      form.fromLocationId !== CENTRAL_LOCATION_ID
    ) {
      errors.fromLocationId = `El origen para ingresos es siempre ${CENTRAL_LOCATION_NAME}.`;
    }
  }

  if (form.tipo === "uso") {
    if (form.fromLocationId !== CENTRAL_LOCATION_ID) {
      errors.fromLocationId = `Los usos siempre salen de ${CENTRAL_LOCATION_NAME}.`;
    }
    if (form.toLocationId === CENTRAL_LOCATION_ID) {
      errors.toLocationId =
        "El destino de uso debe ser distinto a la bodega central.";
    }
  }

  const isValid = Object.keys(errors).length === 0;
  return { isValid, errors, quantity: parsedQty };
};

export const buildMovimientoPayload = (
  form: MovementFormState,
  parsedQuantity?: number
): MovimientoCreatePayload => {
  const quantity =
    typeof parsedQuantity === "number"
      ? parsedQuantity
      : Number(normalizeQuantity(form.quantity));

  const basePayload = {
    tipo: form.tipo,
    producto_id: form.productoId!,
    cantidad: Number(quantity.toFixed(3)),
    persona_id: form.personaId ?? null,
    proveedor_id: form.proveedorId ?? null,
    nota: form.nota.trim() ? form.nota.trim() : null,
  };

  if (form.tipo === "ingreso") {
    return {
      ...basePayload,
      from_locacion_id: null,
      to_locacion_id: CENTRAL_LOCATION_ID,
    };
  }

  if (form.tipo === "uso") {
    const payload: MovimientoCreatePayload = {
      ...basePayload,
      from_locacion_id: CENTRAL_LOCATION_ID,
    };
    if (typeof form.toLocationId === "number") {
      payload.to_locacion_id = form.toLocationId;
    }
    return payload;
  }

  return {
    ...basePayload,
    from_locacion_id: form.fromLocationId ?? null,
    to_locacion_id: form.toLocationId ?? null,
  };
};

