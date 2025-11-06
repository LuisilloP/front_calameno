"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();

  return (
    <main style={{ padding: 24 }} className="bg-gray-800">
      <h1>Dashboard</h1>
    </main>
  );
}
