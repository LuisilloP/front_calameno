"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [didSubmit, setDidSubmit] = useState(false);
  const router = useRouter();

  // If already authenticated (context has user), go to dashboard

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">Iniciar Sesión</h1>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4"></div>
        )}
      </div>
    </div>
  );
}
