import { useState, useRef, useEffect } from "react";
import "./ProductCard.css";

export default function ProductCard({ product, onAdd }) {
  const [expanded, setExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const descriptionRef = useRef(null);

  const hasPromotion =
    product.promotion &&
    Number(product.promotion_value) > 0;

  const basePrice = Number(product.price);
  const promoPrice = Number(product.promotion_value);
  const finalPrice = hasPromotion ? promoPrice : basePrice;

  const isUnavailable = !product.available;

  // 🔥 Detecta se o texto está realmente sendo cortado
  useEffect(() => {
    if (descriptionRef.current) {
      const el = descriptionRef.current;

      // Pequeno timeout garante cálculo correto após render
      setTimeout(() => {
        setIsOverflowing(el.scrollHeight > el.clientHeight);
      }, 0);
    }
  }, [product.description]);

  return (
    <article
      className={`saborhub-card ${
        isUnavailable ? "saborhub-inactive" : ""
      }`}
    >
      <div className="saborhub-content">
        <h4 className="saborhub-title">{product.name}</h4>

        {product.description && (
          <div className="saborhub-description-wrapper">
            <p
              ref={descriptionRef}
              className={`saborhub-description ${
                expanded ? "expanded" : ""
              }`}
            >
              {product.description}
            </p>

            {!expanded && isOverflowing && (
              <div className="saborhub-fade" />
            )}

            {isOverflowing && (
              <span
                className="saborhub-see-more"
                onClick={(e) => {
                  e.stopPropagation();
                  setExpanded(!expanded);
                }}
              >
                {expanded ? "Ver menos" : "Ver mais"}
              </span>
            )}
          </div>
        )}

        <div className="saborhub-footer">
          <div className="saborhub-prices">
            {hasPromotion && (
              <span className="saborhub-price-old">
                R$ {basePrice.toFixed(2).replace(".", ",")}
              </span>
            )}

            <span className="saborhub-price">
              R$ {finalPrice.toFixed(2).replace(".", ",")}
            </span>
          </div>

          {!isUnavailable && (
            <button
              className="saborhub-button"
              onClick={() => onAdd(product)}
            >
              + Adicionar
            </button>
          )}
        </div>

        {isUnavailable && (
          <span className="saborhub-unavailable">
            Produto indisponível
          </span>
        )}
      </div>

      <div className="saborhub-image">
        {hasPromotion && (
          <span className="saborhub-badge">
            Oferta
          </span>
        )}

        <img
          src={product.image || "/assets/default-product.png"}
          alt={product.name}
          loading="lazy"
        />
      </div>
    </article>
  );
}