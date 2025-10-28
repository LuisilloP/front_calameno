export interface User {
  id: number;
  name: string;
  email: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginDto {
  email: string;
  password: string;
  deviceName?: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface MeResponse {
  data: User;
}
