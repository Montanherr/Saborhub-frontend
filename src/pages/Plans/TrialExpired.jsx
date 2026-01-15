import { useNavigate } from "react-router-dom";
import "./TrialExpired.css";

export default function TrialExpired() {
  const navigate = useNavigate();

  return (
    <div className="trial-expired-container">
      <div className="trial-expired-card">
        <div className="trial-expired-icon">🚫</div>

        <h1>Cardápio indisponível</h1>

        <p>
          Este restaurante está temporariamente indisponível no momento.
        </p>

        <p className="secondary-text">
          Para mais informações, entre em contato com o estabelecimento.
        </p>

        <button
          className="back-home-button"
          onClick={() => navigate("/")}
        >
          Voltar para a Home
        </button>
      </div>
    </div>
  );
}
