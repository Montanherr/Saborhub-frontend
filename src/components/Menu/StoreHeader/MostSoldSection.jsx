import "./ProductSection.css";

export default function MostSoldSection({ products, onAdd }) {
  if (!Array.isArray(products) || products.length === 0) return null;

  return (
    <section className="product-section">
      <div className="section-header">
        <h2>🔥 Mais vendidos</h2>
      </div>

      <div className="product-scroll">
        {products.map((product) => (
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

              <span className="price">
                R$ {Number(product.price).toFixed(2)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
