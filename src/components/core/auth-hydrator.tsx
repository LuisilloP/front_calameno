"use client";

import { useEffect } from "react";

import { authStore } from "@/store/auth.store";

export function AuthHydrator() {
  useEffect(() => {
    void authStore.getState().hydrateFromStorage();
  }, []);

  return null;
}
