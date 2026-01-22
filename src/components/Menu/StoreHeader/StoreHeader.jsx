import { getRestaurantLogo } from "../../../utils/restaurantLogos";
import "./StoreHeader.css";

export default function StoreHeader({ company }) {
  const imageSrc =
    company.image || getRestaurantLogo(company.fantasyName);

  return (
    <div className="store-header">
      <div className="store-main">
        <img
          src={imageSrc}
          alt={company.fantasyName}
          className="store-logo"
          onError={(e) => {
            e.target.src =
              "/images/restaurant-placeholder.png";
          }}
        />

        <div className="store-info">
          <h1>{company.fantasyName}</h1>

          {company.description && (
            <p className="store-description">
              {company.description}
            </p>
          )}

          <div className="store-meta">
            {company.deliveryTime && (
              <span>{company.deliveryTime} min</span>
            )}

            {company.minOrder && (
              <span>
                Pedido mínimo R${" "}
                {Number(company.minOrder)
                  .toFixed(2)
                  .replace(".", ",")}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
