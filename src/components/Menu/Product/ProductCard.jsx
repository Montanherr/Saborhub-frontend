import "./ProductCard.css";

export default function ProductCard({ product, onAdd }) {
  const hasPromotion =
    product.promotion &&
    Number(product.promotion_value) > 0;

  const basePrice = Number(product.price);
  const promoPrice = Number(product.promotion_value);

  const finalPrice = hasPromotion ? promoPrice : basePrice;
  const isUnavailable = !product.available;

  return (
    <article
      className={`saborhub-card ${
        isUnavailable ? "saborhub-inactive" : ""
      }`}
    >
      <div className="saborhub-content">
        <h4 className="saborhub-title">{product.name}</h4>

        {product.description && (
          <p className="saborhub-description">
            {product.description}
          </p>
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
