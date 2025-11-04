export interface User {
  id: number;
  name: string;
  email: string;
  emailVerifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token?: string;
  tokenType?: string;
  abilities?: string[];
  expiresAt?: string;
  message?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  device_name: string;
  abilities?: string[];
  remember?: boolean;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface UpdatePasswordRequest {
  current_password: string;
  password: string;
  password_confirmation: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  token: string;
  password: string;
  password_confirmation: string;
}
