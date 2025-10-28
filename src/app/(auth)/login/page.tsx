"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { applyApiErrorsToForm } from "@/lib/forms";
import { toApiError } from "@/lib/errors";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { authStore, useIsAuthenticated } from "@/store/auth.store";

const loginSchema = z.object({
  email: z.string().email({ message: "Ingresa un correo valido." }),
  password: z.string().min(6, { message: "La contrasena debe tener al menos 6 caracteres." }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams?.get("redirectTo") ?? "/uoms";
  const isAuthenticated = useIsAuthenticated();
  const [isHydrating, setIsHydrating] = React.useState(true);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  React.useEffect(() => {
    const hydrate = async () => {
      await authStore.getState().hydrateFromStorage();
      setIsHydrating(false);
    };
    void hydrate();
  }, []);

  React.useEffect(() => {
    if (!isHydrating && isAuthenticated) {
      router.replace(redirectTo);
    }
  }, [isAuthenticated, isHydrating, redirectTo, router]);

  const handleSubmit = form.handleSubmit(async (values) => {
    try {
      await authStore.getState().login(values);
      toast.success("Sesion iniciada");
      router.push(redirectTo);
    } catch (error) {
      const apiError = toApiError(error);
      applyApiErrorsToForm(form, apiError);
      toast.error(apiError.message);
    }
  });

  const { isSubmitting } = form.formState;

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <div className="w-full max-w-md rounded-lg border bg-background p-8 shadow-sm">
        <header className="mb-6 space-y-2 text-center">
          <h1 className="text-2xl font-semibold">Inicia sesion</h1>
          <p className="text-sm text-muted-foreground">
            Accede a tu panel para gestionar unidades de medida y productos.
          </p>
        </header>
        <Form {...form}>
          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correo electronico</FormLabel>
                  <FormControl>
                    <Input type="email" autoComplete="email" placeholder="usuario@empresa.com" {...field} />
                  </FormControl>
                  <FormMessage>{form.formState.errors.email?.message}</FormMessage>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contrasena</FormLabel>
                  <FormControl>
                    <Input type="password" autoComplete="current-password" placeholder="********" {...field} />
                  </FormControl>
                  <FormMessage>{form.formState.errors.password?.message}</FormMessage>
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isSubmitting || isHydrating}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Ingresar
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
