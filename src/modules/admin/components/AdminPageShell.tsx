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
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950/70 to-slate-900 px-4 py-10 text-slate-50 md:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
            Inventario
          </p>
          <div className="mt-2 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">{title}</h1>
              {subtitle && (
                <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
              )}
            </div>
            {helper && (
              <span className="rounded-full border border-slate-800 px-4 py-2 text-xs text-slate-300">
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
