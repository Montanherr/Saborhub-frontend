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

                <span className="price">
                  R$ {Number(product.price).toFixed(2)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
