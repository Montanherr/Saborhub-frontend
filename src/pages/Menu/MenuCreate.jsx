import { useEffect, useState } from "react";
import categoryService from "../../services/categoriesService";
import productService from "../../services/productService";
import companyService from "../../services/companyService";
import { toast } from "react-toastify";
import "./MenuCreate.css";

export default function MenuCreate() {
  const [categories, setCategories] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [products, setProducts] = useState([]);

  // Pagination by category
  const [pageByCategory, setPageByCategory] = useState({});
  const itemsPerPage = 3;

  // AUTH
  const loggedCompanyId = Number(localStorage.getItem("companyId"));

  // CATEGORY STATES
  const [categoryName, setCategoryName] = useState("");
  const [categoryCompanyId, setCategoryCompanyId] = useState("");

  // PRODUCT STATES
  const [productIdEditing, setProductIdEditing] = useState(null);
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productImage, setProductImage] = useState("");
  const [productAvailable, setProductAvailable] = useState(true);
  const [productCompanyId, setProductCompanyId] = useState("");
  const [productCategoryId, setProductCategoryId] = useState("");

  // Load data
  useEffect(() => {
    async function load() {
      try {
        const companiesData = await companyService.getAll();
        const categoriesData = await categoryService.getCategories();
        const productsData = await productService.getProducts();

        setCompanies(companiesData);
        setCategories(categoriesData);
        setProducts(productsData);

        if (companiesData.length === 1) {
          setCategoryCompanyId(companiesData[0].id);
          setProductCompanyId(companiesData[0].id);
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    }
    load();
  }, []);

  // CREATE CATEGORY
  async function handleCreateCategory(e) {
    e.preventDefault();
    try {
      const newCategory = await categoryService.createCategory({
        name: categoryName,
        companyId: Number(categoryCompanyId),
      });
      setCategories((prev) => [...prev, newCategory]);
      setCategoryName("");
      toast.success("Categoria criada com sucesso!");
    } catch {
      toast.error("Erro ao criar categoria.");
    }
  }

  // CREATE OR UPDATE PRODUCT
  async function handleSubmitProduct(e) {
    e.preventDefault();

    const productData = {
      name: productName,
      description: productDescription,
      price: Number(productPrice),
      image: productImage || null,
      available: productAvailable,
      companyId: Number(productCompanyId),
      categoryId: Number(productCategoryId),
    };

    try {
      if (productIdEditing) {
        const updated = await productService.updateProduct(
          productIdEditing,
          productData
        );
        setProducts((prev) =>
          prev.map((p) => (p.id === productIdEditing ? updated : p))
        );
        toast.info("Produto atualizado!");
        setPageByCategory((prev) => ({ ...prev, [productCategoryId]: 1 }));
      } else {
        const newProduct = await productService.createProduct(productData);
        setProducts((prev) => [...prev, newProduct]);
        toast.success("Produto criado com sucesso!");
        setPageByCategory((prev) => ({ ...prev, [productCategoryId]: 1 }));
      }
      resetProductForm();
    } catch {
      toast.error("Erro ao salvar produto.");
    }
  }

  function resetProductForm() {
    setProductIdEditing(null);
    setProductName("");
    setProductDescription("");
    setProductPrice("");
    setProductImage("");
    setProductAvailable(true);
    setProductCategoryId("");
  }

  // EDIT PRODUCT
  function handleEditProduct(product) {
    setProductIdEditing(product.id);
    setProductName(product.name);
    setProductDescription(product.description);
    setProductPrice(product.price);
    setProductImage(product.image);
    setProductAvailable(product.available);
    setProductCompanyId(product.companyId);
    setProductCategoryId(product.categoryId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // DELETE PRODUCT
  async function handleDeleteProduct(id) {
    if (!window.confirm("Deseja realmente remover este produto?")) return;
    try {
      await productService.deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast.warn("Produto excluído!");
    } catch {
      toast.error("Erro ao excluir produto.");
    }
  }

  // PAGINATION per category
  const paginatedProducts = (categoryId) => {
    const currentPage = pageByCategory[categoryId] || 1;
    const filtered = products.filter((p) => p.categoryId === categoryId);
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return { currentPage, total: filtered.length, list: filtered.slice(start, end) };
  };

  return (
    <div className="menu-create-container">
      <h1>Gerenciar Menu</h1>

      {/* --- FORMS LADO A LADO --- */}
      <div className="forms-row">
        {/* CATEGORY FORM */}
        <div className="form-box">
          <h2>Cadastrar Categoria</h2>
          <form onSubmit={handleCreateCategory}>
            <label>Nome da Categoria</label>
            <input
              type="text"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              required
            />

            <label>Empresa</label>
            <select
              value={categoryCompanyId}
              onChange={(e) => setCategoryCompanyId(e.target.value)}
              required
            >
              <option value="">Selecione...</option>
              {companies.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.fantasyName}
                </option>
              ))}
            </select>

            <button type="submit">Salvar Categoria</button>
          </form>
        </div>

        {/* PRODUCT FORM */}
        {categories.length === 0 ? (
          <div className="form-box warning-box">
            ⚠️ Cadastre uma categoria antes!
          </div>
        ) : (
          <div className="form-box">
            <h2>{productIdEditing ? "Editar Produto" : "Cadastrar Produto"}</h2>
            <form onSubmit={handleSubmitProduct}>
              <label>Nome</label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                required
              />

              <label>Descrição</label>
              <input
                type="text"
                value={productDescription}
                onChange={(e) => setProductDescription(e.target.value)}
              />

              <label>Preço</label>
              <input
                type="number"
                step="0.01"
                value={productPrice}
                onChange={(e) => setProductPrice(e.target.value)}
                required
              />

              <label>Imagem (URL)</label>
              <input
                type="text"
                value={productImage}
                onChange={(e) => setProductImage(e.target.value)}
                placeholder="https://..."
              />

              <label>Disponível?</label>
              <select
                value={productAvailable}
                onChange={(e) => setProductAvailable(e.target.value === "true")}
              >
                <option value="true">Sim</option>
                <option value="false">Não</option>
              </select>

              <label>Empresa</label>
              <select
                value={productCompanyId}
                onChange={(e) => setProductCompanyId(e.target.value)}
                required
              >
                <option value="">Selecione...</option>
                {companies.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.fantasyName}
                  </option>
                ))}
              </select>

              <label>Categoria</label>
              <select
                value={productCategoryId}
                onChange={(e) => setProductCategoryId(e.target.value)}
                required
              >
                <option value="">Selecione...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>

              <button type="submit">
                {productIdEditing ? "Salvar Alterações" : "Salvar Produto"}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* --- PREVIEW --- */}
      <h2>Preview do Menu</h2>

      {categories.map((cat) => {
        const paginated = paginatedProducts(cat.id);
        return (
          <div key={cat.id} className="preview-category">
            <h3>{cat.name}</h3>

            <div className="preview-products">
              {paginated.list.map((p) => (
                <div key={p.id} className="product-card">
                  {p.image && <img src={p.image} alt={p.name} className="product-img" />}
                  <h4>{p.name}</h4>
                  <p>{p.description}</p>
                  <p className="price">R${Number(p.price).toFixed(2)}</p>

                  {p.companyId === loggedCompanyId && (
                    <div className="actions">
                      <button className="edit-btn" onClick={() => handleEditProduct(p)}>Editar</button>
                      <button className="delete-btn" onClick={() => handleDeleteProduct(p.id)}>Excluir</button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* PAGINATION */}
            {paginated.total > itemsPerPage && (
              <div className="pagination">
                <button
                  disabled={paginated.currentPage === 1}
                  onClick={() =>
                    setPageByCategory((prev) => ({ ...prev, [cat.id]: paginated.currentPage - 1 }))
                  }
                >
                  ◀
                </button>
                <span>Página {paginated.currentPage}</span>
                <button
                  disabled={paginated.currentPage * itemsPerPage >= paginated.total}
                  onClick={() =>
                    setPageByCategory((prev) => ({ ...prev, [cat.id]: paginated.currentPage + 1 }))
                  }
                >
                  ▶
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
