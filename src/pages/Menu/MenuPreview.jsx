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

      {categories.map(category => {
        const categoryProducts = products.filter(
          p => p.categoryId === category.id
        );

        return (
          <div key={category.id} className="preview-category">
            <div className="category-header">
              <h3>{category.name}</h3>

              <div className="category-actions">
                <button onClick={() => onEditCategory(category)}>
                  ✏️
                </button>
                <button onClick={() => onDeleteCategory(category)}>
                  🗑️
                </button>
              </div>
            </div>

            {categoryProducts.length === 0 ? (
              <p className="empty-category">
                Nenhum produto nesta categoria
              </p>
            ) : (
              <div className="preview-products">
                {categoryProducts.map(product => (
                  <div key={product.id} className="product-card">
                    {product.image && (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="product-img"
                      />
                    )}

                    <h4>{product.name}</h4>
                    <p>{product.description}</p>
                    <p className="price">
                      R$ {Number(product.price).toFixed(2)}
                    </p>

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
                ))}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}
