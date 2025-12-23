import "./ProductCard.css";

export default function ProductCard({
  product,
  onAdd,
  renderPromotion,
  finalPrice,
}) {
  const hasPromotion =
    product.promotion &&
    Number(product.promotion_value) > 0;

  return (
    <div className={`product-card ${hasPromotion ? "has-promotion" : ""}`}>
      <div className="image-wrapper">
        {renderPromotion(product)}
        <img
          src={product.image || "/assets/default-product.png"}
          alt={product.name}
          className="product-image"
        />
      </div>

      <div className="product-info">
        <div>
          <h4>{product.name}</h4>
          {product.description && <p>{product.description}</p>}
        </div>

        <div className="product-footer">
          <div className="price-area">
            {hasPromotion && (
              <span className="price-old">
                R$ {Number(product.price).toFixed(2).replace(".", ",")}
              </span>
            )}

            <span className="price">
              R$ {finalPrice.toFixed(2).replace(".", ",")}
            </span>

            {product.has_delivery_fee && (
              <span className="delivery-fee">
                Taxa R$ {Number(product.delivery_fee).toFixed(2).replace(".", ",")}
              </span>
            )}
          </div>

          <button onClick={() => onAdd(product)}>Adicionar</button>
        </div>
      </div>
    </div>
  );
}
