import axios from "axios";
// NOTE: avoid importing axios types to prevent build issues if types are not installed
import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  UpdatePasswordRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
} from "../interfaces/user";

const API_URL_AUTH =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost/api/v1/auth";

export class AuthService {
  private static instance: AuthService;
  private token: string | null = null;
  private client: any;

  private constructor() {
    this.client = axios.create({
      baseURL: API_URL_AUTH + "/auth",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("auth_token");
      if (this.token) {
        this.client.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${this.token}`;
      }
    }

    // Attach token dynamically on each request
    this.client.interceptors.request.use((config: any) => {
      if (this.token) {
        config.headers = config.headers || {};
        config.headers["Authorization"] = `Bearer ${this.token}`;
      }
      return config;
    });
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  public setToken(token: string | null): void {
    this.token = token;
    if (typeof window !== "undefined") {
      if (token) {
        localStorage.setItem("auth_token", token);
        this.client.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${token}`;
      } else {
        localStorage.removeItem("auth_token");
        delete this.client.defaults.headers.common["Authorization"];
      }
    }
  }

  private handleError(error: unknown): never {
    const err = error as any;
    const message = err?.response?.data?.message || err?.message || "Error";
    throw new Error(message);
  }

  public async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await this.client.post("/register", data);
      const res = response.data as AuthResponse;
      return res;
    } catch (e) {
      this.handleError(e);
    }
  }

  public async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await this.client.post("/login", data);
      const res = response.data as AuthResponse;
      if (res.token) {
        this.setToken(res.token);
      }
      return res;
    } catch (e) {
      this.handleError(e);
    }
  }

  public async me(): Promise<AuthResponse> {
    try {
      const response = await this.client.get("/me");
      const res = response.data as AuthResponse;
      return res;
    } catch (e) {
      this.handleError(e);
    }
  }

  public async logout(): Promise<AuthResponse> {
    try {
      const response = await this.client.post("/logout");
      const res = response.data as AuthResponse;
      this.setToken(null);
      return res;
    } catch (e) {
      this.setToken(null);
      this.handleError(e);
    }
  }

  public async logoutAll(): Promise<AuthResponse> {
    try {
      const response = await this.client.post("/logout-all");
      const res = response.data as AuthResponse;
      this.setToken(null);
      return res;
    } catch (e) {
      this.setToken(null);
      this.handleError(e);
    }
  }

  public async updatePassword(
    data: UpdatePasswordRequest
  ): Promise<AuthResponse> {
    try {
      const response = await this.client.post("/update-password", data);
      const res = response.data as AuthResponse;
      return res;
    } catch (e) {
      this.handleError(e);
    }
  }

  public async forgotPassword(
    data: ForgotPasswordRequest
  ): Promise<AuthResponse> {
    try {
      const response = await this.client.post("/forgot-password", data);
      const res = response.data as AuthResponse;
      return res;
    } catch (e) {
      this.handleError(e);
    }
  }

  public async resetPassword(
    data: ResetPasswordRequest
  ): Promise<AuthResponse> {
    try {
      const response = await this.client.post("/reset-password", data);
      const res = response.data as AuthResponse;
      return res;
    } catch (e) {
      this.handleError(e);
    }
  }

  public isAuthenticated(): boolean {
    return !!this.token;
  }
}
