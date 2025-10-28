import { authStore } from "@/store/auth.store";

export function requiresAuth(): boolean {
  const state = authStore.getState();
  if (state.isAuthenticated) {
    return true;
  }
  if (typeof window !== "undefined") {
    void state.hydrateFromStorage();
  }
  return authStore.getState().isAuthenticated;
}

export function redirectToLogin() {
  if (typeof window === "undefined") return;
  window.location.assign("/login");
}
