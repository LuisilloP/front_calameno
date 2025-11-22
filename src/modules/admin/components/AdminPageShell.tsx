"use client";

import { ReactNode } from "react";

type AdminPageShellProps = {
  title: string;
  subtitle?: string;
  helper?: string;
  heroSlot?: ReactNode;
  children: ReactNode;
};

export const AdminPageShell = ({
  title,
  subtitle,
  helper,
  heroSlot,
  children,
}: AdminPageShellProps) => {
  return (
    <main className="min-h-screen bg-[hsl(var(--surface-muted))] px-4 py-10 text-[hsl(var(--foreground))] md:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-6 shadow-lg shadow-black/5">
          <p className="text-xs uppercase tracking-[0.4em] text-[hsl(var(--muted))]">
            Inventario
          </p>
          <div className="mt-2 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[hsl(var(--foreground))]">
                {title}
              </h1>
              {subtitle && (
                <p className="mt-1 text-sm text-[hsl(var(--muted))]">
                  {subtitle}
                </p>
              )}
            </div>
            {helper && (
              <span className="rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--surface-strong))] px-4 py-2 text-xs text-[hsl(var(--muted-strong))]">
                {helper}
              </span>
            )}
          </div>
        </header>
        {heroSlot}
        {children}
      </div>
    </main>
  );
};
