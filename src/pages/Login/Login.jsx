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

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      // 🔥 Faz login na API
      const response = await userService.login({ email, password });

      const user = response.user;

      // 🔥 Salva no localStorage (ESSENCIAL PARA O F5)
      localStorage.setItem("token", response.token);
      localStorage.setItem("userId", user.id);
      localStorage.setItem("companyId", user.companyId);
      localStorage.setItem("isAdmin", user.admin);

      // 🔥 Salva também no AuthContext
      login({
        ...user,
        token: response.token,
      });

      navigate("/");
    } catch (err) {
      setError("E-mail ou senha inválidos.");
    } finally {
      setLoading(false);
    }
  };

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
          />

          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
            }}
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
