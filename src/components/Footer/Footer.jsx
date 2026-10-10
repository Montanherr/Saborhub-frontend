import React from "react";
import "./Footer.css";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="main-footer" aria-label="Rodapé SaborHub">
      <div className="main-footer__inner">
        <div className="main-footer__brand" aria-label="SaborHub">
          <span className="main-footer__mark">S</span>
          <span>SaborHub</span>
        </div>
        <span className="main-footer__divider" aria-hidden="true" />
        <p>
          © {currentYear} <span>SaborHub</span> · Todos os direitos reservados
        </p>
      </div>
    </footer>
  );
}
