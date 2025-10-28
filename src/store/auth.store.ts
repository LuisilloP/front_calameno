import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";
import type { StateStorage } from "zustand/middleware";

import { isBffMode } from "@/lib/env";
import { authService } from "@/services/auth.service";
import type { LoginDto, User } from "@/types/auth";

interface LogoutOptions {
  silent?: boolean;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isHydrated: boolean;
  login: (dto: LoginDto) => Promise<User>;
  logout: (options?: LogoutOptions) => Promise<void>;
  fetchMe: () => Promise<User>;
  hydrateFromStorage: () => Promise<void>;
  setUser: (user: User | null) => void;
}

const noopStorage: StateStorage = {
  getItem: () => null,
  setItem: () => null,
  removeItem: () => null,
};

const storage = createJSONStorage<AuthState>(() =>
  typeof window !== "undefined" ? window.localStorage : noopStorage,
);

const initialState: Pick<AuthState, "token" | "user" | "isAuthenticated" | "isLoading" | "isHydrated"> = {
  token: null,
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isHydrated: false,
};

export const authStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,
        async login(dto) {
          set({ isLoading: true });
          try {
            const { token, user } = await authService.login(dto);
            set({
              token: token || null,
              user,
              isAuthenticated: true,
              isLoading: false,
            });
            return user;
          } catch (error) {
            set({ isLoading: false });
            throw error;
          }
        },
        async logout(options) {
          try {
            await authService.logout();
          } catch (error) {
            if (!options?.silent) {
              console.error("Error al cerrar sesion", error);
            }
          } finally {
            set({
              token: null,
              user: null,
              isAuthenticated: false,
              isLoading: false,
            });
            if (!options?.silent && typeof window !== "undefined") {
              window.location.href = "/login";
            }
          }
        },
        async fetchMe() {
          set({ isLoading: true });
          try {
            const user = await authService.me();
            set({ user, isAuthenticated: true, isLoading: false });
            return user;
          } catch (error) {
            set({ isLoading: false, isAuthenticated: false, token: null });
            throw error;
          }
        },
        hydrateFromStorage: async () => {},
        setUser(user) {
          set({ user, isAuthenticated: Boolean(user) });
        },
      }),
      {
        name: "auth-storage",
        storage,
        partialize: (state) => ({
          token: isBffMode ? null : state.token,
          user: state.user,
          isAuthenticated: state.isAuthenticated,
        }),
        onRehydrateStorage: () => (state, error) => {
          if (error) {
            console.error("Fallo la rehidratacion del estado de auth", error);
            return;
          }
          if (!state) return;
          state.isHydrated = true;
        },
      },
    ),
  ),
);

authStore.getState().hydrateFromStorage = async () => {
  const state = authStore.getState();
  if (state.isHydrated) return;

  if (typeof window !== "undefined") {
    await authStore.persist.rehydrate();
  }

  const current = authStore.getState();
  const shouldFetchUser = isBffMode || Boolean(current.token);
  if (shouldFetchUser && !current.user) {
    try {
      await current.fetchMe();
    } catch {
      authStore.setState({ token: null, user: null, isAuthenticated: false });
    }
  }

  authStore.setState((prev) => ({
    ...prev,
    isHydrated: true,
    isAuthenticated: Boolean(prev.user || prev.token),
  }));
};

export const useAuthToken = () => authStore(({ token }) => token);
export const useCurrentUser = () => authStore(({ user }) => user);
export const useIsAuthenticated = () => authStore(({ isAuthenticated }) => isAuthenticated);
export const useAuthHydrated = () => authStore(({ isHydrated }) => isHydrated);
