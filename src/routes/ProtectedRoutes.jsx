import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, roles }) {
  const { isLoggedIn, loading, user } = useAuth();

  if (loading) return <div>Carregando...</div>;

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />; // ou /403 se tiver
  }

  return children;
}
