import { describe, expect, it } from "vitest";
import {
  MovementFormState,
  buildMovimientoPayload,
  resolveMovementRules,
  validateMovementForm,
} from "@/lib/movements/form";
import { CENTRAL_LOCATION_ID } from "@/config/warehouse";

const baseForm: MovementFormState = {
  tipo: "ingreso",
  productoId: 10,
  quantity: "5",
  fromLocationId: undefined,
  toLocationId: CENTRAL_LOCATION_ID,
  personaId: undefined,
  proveedorId: undefined,
  nota: "",
  confirmUnit: true,
};

describe("movement form validation", () => {
  it("requires producto, cantidad y confirmacion de unidad", () => {
    const missingProduct = validateMovementForm({
      ...baseForm,
      productoId: undefined,
      quantity: "",
    });
    expect(missingProduct.isValid).toBe(false);
    expect(missingProduct.errors.productoId).toBeDefined();
    expect(missingProduct.errors.quantity).toBeDefined();

    const missingConfirmation = validateMovementForm({
      ...baseForm,
      confirmUnit: false,
    });
    expect(missingConfirmation.isValid).toBe(false);
    expect(missingConfirmation.errors.confirmUnit).toBeDefined();
  });

  it("rechaza cantidades invalidas", () => {
    const tooManyDecimals = validateMovementForm({
      ...baseForm,
      quantity: "1.2345",
    });
    expect(tooManyDecimals.isValid).toBe(false);
    expect(tooManyDecimals.errors.quantity).toMatch(/3 decimales/i);

    const notNumber = validateMovementForm({
      ...baseForm,
      quantity: "abc",
    });
    expect(notNumber.isValid).toBe(false);
    expect(notNumber.errors.quantity).toMatch(/numerica/i);
  });

  it("aplica las nuevas reglas de locaciones", () => {
    const usoSinOrigen = validateMovementForm({
      ...baseForm,
      tipo: "uso",
      fromLocationId: undefined,
      toLocationId: undefined,
    });
    expect(usoSinOrigen.isValid).toBe(false);
    expect(usoSinOrigen.errors.fromLocationId).toMatch(/salen de/i);

    const usoDestinoCentral = validateMovementForm({
      ...baseForm,
      tipo: "uso",
      fromLocationId: CENTRAL_LOCATION_ID,
      toLocationId: CENTRAL_LOCATION_ID,
    });
    expect(usoDestinoCentral.isValid).toBe(false);
    expect(usoDestinoCentral.errors.toLocationId).toMatch(/destino/i);

    const ingresoIncorrecto = validateMovementForm({
      ...baseForm,
      toLocationId: 999,
    });
    expect(ingresoIncorrecto.isValid).toBe(false);
    expect(ingresoIncorrecto.errors.toLocationId).toMatch(/ingresos/i);
  });

  it("construye el payload compatible con el backend", () => {
    const validation = validateMovementForm({
      ...baseForm,
      quantity: "2.345",
      nota: " prueba ",
    });
    expect(validation.isValid).toBe(true);

    const payload = buildMovimientoPayload(
      { ...baseForm, quantity: "2.345" },
      validation.quantity
    );
    expect(payload).toMatchObject({
      tipo: "ingreso",
      producto_id: baseForm.productoId,
      cantidad: 2.345,
      to_locacion_id: CENTRAL_LOCATION_ID,
      nota: null,
    });
  });

  it("omite el destino cuando el uso no define donde se consumio", () => {
    const validation = validateMovementForm({
      ...baseForm,
      tipo: "uso",
      fromLocationId: CENTRAL_LOCATION_ID,
      toLocationId: undefined,
    });
    expect(validation.isValid).toBe(true);

    const payload = buildMovimientoPayload(
      {
        ...baseForm,
        tipo: "uso",
        fromLocationId: CENTRAL_LOCATION_ID,
        toLocationId: undefined,
      },
      validation.quantity
    );
    expect(payload.from_locacion_id).toBe(CENTRAL_LOCATION_ID);
    expect("to_locacion_id" in payload).toBe(false);
  });

  it("conoce las reglas por tipo", () => {
    expect(resolveMovementRules("ingreso").requiresTo).toBe(true);
    expect(resolveMovementRules("ingreso").allowFrom).toBe(false);
    expect(resolveMovementRules("uso").requiresFrom).toBe(true);
    expect(resolveMovementRules("uso").allowTo).toBe(true);
    expect(resolveMovementRules("traspaso").requiresBothDistinct).toBe(true);
    expect(resolveMovementRules("ajuste").requiresAnyLocation).toBe(true);
  });
});

