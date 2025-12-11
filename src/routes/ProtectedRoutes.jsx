import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { isLoggedIn, loading } = useAuth();

  if (loading) return <div>Carregando...</div>; // espera o AuthContext restaurar

  if (!isLoggedIn) return <Navigate to="/login" replace />;

  return children;
}
