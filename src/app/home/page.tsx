import { withAuth } from "../../components/withAuth";
import { useAuth } from "../../context/AuthContext";

function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Bienvenido, {user?.name}!</p>
      <button onClick={logout}>Cerrar Sesión</button>
    </div>
  );
}

export default withAuth(DashboardPage);
