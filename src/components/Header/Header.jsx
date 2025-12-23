import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import "./Header.css";

export default function Header() {
  const { user, logout } = useAuth();
  const isLoggedIn = !!user; // 🔥 AGORA FUNCIONA

  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="top-menu">
      <div className="logo">SaborHub</div>

      <button className="menu-toggle" onClick={() => setOpen(!open)}>
        ☰
      </button>

      <nav className={`menu-links ${open ? "open" : ""}`}>
        <Link to="/">Home</Link>
        <Link to="/companies">Restaurantes</Link>

        {isLoggedIn && (
          <>
             {["manager", "admin"].includes(user?.role) && (
              <>
                <Link to="/menu/create" className="admin-link">
                  Incluir Item
                </Link>

                <Link to="/reports" className="admin-link">
                  Relatórios
                </Link>
              </>
            )}

            {["manager", "admin", "waiter"].includes(user?.role) && (
              <Link to="/tables/">Mesas</Link>
            )}

            {["manager", "admin"].includes(user?.role) && (
              <Link to="/administrator/">Administrador</Link>
            )}

            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </>
        )}

        {!isLoggedIn && <Link to="/login">Login</Link>}
      </nav>
    </header>
  );
}
