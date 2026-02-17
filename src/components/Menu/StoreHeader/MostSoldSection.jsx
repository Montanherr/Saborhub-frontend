import "./ProductSection.css";

export default function MostSoldSection({ products, onAdd }) {
  if (!Array.isArray(products) || products.length === 0) return null;

  return (
    <section className="product-section">
      <div className="section-header">
        <h2>🔥 Mais vendidos</h2>
      </div>

      <div className="product-scroll">
        {products.map((product) => {
          const basePrice = Number(product.price);
          const promoPrice = Number(product.promotion_value);
          const hasPromotion =
            product.promotion && promoPrice > 0 && promoPrice < basePrice;
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
                <p>{product.description}</p>

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
