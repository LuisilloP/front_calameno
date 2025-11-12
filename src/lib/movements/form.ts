import {
  MovementType,
  MovimientoCreatePayload,
} from "@/services/movementsApi";

export const MOVEMENT_TYPE_DEFINITIONS: Array<{
  value: MovementType;
  label: string;
  description: string;
}> = [
  {
    value: "ingreso",
    label: "Ingreso",
    description: "Suma stock en una locación específica.",
  },
  {
    value: "uso",
    label: "Uso",
    description: "Descuenta stock desde una locación de origen.",
  },
  {
    value: "traspaso",
    label: "Traspaso",
    description: "Traslada stock entre dos locaciones distintas.",
  },
  {
    value: "ajuste",
    label: "Ajuste",
    description: "Corrige inventario agregando o quitando stock.",
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
        allowTo: true,
        requiresFrom: false,
        requiresTo: true,
        requiresAnyLocation: true,
        requiresBothDistinct: false,
        forbidFrom: true,
        forbidTo: false,
      };
    case "uso":
      return {
        allowFrom: true,
        allowTo: false,
        requiresFrom: true,
        requiresTo: false,
        requiresAnyLocation: true,
        requiresBothDistinct: false,
        forbidFrom: false,
        forbidTo: true,
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
    errors.quantity = "La cantidad debe ser numérica.";
  } else if (!isPositiveNumber(parsedQty)) {
    errors.quantity = "La cantidad debe ser mayor a 0.";
  } else if (countDecimals(parsedQty) > 3) {
    errors.quantity = "Usa máximo 3 decimales.";
  }

  if (form.productoId && !form.confirmUnit) {
    errors.confirmUnit = "Confirma la unidad mostrada.";
  }

  const rules = resolveMovementRules(form.tipo);

  if (rules.forbidFrom && form.fromLocationId !== undefined) {
    errors.fromLocationId =
      "Este tipo de movimiento no admite locación origen.";
  }

  if (rules.forbidTo && form.toLocationId !== undefined) {
    errors.toLocationId =
      "Este tipo de movimiento no admite locación destino.";
  }

  if (rules.requiresFrom && !form.fromLocationId) {
    errors.fromLocationId = "Selecciona la locación origen.";
  }

  if (rules.requiresTo && !form.toLocationId) {
    errors.toLocationId = "Selecciona la locación destino.";
  }

  if (
    rules.requiresAnyLocation &&
    !form.fromLocationId &&
    !form.toLocationId
  ) {
    errors.fromLocationId ??= "Debes definir al menos una locación.";
    errors.toLocationId ??= "Debes definir al menos una locación.";
  }

  if (
    rules.requiresBothDistinct &&
    form.fromLocationId &&
    form.toLocationId &&
    form.fromLocationId === form.toLocationId
  ) {
    errors.toLocationId = "Origen y destino deben ser distintos.";
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

  return {
    tipo: form.tipo,
    producto_id: form.productoId!,
    cantidad: Number(quantity.toFixed(3)),
    from_locacion_id: form.fromLocationId ?? null,
    to_locacion_id: form.toLocationId ?? null,
    persona_id: form.personaId ?? null,
    proveedor_id: form.proveedorId ?? null,
    nota: form.nota.trim() ? form.nota.trim() : null,
  };
};
