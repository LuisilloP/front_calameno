"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { applyApiErrorsToForm } from "@/lib/forms";
import { toApiError } from "@/lib/errors";
import { useProductStore } from "@/store/product.store";
import type { ApiError } from "@/types/common";
import type { ProductDto } from "@/types/product";
import type { Uom } from "@/types/uom";

import { Button } from "../ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

const optionalNumeric = z
  .union([z.string(), z.number(), z.null(), z.undefined()])
  .transform((value) => {
    if (value === "" || value === null || value === undefined) {
      return null;
    }
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  })
  .refine((value) => value === null || value >= 0, { message: "Debe ser un numero positivo." });

const productSchema = z.object({
  name: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres." }),
  category: z
    .union([z.string().trim().max(100), z.null()])
    .optional()
    .transform((value) => (value === "" ? null : value ?? null)),
  baseUomId: z.coerce.number({ message: "Selecciona la unidad base." }).min(1, { message: "Selecciona la unidad base." }),
  purchaseUomId: optionalNumeric,
  purchaseToBase: optionalNumeric,
  shelfLifeDays: optionalNumeric,
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  defaultValues?: ProductDto;
  onSubmit: (values: ProductDto) => Promise<void>;
  submitLabel?: string;
}

export function ProductForm({ defaultValues, onSubmit, submitLabel = "Guardar" }: ProductFormProps) {
  const [apiError, setApiError] = React.useState<ApiError | null>(null);
  const fetchUoms = useProductStore((state) => state.fetchUomsForSelect);
  const uomCache = useProductStore((state) => state.uomsForSelect);

  React.useEffect(() => {
    void fetchUoms().catch(() => undefined);
  }, [fetchUoms]);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      category: defaultValues?.category ?? "",
      baseUomId: defaultValues?.baseUomId ?? 0,
      purchaseUomId: defaultValues?.purchaseUomId ?? null,
      purchaseToBase: defaultValues?.purchaseToBase ?? null,
      shelfLifeDays: defaultValues?.shelfLifeDays ?? null,
    },
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    setApiError(null);
    try {
      await onSubmit({
        ...values,
        category: values.category ?? undefined,
        purchaseUomId: values.purchaseUomId ?? undefined,
        purchaseToBase: values.purchaseToBase ?? undefined,
        shelfLifeDays: values.shelfLifeDays ?? undefined,
      });
    } catch (error) {
      const parsed = toApiError(error);
      setApiError(parsed);
      applyApiErrorsToForm(form, parsed);
    }
  });

  const { isSubmitting } = form.formState;
  const uomOptions = (uomCache?.data ?? []) as Uom[];

  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input placeholder="Producto" {...field} />
              </FormControl>
              <FormMessage>{form.formState.errors.name?.message}</FormMessage>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoria</FormLabel>
              <FormControl>
                <Input placeholder="Opcional (ej: Alimentos)" {...field} />
              </FormControl>
              <FormMessage>{form.formState.errors.category?.message}</FormMessage>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="baseUomId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Unidad base</FormLabel>
              <FormControl>
                <Select value={field.value ? String(field.value) : ""} onValueChange={(value) => field.onChange(Number(value))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una unidad" />
                  </SelectTrigger>
                  <SelectContent>
                    {uomOptions.map((uom) => (
                      <SelectItem key={uom.id} value={String(uom.id)}>
                        {uom.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage>{form.formState.errors.baseUomId?.message}</FormMessage>
            </FormItem>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="purchaseUomId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unidad de compra</FormLabel>
                <FormControl>
                  <Select
                    value={field.value ? String(field.value) : ""}
                    onValueChange={(value) => field.onChange(value ? Number(value) : null)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Opcional" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Sin definir</SelectItem>
                      {uomOptions.map((uom) => (
                        <SelectItem key={uom.id} value={String(uom.id)}>
                          {uom.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage>{form.formState.errors.purchaseUomId?.message}</FormMessage>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="purchaseToBase"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Factor compra a base</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min={0}
                    placeholder="Opcional"
                    value={field.value ?? ""}
                    onChange={(event) => {
                      const value = event.target.value;
                      field.onChange(value === "" ? null : Number(value));
                    }}
                  />
                </FormControl>
                <FormMessage>{form.formState.errors.purchaseToBase?.message}</FormMessage>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="shelfLifeDays"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vida util (dias)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  placeholder="Opcional"
                  value={field.value ?? ""}
                  onChange={(event) => {
                    const value = event.target.value;
                    field.onChange(value === "" ? null : Number(value));
                  }}
                />
              </FormControl>
              <FormMessage>{form.formState.errors.shelfLifeDays?.message}</FormMessage>
            </FormItem>
          )}
        />

        {apiError ? <p className="text-sm text-destructive">{apiError.message}</p> : null}

        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={isSubmitting || !uomOptions.length} className="min-w-[140px]">
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
}
