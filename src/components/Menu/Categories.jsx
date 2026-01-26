import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import categoryService from "../../services/categoriesService";
import companyService from "../../services/companyService";
import productService from "../../services/productService";

import ProductCard from "../../components/Menu/Product/ProductCard";
import StoreHeader from "../../components/Menu/StoreHeader/StoreHeader";
import OrdersModal from "../../components/Modal/Order/Order";

import MostSoldSection from "../../components/Menu/StoreHeader/MostSoldSection";
import NewProductsSection from "../../components/Menu/StoreHeader/NewProductsSection";

import { socket } from "../../socket/socket";

import "./Categories.css";

export default function Categories() {
  const { companyId } = useParams();

  const [company, setCompany] = useState(null);
  const [categories, setCategories] = useState([]);
  const [productsByCategory, setProductsByCategory] = useState({});
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  const [mostSold, setMostSold] = useState([]);
  const [newProducts, setNewProducts] = useState([]);

  const [orderItems, setOrderItems] = useState([]);
  const [showOrderModal, setShowOrderModal] = useState(false);

  /* ======================
     LOAD INICIAL
  ====================== */
  useEffect(() => {
    async function loadMenu() {
      try {
        setLoading(true);

        const [
          companyData,
          categoriesData,
          mostSoldData,
          newProductsData,
        ] = await Promise.all([
          companyService.getById(companyId),
          categoryService.getCategories(companyId),
          productService.getMostSoldProducts(companyId),
          productService.getNewProducts(companyId),
        ]);

        setCompany(companyData);
        setCategories(categoriesData);
        setMostSold(mostSoldData || []);
        setNewProducts(newProductsData || []);

        const grouped = {};
        categoriesData.forEach((category) => {
          grouped[category.id] =
            category.Products?.filter(Boolean) || [];
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
     SOCKET
  ====================== */
  useEffect(() => {
    if (!companyId) return;

    socket.connect();
    socket.emit("join_company", Number(companyId));

    const updateProduct = (product) => {
      if (!product?.categoryId) return;

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
     HELPERS
  ====================== */
  const toggleCategory = (id) => {
    setExpandedCategory(expandedCategory === id ? null : id);
  };

  const addToOrder = (product) => {
    if (!product?.available) return;

    setOrderItems((prev) => {
      const exists = prev.find((i) => i.id === product.id);

      if (exists) {
        return prev.map((i) =>
          i.id === product.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
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
      {company && <StoreHeader company={company} />}

      {loading ? (
        <p>Carregando cardápio...</p>
      ) : (
        <>
          <MostSoldSection
            products={mostSold}
            onAdd={addToOrder}
          />

          <NewProductsSection
            products={newProducts}
            onAdd={addToOrder}
          />

          {/* 📂 CATEGORIAS */}
          <div className="category-grid">
            {categories.map((category) => (
              <div key={category.id} className="category-card">
                <div className="category-header">
                  <h3>{category.name}</h3>
                  <button
                    onClick={() => toggleCategory(category.id)}
                  >
                    {expandedCategory === category.id
                      ? "Ocultar"
                      : "Ver produtos"}
                  </button>
                </div>

                {expandedCategory === category.id && (
                  <div className="product-grid">
                    {productsByCategory[
                      category.id
                    ]?.map((product) => (
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
        </>
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
