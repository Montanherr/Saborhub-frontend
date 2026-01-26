import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import Dropdown from "../../components/Dropdown/Dropdown";
import "./Header.css";

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);

  const isLoggedOut = !user;
  const isAdmin = ["admin", "manager"].includes(user?.role);
  const isWaiter = ["admin", "manager", "waiter"].includes(user?.role);

  const closeMenu = () => setOpen(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
    closeMenu();
  };

  return (
    <header className="top-menu">
      {/* LOGO */}
      <div className="logo" onClick={() => navigate("/")}>
        SaborHub
      </div>

      {/* BOTÃO HAMBURGUER */}
      <button
        className="menu-toggle"
        onClick={() => setOpen(!open)}
        aria-label="Abrir menu"
      >
        ☰
      </button>

      {/* MENU */}
      <nav className={`menu-links ${open ? "open" : ""}`}>
        <Link to="/" onClick={closeMenu}>
          Home
        </Link>

        {/* VISÍVEL SOMENTE QUANDO NÃO LOGADO */}
        {isLoggedOut && (
          <Link to="/register" onClick={closeMenu}>
            Para Empresas
          </Link>
        )}

        {/* ADMIN */}
        {isAdmin && (
          <Dropdown
            title="Administração"
            items={[
              { label: "Empresas", to: "/companies" },
              { label: "Loja", to: "/menu/create" },
              { label: "Relatórios", to: "/reports" },
              { label: "Usuários", to: "/administrator" },

            ]}
            onSelect={closeMenu}
          />
        )}

        {/* GARÇOM */}
        {isWaiter && (
          <Dropdown
            title="Garçom"
            items={[
              { label: "Mesas", to: "/tables" },
              { label: "Pedidos", to: "/reports_orders" },
            ]}
            onSelect={closeMenu}
          />
        )}

        {/* AUTH */}
        {user ? (
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        ) : (
          <Link to="/login" onClick={closeMenu}>
            Login
          </Link>
        )}
      </nav>
    </header>
  );
}
