import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import categoryService from "../../services/categoriesService";
import companyService from "../../services/companyService";

import ProductCard from "../../components/Menu/Product/ProductCard";
import OrdersModal from "../../components/Modal/Order/Order";
import { socket } from "../../socket/socket";

import "./Categories.css";

export default function Categories() {
  const { companyId } = useParams();

  const [company, setCompany] = useState(null);
  const [categories, setCategories] = useState([]);
  const [productsByCategory, setProductsByCategory] = useState({});
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  const [orderItems, setOrderItems] = useState([]);
  const [showOrderModal, setShowOrderModal] = useState(false);

  /* ======================
     LOAD INICIAL
  ====================== */
  useEffect(() => {
    async function loadMenu() {
      try {
        setLoading(true);

        const [companyData, categoriesData] = await Promise.all([
          companyService.getById(companyId),
          categoryService.getCategories(companyId),
        ]);

        setCompany(companyData);
        setCategories(categoriesData);

        // 🔥 Produtos já vêm dentro da categoria
        const grouped = {};
        categoriesData.forEach((category) => {
          grouped[category.id] = category.Products || [];
        });

        setProductsByCategory(grouped);
      } catch (err) {
        console.error("Erro ao carregar cardápio:", err);
      } finally {
        setLoading(false);
      }
    }

    if (companyId) loadMenu();
  }, [companyId]);

  /* ======================
     SOCKET (ATUALIZAÇÕES EM TEMPO REAL)
  ====================== */
  useEffect(() => {
    if (!companyId) return;

    socket.connect();
    socket.emit("join_company", Number(companyId));

    const updateProduct = (product) => {
      setProductsByCategory((prev) => {
        const updated = { ...prev };
        const list = updated[product.categoryId] || [];

        updated[product.categoryId] = list.map((p) =>
          p.id === product.id ? { ...p, ...product } : p
        );

        return updated;
      });
    };

    socket.on("product_updated", updateProduct);
    socket.on("product_availability_updated", updateProduct);

    return () => {
      socket.off("product_updated", updateProduct);
      socket.off("product_availability_updated", updateProduct);
    };
  }, [companyId]);

  /* ======================
     UI HELPERS
  ====================== */
  const toggleCategory = (id) => {
    setExpandedCategory(expandedCategory === id ? null : id);
  };

  const addToOrder = (product) => {
    if (!product.available) return;

    setOrderItems((prev) => {
      const exists = prev.find((i) => i.id === product.id);

      if (exists) {
        return prev.map((i) =>
          i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }

      return [...prev, { ...product, quantity: 1 }];
    });

    setShowOrderModal(true);
  };

  /* ======================
     RENDER
  ====================== */
  return (
    <div className="categories-container">
      <h2 className="menu-title">
        {company ? `Cardápio • ${company.fantasyName}` : "Carregando..."}
      </h2>

      {loading ? (
        <p>Carregando cardápio...</p>
      ) : (
        <div className="category-grid">
          {categories.map((category) => (
            <div key={category.id} className="category-card">
              <div className="category-header">
                <h3>{category.name}</h3>
                <button onClick={() => toggleCategory(category.id)}>
                  {expandedCategory === category.id
                    ? "Ocultar"
                    : "Ver produtos"}
                </button>
              </div>

              {expandedCategory === category.id && (
                <div className="product-grid">
                  {productsByCategory[category.id]?.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAdd={addToOrder}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

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
