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
      setError("Preencha e-mail e senha.");
      return;
    }

    try {
      setLoading(true);

      const { token, user } = await userService.login({
        email,
        password,
      });

      localStorage.setItem("token", token);
      localStorage.setItem("userId", user.id);
      localStorage.setItem("companyId", user.companyId);
      localStorage.setItem("role", user.role);
      localStorage.setItem(
        "isAdmin",
        user.role === "admin" || user.role === "manager",
      );

      login({ ...user, token });

      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "E-mail ou senha inválidos.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-container">
      {/* Branding */}
      <div className="brand-area">
        <h1 className="app-title">SaborHub</h1>
        <p className="subtitle">Acesse o painel do seu cardápio digital</p>
      </div>

      {/* Card */}
      <div className="login-box">
        <h2>Entrar</h2>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>E-mail</label>
            <input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
            />
          </div>

          <div className="input-group">
            <label>Senha</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
            />
          </div>

          {error && <span className="error">{error}</span>}

          <button type="submit" disabled={loading}>
            {loading ? "Entrando..." : "Acessar painel"}
          </button>
        </form>

        <div className="login-footer">
          <span>Problemas para acessar?</span>
          <button
            type="button"
            className="link-btn"
            onClick={() => navigate("/forgot-password")}
          >
            Esqueci minha senha
          </button>{" "}
        </div>
      </div>
    </div>
  );
}
