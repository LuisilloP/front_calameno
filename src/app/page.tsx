import Link from "next/link";

export default function Home() {
  return (
    <main style={{ padding: 24 }}>
      <h1>Bienvenido a Calameno Inventario</h1>
      <p>Usa el menú para navegar.</p>
      <ul>
        <li>
          <Link href="/login">Iniciar sesión</Link>
        </li>
        <li>
          <Link href="/dashboard">Dashboard (protegido)</Link>
        </li>
      </ul>
    </main>
  );
}
