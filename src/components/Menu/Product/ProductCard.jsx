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
    <div
      className={`product-card ${
        isUnavailable ? "inactive" : ""
      }`}
    >
      <div className="image-wrapper">
        {hasPromotion && (
          <span className="promo-badge">PROMO</span>
        )}

        <img
          src={
            product.image ||
            "/assets/default-product.png"
          }
          alt={product.name}
          className="product-image"
        />
      </div>

      <div className="product-info">
        <h4>{product.name}</h4>

        {product.description && (
          <p>{product.description}</p>
        )}

        <div className="price-area">
          {hasPromotion && (
            <span className="price-old">
              R${" "}
              {Number(product.price)
                .toFixed(2)
                .replace(".", ",")}
            </span>
          )}

          <span className="price">
            R${" "}
            {finalPrice
              .toFixed(2)
              .replace(".", ",")}
          </span>

          {product.has_delivery_fee && (
            <span className="delivery-fee">
              Taxa R${" "}
              {Number(product.delivery_fee)
                .toFixed(2)
                .replace(".", ",")}
            </span>
          )}
        </div>

        {isUnavailable ? (
          <div className="unavailable-label">
            Produto indisponível
          </div>
        ) : (
          <button onClick={() => onAdd(product)}>
            Adicionar
          </button>
        )}
      </div>
    </div>
  );
}
