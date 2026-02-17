import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import companyService from "../../services/companyService";
import { getRestaurantLogo } from "../../utils/restaurantLogos";
import "./Companies.css";

/* ======================
   FORMATADORES (iFood)
====================== */

// ⏱ Tempo de entrega
function formatDeliveryTime(min, max) {
  if (!min && !max) return "Tempo de entrega não informado";
  if (min && max) return `${min}–${max} min`;
  if (min) return `A partir de ${min} min`;
  return `Até ${max} min`;
}

// 🕒 Horário de funcionamento
function formatOpeningHours(opening, closing) {
  if (!opening || !closing) return "Horário não informado";

  const open = opening.slice(0, 5);
  const close = closing.slice(0, 5);

  // Caso feche à meia-noite
  if (close === "00:00") {
    return `Das ${open} à meia-noite`;
  }

  return `Das ${open} às ${close}`;
}

// 📅 Dias de funcionamento (padrão iFood)
function formatWorkingDays(days = []) {
  if (!Array.isArray(days) || days.length === 0) {
    return "Dias não informados";
  }

  const labels = {
    monday: "Seg",
    tuesday: "Ter",
    wednesday: "Qua",
    thursday: "Qui",
    friday: "Sex",
    saturday: "Sáb",
    sunday: "Dom",
  };

  const order = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];

  // filtra apenas dias válidos e ordena
  const sorted = order.filter((d) => days.includes(d) && labels[d]);

  if (!sorted.length) return "Dias não informados";

  // todos os dias
  if (sorted.length === 7) return "Todos os dias";

  // dias consecutivos
  const startIndex = order.indexOf(sorted[0]);
  const endIndex = order.indexOf(sorted[sorted.length - 1]);
  const isSequential = endIndex - startIndex + 1 === sorted.length;

  if (isSequential && sorted.length > 1) {
    return `${labels[sorted[0]]} a ${labels[sorted[sorted.length - 1]]}`;
  }

  // dias isolados ou não sequenciais
  return sorted.map((d) => labels[d]).join(", ");
}

/* ======================
   COMPONENTE
====================== */
export default function Companies() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const itemsPerPage = 6;
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);

    companyService
      .getAll()
      .then((data) => {
        const filtered = data.filter(
          (company) => company.plan !== "suspended" && !company.isBlocked,
        );
        setRestaurants(filtered);
      })
      .catch((err) => console.error("Erro ao carregar restaurantes:", err))
      .finally(() => setLoading(false));
  }, []);

  const totalPages = Math.ceil(restaurants.length / itemsPerPage);
  const currentItems = restaurants.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage,
  );

 const handleViewMenu = (company) => {
  console.log("Navegando para:", company.slug);
  if (!company.slug) return alert("Empresa sem slug definido!");
  navigate(`/cardapio/${company.slug}`);
};


  /* ======================
     SKELETON CARD
  ====================== */
  const SkeletonCard = () => (
    <div className="restaurant-card skeleton">
      <div className="image-wrapper skeleton-box" />
      <div className="restaurant-info">
        <div className="skeleton-line title" />
        <div className="skeleton-line" />
        <div className="skeleton-line short" />
      </div>
    </div>
  );

  return (
    <div className="companies-container">
      <h2 className="companies-title">Restaurantes</h2>

      <div className="restaurant-grid">
        {loading ? (
          Array.from({ length: itemsPerPage }).map((_, index) => (
            <SkeletonCard key={index} />
          ))
        ) : currentItems.length === 0 ? (
          <p className="loading">Nenhum restaurante encontrado</p>
        ) : (
          currentItems.map((r) => {
            const imageSrc = r.image || getRestaurantLogo(r.fantasyName);

            return (
              <div
                key={r.id}
                className="restaurant-card"
                onClick={() => handleViewMenu(r)}
              >
                <div className="image-wrapper">
                  <img
                    src={imageSrc}
                    alt={r.fantasyName}
                    className="restaurant-image"
                    onError={(e) => {
                      e.target.src = "/images/restaurant-placeholder.png";
                    }}
                  />
                </div>

                <div className="restaurant-info">
                  <h3>{r.fantasyName}</h3>

                  <p className="restaurant-meta">
                    ⏱ {formatDeliveryTime(r.deliveryTimeMin, r.deliveryTimeMax)}
                  </p>

                  <p className="restaurant-meta">
                    🕒 {formatOpeningHours(r.openingTime, r.closingTime)}
                  </p>

                  <p className="restaurant-meta">
                    📅 {formatWorkingDays(r.workingDays)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {!loading && totalPages > 1 && (
        <div className="pagination">
          <button onClick={() => setPage(page - 1)} disabled={page === 1}>
            ◀
          </button>

          <span>
            {page} / {totalPages}
          </span>

          <button
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
          >
            ▶
          </button>
        </div>
      )}
    </div>
  );
}
