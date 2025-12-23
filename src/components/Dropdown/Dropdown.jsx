import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Dropdown.css";

export default function Dropdown({ title, items }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Fecha ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="dropdown" ref={ref}>
      <button
        className="dropdown-btn"
        onClick={() => setOpen(!open)}
      >
        {title} ▾
      </button>

      {open && (
        <div className="dropdown-menu">
          {items.map((item, index) => (
            <Link
              key={index}
              to={item.to}
              className="dropdown-item"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
