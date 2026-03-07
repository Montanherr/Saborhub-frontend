import { useState } from "react";
import "./MostSoldSection.css";

export default function MostSoldSection({ products, onAdd }) {

  const [expandedId, setExpandedId] = useState(null);

  if (!Array.isArray(products) || products.length === 0) return null;

  return (

    <section className="most-sold-section">

      <div className="most-sold-header">
        <h2>🔥 Mais vendidos</h2>
      </div>

      <div className="most-sold-scroll">

        {products.map((product) => {

          const isExpanded = expandedId === product.id;

          const basePrice = Number(product.price);
          const promoPrice = Number(product.promotion_value);

          const hasPromotion =
            product.promotion &&
            promoPrice > 0 &&
            promoPrice < basePrice;

          const finalPrice = hasPromotion ? promoPrice : basePrice;

          return (

          <div
  className="most-sold-card"
  key={product.id}
  onClick={() => onAdd?.(product)}
>

  <div className="most-sold-image">
    <img
      src={product.image || "/assets/default-product.png"}
      alt={product.name}
    />
  </div>

  <div className="most-sold-content">

    <strong className="most-sold-title">
      {product.name}
    </strong>

    <p className={`most-sold-description ${isExpanded ? "expanded" : ""}`}>
      {product.description}
    </p>

    {product.description?.length > 60 && (
      <small
        className="most-sold-see-more"
        onClick={(e) => {
          e.stopPropagation();
          setExpandedId(isExpanded ? null : product.id);
        }}
      >
        {isExpanded ? "Ver menos" : "Ver mais"}
      </small>
    )}

    <div className="most-sold-price-area">

      {hasPromotion && (
        <span className="most-sold-price-old">
          De R$ {basePrice.toFixed(2).replace(".", ",")}
        </span>
      )}

      <span className="most-sold-price">
        R$ {finalPrice.toFixed(2).replace(".", ",")}
      </span>

    </div>

  </div>

</div>

          );

        })}

      </div>

    </section>

  );

}