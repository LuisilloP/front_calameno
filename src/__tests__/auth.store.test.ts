import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/services/auth.service", () => ({
  authService: {
    login: vi.fn(),
    logout: vi.fn(),
    me: vi.fn(),
  },
}));

import { authService } from "@/services/auth.service";
import { authStore } from "@/store/auth.store";
import type { LoginDto, LoginResponse, User } from "@/types/auth";

const mockedAuthService = authService as unknown as {
  login: ReturnType<typeof vi.fn>;
  logout: ReturnType<typeof vi.fn>;
};

const sampleUser: User = {
  id: 1,
  name: "Admin",
  email: "admin@example.com",
};

const credentials: LoginDto = {
  email: "admin@example.com",
  password: "secret",
};

function resetStore() {
  authStore.setState(
    {
      token: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isHydrated: true,
    },
    true,
  );
}

describe("auth.store", () => {
  beforeEach(() => {
    resetStore();
    vi.clearAllMocks();
  });

  it("guarda el token y el usuario al iniciar sesion", async () => {
    mockedAuthService.login.mockResolvedValue({
      token: "token-123",
      user: sampleUser,
    } satisfies LoginResponse);

    await authStore.getState().login(credentials);

    const state = authStore.getState();
    expect(state.token).toBe("token-123");
    expect(state.user).toEqual(sampleUser);
    expect(state.isAuthenticated).toBe(true);
  });

  it("limpia el estado al cerrar sesion", async () => {
    authStore.setState({ token: "token-123", user: sampleUser, isAuthenticated: true }, false);
    mockedAuthService.logout.mockResolvedValue(undefined);

    await authStore.getState().logout();

    const state = authStore.getState();
    expect(state.token).toBeNull();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });
});
