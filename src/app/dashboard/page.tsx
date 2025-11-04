"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return <div>Loading...</div>;
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>Dashboard</h1>
      <p>Bienvenido, {user.name}!</p>
      <button onClick={logout}>Cerrar Sesión</button>
    </main>
  );
}
