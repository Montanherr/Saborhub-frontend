import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import Dropdown from "../../components/Dropdown/Dropdown";
import "./Header.css";

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);

  const isAdmin = ["admin", "manager"].includes(user?.role);
  const isWaiter = ["admin", "manager", "waiter"].includes(user?.role);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setOpen(false);
  };

  return (
    <header className="top-menu">
      <div className="logo">SaborHub</div>

      {/* ☰ BOTÃO HAMBURGUER */}
      <button
        className="menu-toggle"
        onClick={() => setOpen(!open)}
        aria-label="Abrir menu"
      >
        ☰
      </button>

      <nav className={`menu-links ${open ? "open" : ""}`}>
        <Link to="/" onClick={() => setOpen(false)}>
          Home
        </Link>
          <Link to="/register" onClick={() => setOpen(false)}>
          Para Empresas
        </Link>

        {isAdmin && (
          <Dropdown
            title="Administração"
            items={[
              { label: "Empresas", to: "/companies" },
              { label: "Incluir Item", to: "/menu/create" },
              { label: "Relatórios", to: "/reports" },
              { label: "Administrador", to: "/administrator" },
            ]}
          />
        )}

        {isWaiter && (
          <Dropdown
            title="Garçom"
            items={[
              { label: "Mesas", to: "/tables" },
              { label: "Pedidos", to: "/orders" },
              { label: "Chamados", to: "/calls" },
            ]}
          />
        )}

        {user ? (
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        ) : (
          <Link to="/login" onClick={() => setOpen(false)}>
            Login
          </Link>
        )}
      </nav>
    </header>
  );
}
