export type AuthMode = "direct" | "bff";

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  (process.env.NODE_ENV === "test" ? "http://localhost:1337" : undefined);
const rawAuthMode = process.env.NEXT_PUBLIC_AUTH_MODE ?? process.env.AUTH_MODE ?? "direct";

if (!apiBaseUrl) {
  throw new Error(
    "NEXT_PUBLIC_API_BASE_URL no esta definido. Configura la variable de entorno antes de ejecutar la app.",
  );
}

const authMode = (rawAuthMode === "bff" ? "bff" : "direct") as AuthMode;

export const env = {
  apiBaseUrl,
  authMode,
};

export const isBffMode = authMode === "bff";
