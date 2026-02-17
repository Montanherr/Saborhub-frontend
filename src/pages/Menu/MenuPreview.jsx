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

      {categories.length === 0 && (
        <p className="empty-category">Nenhuma categoria cadastrada</p>
      )}

      {categories.map((category) => {
        const categoryProducts = products.filter(
          (p) => p.categoryId === category.id
        );

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
            {categoryProducts.length === 0 ? (
              <p className="empty-category">
                Nenhum produto nesta categoria
              </p>
            ) : (
              <div className="preview-products">
                {categoryProducts.map((product) => {
                  const hasPromotion =
                    product.promotion &&
                    Number(product.promotion_value) > 0;

                  const finalPrice = hasPromotion
                    ? product.promotion_value
                    : product.price;

                  return (
                    <div
                      key={product.id}
                      className={`product-card ${
                        !product.available ? "inactive" : ""
                      }`}
                    >
                      {/* IMAGEM */}
                      <div className="product-img-wrapper">
                        <img
                          src={
                            product.image
                              ? product.image
                              : "/assets/default-product.png"
                          }
                          alt={product.name}
                          className="product-img"
                        />
                      </div>

                      {/* INFO */}
                      <div className="product-info">
                        <h4>{product.name}</h4>

                        {product.description && (
                          <p className="description">
                            {product.description}
                          </p>
                        )}

                        {/* PREÇOS */}
                        <div className="price-area">
                          {hasPromotion && (
                            <span className="price-old">
                              R$ {Number(product.price).toFixed(2)}
                            </span>
                          )}

                          <span className="price">
                            R$ {Number(finalPrice).toFixed(2)}
                          </span>
                        </div>

                        {/* TAXA */}
                        {product.has_delivery_fee && (
                          <div className="delivery-fee">
                            Taxa: R$ {Number(product.delivery_fee).toFixed(2)}
                          </div>
                        )}

                        {/* PROMO */}
                        {hasPromotion && (
                          <span className="promo-badge">PROMOÇÃO</span>
                        )}

                        {/* DISPONIBILIDADE */}
                        <label className="availability-toggle">
                          <input
                            type="checkbox"
                            checked={product.available}
                            onChange={() =>
                              productService.toggleProductAvailability(
                                product.id
                              )
                            }
                          />
                          <span>
                            {product.available ? "Ativo" : "Inativo"}
                          </span>
                        </label>

                        {/* AÇÕES */}
                        <div className="actions">
                          <button
                            className="edit-btn"
                            onClick={() => onEdit(product)}
                          >
                            Editar
                          </button>

                          <button
                            className="delete-btn"
                            onClick={() => onDelete(product)}
                          >
                            Excluir
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}
