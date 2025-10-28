"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { useAuthHydrated, useIsAuthenticated, authStore } from "@/store/auth.store";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isAuthenticated = useIsAuthenticated();
  const isHydrated = useAuthHydrated();

  React.useEffect(() => {
    if (!isHydrated) {
      void authStore.getState().hydrateFromStorage();
    }
  }, [isHydrated]);

  React.useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isHydrated, router]);

  if (!isHydrated) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <span className="text-sm text-muted-foreground">Validando sesion...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
