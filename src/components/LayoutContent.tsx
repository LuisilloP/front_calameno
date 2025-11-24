"use client";

import ProductSidebar from "@/components/product_bar";

export function LayoutContent({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))] transition-colors">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <aside className="bg-[hsl(var(--sidebar-surface))]/90 backdrop-blur-md lg:sticky lg:top-0 lg:h-screen lg:w-80 lg:border-r lg:border-[hsl(var(--border))]">
          <ProductSidebar />
        </aside>
        <main className="relative flex-1 border-t border-[hsl(var(--border))] bg-[hsl(var(--surface-muted))]/70 lg:border-l">
          <div className="mx-auto w-full max-w-6xl px-4 pb-12 pt-8 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
