"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    // Stub: reemplazar con autenticacion real.
    setTimeout(() => {
      setLoading(false);
      router.push("/");
    }, 400);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[hsl(var(--background))] px-4 py-10 text-[hsl(var(--foreground))]">
      <div className="w-full max-w-md rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-8 shadow-xl shadow-black/10 backdrop-blur">
        <div className="mb-6 space-y-2 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[hsl(var(--muted-strong))]">
            Calameno Inventario
          </p>
          <h1 className="text-2xl font-semibold">Iniciar sesion</h1>
          <p className="text-sm text-[hsl(var(--muted))]">
            Usa tu correo corporativo y clave para continuar.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-[hsl(var(--danger))] bg-[hsla(var(--danger)/0.1)] px-3 py-2 text-sm text-[hsl(var(--danger))]">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="space-y-2 text-sm font-semibold text-[hsl(var(--muted-strong))]">
            <span>Correo electronico</span>
            <input
              type="email"
              value={credentials.email}
              onChange={(event) =>
                setCredentials((prev) => ({ ...prev, email: event.target.value }))
              }
              className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface-muted))] px-4 py-2.5 text-[hsl(var(--foreground))] shadow-sm transition focus:border-[hsl(var(--accent))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))] focus:ring-offset-2 focus:ring-offset-[hsl(var(--surface))]"
              placeholder="tuequipo@calameno.cl"
              required
            />
          </label>

          <label className="space-y-2 text-sm font-semibold text-[hsl(var(--muted-strong))]">
            <span>Clave</span>
            <input
              type="password"
              value={credentials.password}
              onChange={(event) =>
                setCredentials((prev) => ({ ...prev, password: event.target.value }))
              }
              className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface-muted))] px-4 py-2.5 text-[hsl(var(--foreground))] shadow-sm transition focus:border-[hsl(var(--accent))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))] focus:ring-offset-2 focus:ring-offset-[hsl(var(--surface))]"
              placeholder="••••••••"
              required
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[hsl(var(--accent))] px-4 py-3 text-sm font-semibold text-[hsl(var(--accent-foreground))] transition hover:bg-[hsla(var(--accent)/0.9)] disabled:opacity-70"
          >
            {loading ? "Validando..." : "Ingresar"}
          </button>
        </form>
      </div>
    </div>
  );
}
