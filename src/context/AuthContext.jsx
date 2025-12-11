import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // 🔹 controla carregamento do localStorage

  useEffect(() => {
    const token = localStorage.getItem("token");
    const companyId = localStorage.getItem("companyId");
    const userId = localStorage.getItem("userId");
    const isAdmin = localStorage.getItem("isAdmin");

    if (token) {
      setUser({
        id: Number(userId),
        companyId: Number(companyId),
        admin: isAdmin === "true",
        token,
      });
    }
    setLoading(false); // 🔹 terminou de carregar o user
  }, []);

  function login(data) {
    // 🔹 salvar dados localmente
    localStorage.setItem("token", data.token);
    localStorage.setItem("companyId", data.companyId);
    localStorage.setItem("userId", data.id);
    localStorage.setItem("isAdmin", data.admin);

    setUser(data);
  }

  function logout() {
    localStorage.clear();
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        login,
        logout,
        loading, // 🔹 exposto para ProtectedRoute
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
