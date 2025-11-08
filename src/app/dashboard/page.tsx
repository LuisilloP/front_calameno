"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();

  return (
    <main className="p-6 min-h-screen">
      <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
    </main>
  );
}
