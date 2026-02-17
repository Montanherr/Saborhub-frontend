import { createContext, useContext, useEffect, useState } from "react";
import { socket } from "socket/socket";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔹 Recupera usuário do localStorage
  useEffect(() => {
    const token = localStorage.getItem("token");
    const companyId = localStorage.getItem("companyId");
    const userId = localStorage.getItem("userId");
    const role = localStorage.getItem("role");

    if (token && role) {
      setUser({
        id: Number(userId),
        companyId: Number(companyId),
        role,
        token,
      });
    }

    setLoading(false);
  }, []);

  // 🔹 Conecta / desconecta socket baseado no user
  useEffect(() => {
    if (!user) return;

    socket.connect();

    const onConnect = () => {
      socket.emit("join_company", {
        companyId: user.companyId,
        userId: user.id,
        role: user.role,
      });
    };

    socket.on("connect", onConnect);

    return () => {
      socket.off("connect", onConnect);
      socket.disconnect();
    };
  }, [user]);

  function login(data) {
    localStorage.setItem("token", data.token);
    localStorage.setItem("companyId", data.companyId);
    localStorage.setItem("userId", data.id);
    localStorage.setItem("role", data.role);

    setUser({
      id: Number(data.id),
      companyId: Number(data.companyId),
      role: data.role,
      token: data.token,
    });
  }

  function logout() {
    socket.disconnect();
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
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
