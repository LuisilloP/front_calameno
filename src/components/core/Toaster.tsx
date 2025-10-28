"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      richColors
      expand
      toastOptions={{
        duration: 4000,
      }}
    />
  );
}
