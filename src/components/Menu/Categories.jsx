// src/pages/Categories/Categories.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import categoryService from "../../services/categoriesService";
import productService from "../../services/productService";
import companyService from "../../services/companyService";

import ProductCard from "../../components/Menu/Product/ProductCard";
import OrdersModal from "../../components/Modal/Order/Order";

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

  useEffect(() => {
    async function loadMenu() {
      try {
        setLoading(true);

        const companyData = await companyService.getById(companyId);
        setCompany(companyData);

        const categoriesData = await categoryService.getCategories(companyId);
        setCategories(categoriesData);

        const productsData =
          await productService.getProductsByCompany(companyId);

        const grouped = {};
        categoriesData.forEach((category) => {
          grouped[category.id] = productsData.filter(
            (p) => p.categoryId === category.id
          );
        });

        setProductsByCategory(grouped);
      } catch (error) {
        console.error("Erro ao carregar cardápio:", error);
      } finally {
        setLoading(false);
      }
    }

    if (companyId) loadMenu();
  }, [companyId]);

  const toggleCategory = (categoryId) => {
    setExpandedCategory(
      expandedCategory === categoryId ? null : categoryId
    );
  };

  const addToOrder = (product) => {
    const exists = orderItems.find((i) => i.id === product.id);

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

  function hasValidPromotion(product) {
    return (
      product.promotion === true &&
      Number(product.promotion_value) > 0 &&
      product.promotion_type
    );
  }

  function calculateFinalPrice(product) {
    const price = Number(product.price);
    const discount = Number(product.promotion_value);

    if (!hasValidPromotion(product)) return price;

    if (product.promotion_type === "percentage") {
      return Math.max(price - (price * discount) / 100, 0);
    }

    // fixed
    return Math.max(price - discount, 0);
  }

  function renderPromotion(product) {
    if (!hasValidPromotion(product)) return null;

    return (
      <span className="promo-badge">
        {product.promotion_type === "percentage"
          ? `-${product.promotion_value}%`
          : `R$ ${Number(product.promotion_value)
              .toFixed(2)
              .replace(".", ",")}`}
      </span>
    );
  }

  return (
    <div className="categories-container">
      <h2 className="menu-title">
        {company
          ? `Cardápio • ${company.fantasyName}`
          : "Carregando cardápio..."}
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
                    ? "Ocultar"
                    : "Ver produtos"}
                </button>
              </div>

              {expandedCategory === category.id && (
                <div className="product-grid desktop-grid">
                  {productsByCategory[category.id]?.length > 0 ? (
                    productsByCategory[category.id].map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onAdd={addToOrder}
                        renderPromotion={renderPromotion}
                        finalPrice={calculateFinalPrice(product)}
                      />
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
