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

    // conecta socket
    socket.connect();

    // 🔥 espera o connect de verdade
    const onConnect = () => {
      console.log("🟢 Socket conectado com sucesso");
      console.log("Socket ID:", socket.id);

      socket.emit("join_company", {
        companyId: user.companyId,
        userId: user.id,
        role: user.role,
      });
    };

    const onDisconnect = () => {
      console.log("🔴 Socket desconectado");
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
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
    socket.disconnect(); // garante desconexão
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
