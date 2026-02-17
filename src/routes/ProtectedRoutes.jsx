import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, roles }) {
  const { isLoggedIn, loading, user } = useAuth();

  if (loading) return <div>Carregando...</div>;

  if (!isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  if (roles && user?.role) {
    const userRole = user.role.toLowerCase();

    if (!roles.map(r => r.toLowerCase()).includes(userRole)) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
}
