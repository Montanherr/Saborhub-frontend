export default function MenuPreview({
  categories,
  products,
  pageByCategory,
  setPageByCategory,
  itemsPerPage,
  onEdit,
  onDelete,
  loggedCompanyId,
}) {
  function paginated(categoryId) {
    const page = pageByCategory[categoryId] || 1;
    const filtered = products.filter(p => p.categoryId === categoryId);
    return filtered.slice(
      (page - 1) * itemsPerPage,
      page * itemsPerPage
    );
  }

  return (
    <>
      <h2>Preview do Menu</h2>

      {categories.map(cat => (
        <div
          key={`category-${cat.id}`}
          className="preview-category"
        >
          <h3>{cat.name}</h3>

          <div className="preview-products">
            {paginated(cat.id).map(p => (
              <div
                key={`product-${p.id}`}
                className="product-card"
              >
                {p.image && (
                  <img
                    src={p.image}
                    alt={p.name}
                    className="product-img"
                  />
                )}

                <h4>{p.name}</h4>
                <p>{p.description}</p>
                <p className="price">
                  R${Number(p.price).toFixed(2)}
                </p>

                {p.companyId === loggedCompanyId && (
                  <div className="actions">
                    <button
                      className="edit-btn"
                      onClick={() => onEdit(p)}
                    >
                      Editar
                    </button>

                    <button
                      className="delete-btn"
                      onClick={() => onDelete(p.id)}
                    >
                      Excluir
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}
