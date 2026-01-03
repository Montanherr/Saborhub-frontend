import productService from "../../services/productService";
import "./MenuPreview.css";

export default function MenuPreview({
  categories,
  products,
  onEdit,
  onDelete,
  onEditCategory,
  onDeleteCategory,
}) {
  return (
    <>
      <h2 className="preview-title">Preview do Menu</h2>

      {categories.map((category) => {
        const categoryProducts = products.filter(
          (p) => p.categoryId === category.id
        );

        if (categoryProducts.length === 0) return null;

        return (
          <div key={category.id} className="preview-category">
            {/* HEADER DA CATEGORIA */}
            <div className="category-header">
              <h3>{category.name}</h3>

              <div className="category-actions">
                <button onClick={() => onEditCategory(category)}>✏️</button>
                <button onClick={() => onDeleteCategory(category)}>🗑️</button>
              </div>
            </div>

            {/* PRODUTOS */}
            <div className="preview-products">
              {categoryProducts.map((product) => {
                const hasPromotion =
                  product.promotion && Number(product.promotion_value) > 0;

                return (
                  <div
                    key={product.id}
                    className={`product-card ${
                      !product.available ? "inactive" : ""
                    }`}
                  >
                    {/* IMAGEM */}
                    {product.image && (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="product-img"
                      />
                    )}

                    {/* INFO */}
                    <div className="product-info">
                      <h4>{product.name}</h4>

                      {product.description && (
                        <p className="description">{product.description}</p>
                      )}

                      {/* PREÇOS */}
                      <div className="price-area">
                        {hasPromotion && (
                          <span className="price-old">
                            R$ {Number(product.price).toFixed(2)}
                          </span>
                        )}

                        <span className="price">
                          R${" "}
                          {Number(
                            hasPromotion
                              ? product.promotion_value
                              : product.price
                          ).toFixed(2)}
                        </span>
                      </div>

                      {/* TAXA DE ENTREGA */}
                      {product.has_delivery_fee && (
                        <div className="delivery-fee">
                          Taxa: R$ {Number(product.delivery_fee).toFixed(2)}
                        </div>
                      )}

                      {/* STATUS PROMO */}
                      {hasPromotion && (
                        <span className="promo-badge">PROMOÇÃO</span>
                      )}

                      {/* 🔥 TOGGLE DISPONIBILIDADE */}
                      <label className="toggle availability-toggle">
                        <input
                          type="checkbox"
                          checked={product.available}
                          onChange={() =>
                            productService.toggleProductAvailability(product.id)
                          }
                        />
                        {product.available ? "Ativo" : "Inativo"}
                      </label>

                      {/* AÇÕES */}
                      <div className="actions">
                        <button onClick={() => onEdit(product)}>Editar</button>
                        <button onClick={() => onDelete(product)}>
                          Excluir
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </>
  );
}
