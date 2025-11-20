"use client";

import ProductSidebar from "@/components/product_bar";

export function LayoutContent({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <aside className="border-b border-slate-800/60 bg-slate-950/80 lg:sticky lg:top-0 lg:h-screen lg:w-80 lg:border-b-0 lg:border-r">
          <ProductSidebar />
        </aside>
        <main className="flex-1 border-t border-slate-800/40 bg-slate-950/40 lg:border-l">
          <div className="mx-auto w-full max-w-6xl px-4 pb-10 pt-8 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
