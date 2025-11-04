"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [didSubmit, setDidSubmit] = useState(false);
  const router = useRouter();

  const { login, user, loading: authLoading } = useAuth();

  // If already authenticated (context has user), go to dashboard
  useEffect(() => {
    if (!authLoading && user) {
      router.replace("/dashboard");
    }
  }, [authLoading, user, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({ ...credentials, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // mark we attempted login and wait for context user to be set before navigating
      setDidSubmit(true);
      await login(credentials.email, credentials.password);
      // do NOT navigate here; wait for user state to update in effect below
    } catch (err: any) {
      const message = err?.message || err?.response?.data?.message;
      setError(message || "Error al conectar con el servidor");
      setDidSubmit(false);
    } finally {
      setLoading(false);
    }
  };

  // After a successful login attempt, wait until context user is available then navigate
  useEffect(() => {
    if (didSubmit && user) {
      router.replace("/dashboard");
    }
  }, [didSubmit, user, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">Iniciar Sesión</h1>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Correo Electrónico
            </label>
            <input
              id="email"
              value={credentials.email}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              placeholder="correo@ejemplo.com"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              value={credentials.password}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              placeholder="********"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-stone-900 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300"
            disabled={loading}
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
      </div>
    </div>
  );
}
