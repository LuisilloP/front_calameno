"use client";

import TestBar from "@/components/product_bar";

export function LayoutContent({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-2">
      <TestBar />
      <div className="w-full m-auto">{children}</div>
    </div>
  );
}
