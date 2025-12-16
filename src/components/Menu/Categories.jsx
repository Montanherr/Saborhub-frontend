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

  const [company, setCompany] = useState(null);
  const [categories, setCategories] = useState([]);
  const [productsByCategory, setProductsByCategory] = useState({});
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  // Pedido
  const [orderItems, setOrderItems] = useState([]);
  const [showOrderModal, setShowOrderModal] = useState(false);

  useEffect(() => {
    async function loadMenu() {
      try {
        setLoading(true);

        // 🔹 Empresa
        const companyData = await companyService.getById(companyId);
        setCompany(companyData);

        // 🔹 Categorias da empresa
        const categoriesData = await categoryService.getCategories(companyId);
        setCategories(categoriesData);

        // 🔹 Produtos da empresa
        const productsData =
          await productService.getProductsByCompany(companyId);

        // 🔹 Agrupar produtos por categoria
        const groupedProducts = {};
        categoriesData.forEach((category) => {
          groupedProducts[category.id] = productsData.filter(
            (product) => product.categoryId === category.id
          );
        });

        setProductsByCategory(groupedProducts);
      } catch (error) {
        console.error("Erro ao carregar cardápio:", error);
      } finally {
        setLoading(false);
      }
    }

    if (companyId) loadMenu();
  }, [companyId]);

  // Expandir / recolher categoria
  const toggleCategory = (categoryId) => {
    setExpandedCategory(
      expandedCategory === categoryId ? null : categoryId
    );
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

    setShowOrderModal(true);
  };

  return (
    <div className="categories-container">
      <h2>
        {company ? `Cardápio - ${company.fantasyName}` : "Carregando cardápio..."}
      </h2>

      {loading ? (
        <p>Carregando categorias...</p>
      ) : categories.length === 0 ? (
        <p>Nenhuma categoria encontrada.</p>
      ) : (
        <div className="category-grid">
          {categories.map((category) => (
            <div key={category.id} className="category-card">
              <div className="category-header">
                <h3>{category.name}</h3>
                <button onClick={() => toggleCategory(category.id)}>
                  {expandedCategory === category.id
                    ? "Ocultar produtos"
                    : "Ver produtos"}
                </button>
              </div>

              {expandedCategory === category.id && (
                <div className="product-grid">
                  {productsByCategory[category.id]?.length > 0 ? (
                    productsByCategory[category.id].map((product) => (
                      <div key={product.id} className="product-card">
                        <img
                          src={
                            product.image || "/assets/default-product.png"
                          }
                          alt={product.name}
                          className="product-image"
                        />

                        <div className="product-info">
                          <div>
                            <h4>{product.name}</h4>
                            {product.description && (
                              <p>{product.description}</p>
                            )}
                          </div>

                          <div className="product-footer">
                            <span className="price">
                              R$ {Number(product.price).toFixed(2)}
                            </span>
                            <button onClick={() => addToOrder(product)}>
                              Adicionar
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="empty-category">
                      Nenhum produto nesta categoria.
                    </p>
                  )}
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
