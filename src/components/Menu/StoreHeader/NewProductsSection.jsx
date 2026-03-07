import { useState } from "react";
import "./ProductSection.css";

export default function NewProductsSection({ products, onAdd }) {

  const [expandedId, setExpandedId] = useState(null);

  if (!Array.isArray(products) || products.length === 0) return null;

  return (

    <section className="new-products-section">

      <div className="new-products-header">
        <h2>🆕 Novidades</h2>
      </div>

      <div className="new-products-list">

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
              className="new-products-card"
              key={product.id}
              onClick={() => onAdd?.(product)}
            >

              <div className="new-products-image">

                <img
                  src={product.image || "/assets/default-product.png"}
                  alt={product.name}
                />

              </div>

              <div className="new-products-content">

                <strong className="new-products-title">
                  {product.name}
                </strong>

                <p className={`new-products-description ${isExpanded ? "expanded" : ""}`}>
                  {product.description}
                </p>

                {product.description?.length > 60 && (

                  <small
                    className="new-products-see-more"
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedId(isExpanded ? null : product.id);
                    }}
                  >
                    {isExpanded ? "Ver menos" : "Ver mais"}
                  </small>

                )}

                <div className="new-products-price-area">

                  {hasPromotion && (
                    <span className="new-products-price-old">
                      De R$ {basePrice.toFixed(2).replace(".", ",")}
                    </span>
                  )}

                  <span className="new-products-price">
                    R$ {finalPrice.toFixed(2).replace(".", ",")}
                  </span>

                  {hasPromotion && (
                    <span className="new-products-promo-badge">
                      PROMOÇÃO
                    </span>
                  )}

                </div>

              </div>

            </div>

          );

        })}

      </div>

    </section>

  );

}