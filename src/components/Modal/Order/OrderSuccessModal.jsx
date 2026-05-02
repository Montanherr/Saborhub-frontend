import { useEffect, useState } from "react";
import "./OrderSuccessModal.css";

export default function OrderSuccessModal({ onClose }) {
  const [status, setStatus] = useState("loading"); // loading | success

  useEffect(() => {
    // simula envio do pedido (ex: API)
    const timer = setTimeout(() => {
      setStatus("success");
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="success-backdrop">
      <div className="success-modal">

        {/* LOADING */}
        {status === "loading" && (
          <>
            <div className="loading-spinner"></div>

            <h2 className="success-title">
              Enviando seu pedido...
            </h2>

            <p className="success-description">
              Estamos conectando com o restaurante 🍔
            </p>
          </>
        )}

        {/* SUCESSO */}
        {status === "success" && (
          <>
            <div className="success-icon">✓</div>

            <h2 className="success-title">
              Pedido confirmado!
            </h2>

            <p className="success-description">
              Seu pedido foi enviado com sucesso e já está sendo preparado 👨‍🍳
            </p>

            {/* ORIENTAÇÃO */}
            <p className="success-tip">
              📲 Acompanhe seu pedido em tempo real pelo WhatsApp
            </p>

            <div className="success-actions">
              <button className="btn secondary" onClick={onClose}>
                Voltar ao cardápio
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
}