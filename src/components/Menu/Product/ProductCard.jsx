import "./ProductCard.css";

export default function ProductCard({ product, onAdd }) {
  const hasPromotion =
    product.promotion &&
    Number(product.promotion_value) > 0;

  const finalPrice = hasPromotion
    ? Number(product.promotion_value)
    : Number(product.price);

  const isUnavailable = !product.available;

  return (
    <div className={`ifood-card ${isUnavailable ? "inactive" : ""}`}>
      <div className="ifood-info">
        <h4>{product.name}</h4>

        {product.description && (
          <p>{product.description}</p>
        )}

        <div className="ifood-footer">
          <div className="prices">
            {hasPromotion && (
              <span className="price-old">
                R$ {Number(product.price).toFixed(2).replace(".", ",")}
              </span>
            )}

            <span className="price">
              R$ {finalPrice.toFixed(2).replace(".", ",")}
            </span>
          </div>

          {!isUnavailable && (
            <button onClick={() => onAdd(product)}>
              Adicionar
            </button>
          )}
        </div>

        {isUnavailable && (
          <span className="unavailable-label">
            Produto indisponível
          </span>
        )}
      </div>

      <div className="ifood-image">
        {hasPromotion && <span className="promo-badge">PROMO</span>}

        <img
          src={product.image || "/assets/default-product.png"}
          alt={product.name}
        />
      </div>
    </div>
  );
}
