// src/pages/Categories/Categories.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import categoryService from "../../services/categoriesService";
import productService from "../../services/productService";
import companyService from "../../services/companyService";
import OrdersModal from "../../components/Modal/Order/Order";
import "./Categories.css";

export default function Categories() {
  const { companyId } = useParams();

  const [categories, setCategories] = useState([]);
  const [company, setCompany] = useState(null);
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [expandedCategory, setExpandedCategory] = useState(null);

  // Pedido
  const [orderItems, setOrderItems] = useState([]);
  const [showOrderModal, setShowOrderModal] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const comp = await companyService.getById(companyId);
        setCompany(comp);

        const cats = await categoryService.getCategories();
        const companyCats = cats.filter(
          (cat) => cat.companyId === Number(companyId)
        );
        setCategories(companyCats);

        // Buscar todos os produtos da empresa
        const allProducts = await productService.getProducts();
        const grouped = {};
        companyCats.forEach((cat) => {
          grouped[cat.id] = allProducts.filter((p) => p.categoryId === cat.id);
        });
        setProducts(grouped);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [companyId]);

  // Alterna categoria expandida
  const toggleCategory = (catId) => {
    setExpandedCategory(expandedCategory === catId ? null : catId);
  };

  // Adicionar produto ao pedido
  const addToOrder = (product) => {
    const exists = orderItems.find((item) => item.id === product.id);
    if (exists) {
      setOrderItems(
        orderItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setOrderItems([...orderItems, { ...product, quantity: 1 }]);
    }
    setShowOrderModal(true); // abrir modal ao adicionar
  };

  return (
    <div className="categories-container">
      <h2>{company ? `Cardápio - ${company.fantasyName}` : "Carregando..."}</h2>

      {loading ? (
        <p>Carregando categorias...</p>
      ) : categories.length === 0 ? (
        <p>Nenhuma categoria encontrada.</p>
      ) : (
        <div className="category-grid">
          {categories.map((cat) => (
            <div key={cat.id} className="category-card">
              <div className="category-header">
                <h3>{cat.name}</h3>
                <button onClick={() => toggleCategory(cat.id)}>
                  {expandedCategory === cat.id
                    ? "Ocultar produtos"
                    : "Ver mais"}
                </button>
              </div>

              {expandedCategory === cat.id && products[cat.id] && (
                <div className="product-grid">
                  {products[cat.id].map((prod) => (
                    <div className="product-card">
                      <img
                        src={prod.image || "/assets/default-product.png"}
                        alt={prod.name}
                        className="product-image"
                      />

                      <div className="product-info">
                        <div>
                          <h4>{prod.name}</h4>
                          {prod.description && <p>{prod.description}</p>}
                        </div>

                        <div className="product-footer">
                          <span className="price">
                            R$ {Number(prod.price).toFixed(2)}
                          </span>
                          <button onClick={() => addToOrder(prod)}>
                            Adicionar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal de pedidos */}
      {showOrderModal && (
        <OrdersModal
          company={company}
          items={orderItems}
          setItems={setOrderItems}
          close={() => setShowOrderModal(false)}
        />
      )}
    </div>
  );
}
