import type { FieldValues, Path, UseFormReturn } from "react-hook-form";
import { z } from "zod";

import type { ApiError } from "@/types/common";

export function applyApiErrorsToForm<TFieldValues extends FieldValues>(
  form: UseFormReturn<TFieldValues>,
  apiError: ApiError,
) {
  if (!apiError.errors) return;
  Object.entries(apiError.errors).forEach(([field, messages]) => {
    const path = field as Path<TFieldValues>;
    const message = Array.isArray(messages) ? messages[0] : String(messages);
    form.setError(path, {
      type: "server",
      message,
    });
  });
}

export const numericStringSchema = z
  .string()
  .trim()
  .regex(/^\d+(\.\d+)?$/, { message: "Ingresa un numero valido" });

export function parseNumericInput(value: string): string {
  return value
    .replace(/[^\d.,]/g, "")
    .replace(",", ".")
    .replace(/(\..*)\./g, "$1");
}

export type FormMode = "create" | "edit";
