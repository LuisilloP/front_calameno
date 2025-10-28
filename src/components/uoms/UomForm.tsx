"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { applyApiErrorsToForm } from "@/lib/forms";
import { toApiError } from "@/lib/errors";
import type { ApiError } from "@/types/common";
import type { UomDto } from "@/types/uom";

import { Button } from "../ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

const uomSchema = z.object({
  name: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres." }),
  category: z.enum(["weight", "volume", "unit"], { required_error: "Selecciona una categoria." }),
  ratioToBase: z.coerce.number().nonnegative({ message: "Debe ser un valor positivo o cero." }),
});

type UomFormValues = z.infer<typeof uomSchema>;

interface UomFormProps {
  defaultValues?: UomDto;
  onSubmit: (values: UomDto) => Promise<void>;
  submitLabel?: string;
}

export function UomForm({ defaultValues, onSubmit, submitLabel = "Guardar" }: UomFormProps) {
  const [apiError, setApiError] = React.useState<ApiError | null>(null);

  const form = useForm<UomFormValues>({
    resolver: zodResolver(uomSchema),
    defaultValues: defaultValues ?? {
      name: "",
      category: "unit",
      ratioToBase: 1,
    },
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    setApiError(null);
    try {
      await onSubmit(values);
    } catch (error) {
      const parsed = toApiError(error);
      setApiError(parsed);
      applyApiErrorsToForm(form, parsed);
    }
  });

  const { isSubmitting } = form.formState;

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
                <Input placeholder="Unidad (Ej: Kilogramo)" {...field} />
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
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weight">Peso</SelectItem>
                    <SelectItem value="volume">Volumen</SelectItem>
                    <SelectItem value="unit">Unidad</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage>{form.formState.errors.category?.message}</FormMessage>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="ratioToBase"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Factor respecto a la base</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  min={0}
                  placeholder="Ej: 1"
                  value={field.value ?? ""}
                  onChange={(event) => field.onChange(Number(event.target.value))}
                />
              </FormControl>
              <FormMessage>{form.formState.errors.ratioToBase?.message}</FormMessage>
            </FormItem>
          )}
        />

        {apiError ? <p className="text-sm text-destructive">{apiError.message}</p> : null}

        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={isSubmitting} className="min-w-[140px]">
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
}
