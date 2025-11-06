import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost/api/v1";

export interface Product {
  id: number;
  name: string;
  category: string;
  minStock: string;
  parLevel: string;
  avgCost: string;
  baseUom: {
    name: string;
  };
}

export interface ApiResponse<T> {
  data: T[];
  meta: {
    total: number;
  };
}

class ApiConnector {
  private static instance: ApiConnector;
  private client: any;

  private constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // ======================
    // Token para pruebas
    // ======================
    const TEST_TOKEN =
      process.env.NEXT_PUBLIC_TEST_TOKEN ||
      "23|3ZhiNiQ4wRr9jCXtfgO7qlYXtHFhJctsb0mCvDXad2ea79eb";

    // Usa token desde localStorage o el token de prueba
    let initialToken: string | null = null;
    if (typeof window !== "undefined") {
      initialToken = localStorage.getItem("auth_token") || TEST_TOKEN;
    } else {
      initialToken = TEST_TOKEN;
    }

    if (initialToken) {
      this.client.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${initialToken}`;
    }

    // Interceptor para actualizar token si cambia en runtime
    this.client.interceptors.request.use((config: any) => {
      const token =
        (typeof window !== "undefined" && localStorage.getItem("auth_token")) ||
        initialToken;
      if (token) {
        config.headers = config.headers || {};
        config.headers["Authorization"] = `Bearer ${token}`;
      }
      return config;
    });
  }

  public static getInstance(): ApiConnector {
    if (!ApiConnector.instance) {
      ApiConnector.instance = new ApiConnector();
    }
    return ApiConnector.instance;
  }

  public async getProducts(): Promise<ApiResponse<Product>> {
    try {
      const response = await this.client.get("/products");
      return response.data;
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Error fetching products";
      throw new Error(message);
    }
  }
}

export const apiConnector = ApiConnector.getInstance();

// Helper opcional para actualizar el token manualmente
export function setApiToken(token: string | null) {
  if (token) {
    apiConnector["client"].defaults.headers.common[
      "Authorization"
    ] = `Bearer ${token}`;
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_token", token);
    }
  } else {
    if (apiConnector["client"] && apiConnector["client"].defaults) {
      delete apiConnector["client"].defaults.headers.common["Authorization"];
    }
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
    }
  }
}
