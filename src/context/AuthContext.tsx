"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User } from "../interfaces/user";
import { AuthService } from "../services/auth.service";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    passwordConfirmation: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (
    email: string,
    token: string,
    password: string,
    passwordConfirmation: string
  ) => Promise<void>;
  updatePassword: (
    currentPassword: string,
    password: string,
    passwordConfirmation: string
  ) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const authService = AuthService.getInstance();

  useEffect(() => {
    const initializeAuth = async () => {
      if (authService.isAuthenticated()) {
        try {
          const response = await authService.me();
          setUser(response.user);
        } catch (error) {
          console.error("Error initializing auth:", error);
          authService.setToken(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      const response = await authService.login({
        email,
        password,
        device_name: window.navigator.userAgent,
      });
      setUser(response.user);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Error al iniciar sesión"
      );
      throw error;
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    passwordConfirmation: string
  ) => {
    try {
      setError(null);
      await authService.register({
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Error al registrar usuario"
      );
      throw error;
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await authService.logout();
      setUser(null);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Error al cerrar sesión"
      );
      throw error;
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      setError(null);
      await authService.forgotPassword({ email });
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Error al enviar correo de recuperación"
      );
      throw error;
    }
  };

  const resetPassword = async (
    email: string,
    token: string,
    password: string,
    passwordConfirmation: string
  ) => {
    try {
      setError(null);
      await authService.resetPassword({
        email,
        token,
        password,
        password_confirmation: passwordConfirmation,
      });
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Error al restablecer contraseña"
      );
      throw error;
    }
  };

  const updatePassword = async (
    currentPassword: string,
    password: string,
    passwordConfirmation: string
  ) => {
    try {
      setError(null);
      await authService.updatePassword({
        current_password: currentPassword,
        password,
        password_confirmation: passwordConfirmation,
      });
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Error al actualizar contraseña"
      );
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        forgotPassword,
        resetPassword,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
