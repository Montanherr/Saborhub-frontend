import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import userService from "../../services/userService";
import "./Login.css";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Informe e-mail e senha.");
      return;
    }

    try {
      setLoading(true);

      // 🔐 Login na API
      const response = await userService.login({
        email,
        password,
      });

      const { token, user } = response;

      // 🔥 Persistência (importante para F5)
      localStorage.setItem("token", token);
      localStorage.setItem("userId", user.id);
      localStorage.setItem("companyId", user.companyId);
      localStorage.setItem("role", user.role);

      // 👉 Flag derivada (NÃO é coluna do banco)
      localStorage.setItem(
        "isAdmin",
        user.role === "admin" || user.role === "manager"
      );

      // 🔥 Atualiza contexto global
      login({
        ...user,
        token,
      });

      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.error || "E-mail ou senha inválidos."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-container">
      <h1 className="app-title">SaborHub</h1>

      <div className="login-box">
        <h2>Entrar</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
            required
          />

          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
            }}
            required
          />

          {error && <span className="error">{error}</span>}

          <button type="submit" disabled={loading}>
            {loading ? "Entrando..." : "Acessar"}
          </button>
        </form>
      </div>
    </div>
  );
}
