import { describe, expect, it } from "vitest";
import {
  MovementFormState,
  buildMovimientoPayload,
  resolveMovementRules,
  validateMovementForm,
} from "@/lib/movements/form";

const baseForm: MovementFormState = {
  tipo: "ingreso",
  productoId: 10,
  quantity: "5",
  fromLocationId: undefined,
  toLocationId: 1,
  personaId: undefined,
  proveedorId: undefined,
  nota: "",
  confirmUnit: true,
};

describe("movement form validation", () => {
  it("requires producto, cantidad y confirmación de unidad", () => {
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

  it("rechaza cantidades inválidas", () => {
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
    expect(notNumber.errors.quantity).toMatch(/numérica/i);
  });

  it("aplica reglas de locaciones según el tipo", () => {
    const usoValidation = validateMovementForm({
      ...baseForm,
      tipo: "uso",
      fromLocationId: undefined,
      toLocationId: 4,
    });
    expect(usoValidation.isValid).toBe(false);
    expect(usoValidation.errors.fromLocationId).toBeDefined();

    const traspasoValidation = validateMovementForm({
      ...baseForm,
      tipo: "traspaso",
      fromLocationId: 2,
      toLocationId: 2,
    });
    expect(traspasoValidation.isValid).toBe(false);
    expect(traspasoValidation.errors.toLocationId).toMatch(/distintos/i);

    const ajusteValidation = validateMovementForm({
      ...baseForm,
      tipo: "ajuste",
      fromLocationId: undefined,
      toLocationId: undefined,
    });
    expect(ajusteValidation.isValid).toBe(false);
    expect(ajusteValidation.errors.fromLocationId).toBeDefined();
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
      to_locacion_id: 1,
      nota: null,
    });
  });

  it("conoce las reglas por tipo", () => {
    expect(resolveMovementRules("ingreso").requiresTo).toBe(true);
    expect(resolveMovementRules("ingreso").allowFrom).toBe(false);
    expect(resolveMovementRules("uso").requiresFrom).toBe(true);
    expect(resolveMovementRules("uso").allowTo).toBe(false);
    expect(resolveMovementRules("traspaso").requiresBothDistinct).toBe(true);
    expect(resolveMovementRules("ajuste").requiresAnyLocation).toBe(true);
  });
});
