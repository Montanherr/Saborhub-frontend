import { useState } from "react";
import "./ProductSection.css";

export default function NewProductsSection({ products, onAdd }) {
  const [expandedId, setExpandedId] = useState(null);

  if (!Array.isArray(products) || products.length === 0) return null;

  return (
    <section className="product-section">
      <div className="section-header">
        <h2>🆕 Novidades</h2>
      </div>

      <div className="product-scroll">
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
              className="product-card"
              key={product.id}
              onClick={() => onAdd?.(product)}
            >
              <img
                src={product.image || "/assets/default-product.png"}
                alt={product.name}
              />

              <div className="product-info">
                <strong>{product.name}</strong>
                <p className={`description ${isExpanded ? "expanded" : ""}`}>
                  {product.description}
                </p>

                {product.description?.length > 60 && (
                  <small
                    className="see-more"
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedId(isExpanded ? null : product.id);
                    }}
                  >
                    {isExpanded ? "Ver menos" : "Ver mais"}
                  </small>
                )}

                <div className="price-area">
                  {hasPromotion && (
                    <span className="price-old">
                      R$ {basePrice.toFixed(2).replace(".", ",")}
                    </span>
                  )}
                  <span className="price">
                    R$ {finalPrice.toFixed(2).replace(".", ",")}
                  </span>
                  {hasPromotion && <span className="promo-badge">PROMOÇÃO</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
