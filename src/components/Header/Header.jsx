import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import Dropdown from "../../components/Dropdown/Dropdown";
import "./Header.css";

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  const isLoggedOut = !user;
  const isAdmin = ["admin", "manager"].includes(user?.role);
  const isWaiter = ["admin", "manager", "waiter"].includes(user?.role);

  const closeMenu = () => setOpen(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
    closeMenu();
  };

  /* ✅ FECHA AO CLICAR FORA */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!menuRef.current) return;

      if (!menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  /* ✅ FECHA AO REDIMENSIONAR */
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <header className="top-menu" ref={menuRef}>
        <div className="logo" onClick={() => { navigate("/"); closeMenu(); }}>
          SaborHub
        </div>

        <button
          className="menu-toggle"
          onClick={(e) => {
            e.stopPropagation(); // evita conflito
            setOpen(!open);
          }}
          aria-label="Abrir menu"
        >
          ☰
        </button>

        <nav className={`menu-links ${open ? "open" : ""}`}>
          <Link to="/" onClick={closeMenu}>Home</Link>

          {isLoggedOut && (
            <Link to="/register" onClick={closeMenu}>
              Para Empresas
            </Link>
          )}

          {isAdmin && (
            <Dropdown
              title="Administração"
              items={[
                { label: "Empresas", to: "/companies" },
                { label: "Loja", to: "/menu/create" },
                { label: "Relatórios", to: "/reports" },
              ]}
              onSelect={closeMenu}
            />
          )}

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

      {/* ✅ OVERLAY MOBILE */}
      {open && <div className="menu-overlay" onClick={closeMenu}></div>}
    </>
  );
}
