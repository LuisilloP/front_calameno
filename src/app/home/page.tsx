"use client";
import { useEffect, useState } from "react";

export default function Home() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  return (
    <main className="p-6">
      {user ? (
        <h1>Bienvenido, {user.name} 👋</h1>
      ) : (
        <h1>Bienvenido al sitio</h1>
      )}
    </main>
  );
}
