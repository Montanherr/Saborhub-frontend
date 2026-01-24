import { useEffect, useReducer } from "react";
import { getRestaurantLogo } from "../../../utils/restaurantLogos";
import "./StoreHeader.css";

/* =========================
   MAPA DE DIAS
========================= */
const DAY_MAP = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

/* =========================
   ABERTO AGORA?
========================= */
function isStoreOpen(company) {
  if (
    !company.openingTime ||
    !company.closingTime ||
    !Array.isArray(company.workingDays)
  ) {
    return false;
  }

  const now = new Date();
  const currentDay = now.getDay();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const openToday = company.workingDays.some(
    (day) => DAY_MAP[day] === currentDay
  );
  if (!openToday) return false;

  const [openH, openM] = company.openingTime.split(":").map(Number);
  const [closeH, closeM] = company.closingTime.split(":").map(Number);

  const openMinutes = openH * 60 + openM;
  const closeMinutes = closeH * 60 + closeM;

  if (openMinutes < closeMinutes) {
    return currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
  }

  return currentMinutes >= openMinutes || currentMinutes <= closeMinutes;
}

/* =========================
   FORMATAR DIAS
========================= */
function formatWorkingDays(days = []) {
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

  const sorted = order.filter((d) => days.includes(d));

  if (sorted.length === 7) return "Todos os dias";

  if (sorted.length > 1) {
    const start = sorted[0];
    const end = sorted[sorted.length - 1];
    const isSequential =
      order.indexOf(end) - order.indexOf(start) + 1 === sorted.length;

    if (isSequential) {
      return `${labels[start]} a ${labels[end]}`;
    }
  }

  return sorted.map((d) => labels[d]).join(", ");
}

/* =========================
   COMPONENT
========================= */
export default function StoreHeader({ company }) {
  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  useEffect(() => {
    const interval = setInterval(() => {
      forceUpdate();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const imageSrc = company.image || getRestaurantLogo(company.fantasyName);
  const openNow = isStoreOpen(company);

  return (
    <div className="store-header">
      {/* ESQUERDA */}
      <div className="store-main">
        <img
          src={imageSrc}
          alt={company.fantasyName}
          className="store-logo"
          onError={(e) => {
            e.target.src = "/images/restaurant-placeholder.png";
          }}
        />

        <div className="store-info">
          <h1>{company.fantasyName}</h1>

          {company.description && (
            <p className="store-description">{company.description}</p>
          )}

          <span className={`store-status ${openNow ? "open" : "closed"}`}>
            {openNow ? "Aberto agora" : "Fechado"}
          </span>

          {company.deliveryTimeMin && company.deliveryTimeMax && (
            <div className="store-meta">
              ⏱ {company.deliveryTimeMin}–{company.deliveryTimeMax} min
            </div>
          )}

          {company.openingTime && company.closingTime && (
            <div className="store-hours">
              🕒 {company.openingTime.slice(0, 5)} às{" "}
              {company.closingTime === "00:00"
                ? "meia-noite"
                : company.closingTime.slice(0, 5)}
            </div>
          )}

          {company.workingDays && (
            <div className="store-days">
              📆 {formatWorkingDays(company.workingDays)}
            </div>
          )}
        </div>
      </div>

      {/* DIREITA */}
      <div className="store-right">
        {company.has_delivery_fee && company.delivery_fee != null ? (
          <div className="store-fee">
            🚚 Taxa de entrega
            <strong>
              R$ {Number(company.delivery_fee).toFixed(2)}
            </strong>
          </div>
        ) : (
          <div className="store-fee free">
            🚚 Entrega grátis
          </div>
        )}
      </div>
    </div>
  );
}
