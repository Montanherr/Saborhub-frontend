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

/* ======================
   CONFIG PAGINAÇÃO
====================== */
const CATEGORIES_PER_PAGE = 5;

/* ======================
   HELPER → PRÓXIMA ABERTURA
====================== */
function getNextOpening(company) {
  if (!company?.workingDays?.length || !company.openingTime) return null;

  const DAY_MAP = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
  };

  const DAY_LABEL = {
    sunday: "Domingo",
    monday: "Segunda",
    tuesday: "Terça",
    wednesday: "Quarta",
    thursday: "Quinta",
    friday: "Sexta",
    saturday: "Sábado",
  };

  const now = new Date(
    new Date().toLocaleString("en-US", {
      timeZone: "America/Sao_Paulo",
    })
  );

  const today = now.getDay();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const [openH, openM] = company.openingTime.split(":").map(Number);
  const openingMinutes = openH * 60 + openM;

  for (let i = 0; i < 7; i++) {
    const dayIndex = (today + i) % 7;
    const dayKey = Object.keys(DAY_MAP).find(
      (key) => DAY_MAP[key] === dayIndex
    );

    if (!company.workingDays.includes(dayKey)) continue;

    if (i === 0 && openingMinutes > currentMinutes) {
      return `Hoje às ${company.openingTime.slice(0, 5)}`;
    }

    if (i > 0) {
      return `${DAY_LABEL[dayKey]} às ${company.openingTime.slice(0, 5)}`;
    }
  }

  return null;
}

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
  const [showClosedModal, setShowClosedModal] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);

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
    if (!company?.open) {
      setShowClosedModal(true);
      return;
    }

    setExpandedCategory(expandedCategory === id ? null : id);
  };

  const addToOrder = (product) => {
    if (!company?.open || !product?.available) {
      setShowClosedModal(true);
      return;
    }

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
     PAGINAÇÃO
  ====================== */
  const totalPages = Math.ceil(
    categories.length / CATEGORIES_PER_PAGE
  );

  const paginatedCategories = categories.slice(
    (currentPage - 1) * CATEGORIES_PER_PAGE,
    currentPage * CATEGORIES_PER_PAGE
  );

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
          <MostSoldSection products={mostSold} onAdd={addToOrder} />
          <NewProductsSection products={newProducts} onAdd={addToOrder} />

          {/* 📂 CATEGORIAS */}
          <div className="category-grid">
            {paginatedCategories.map((category) => (
              <div key={category.id} className="category-card">
                <div className="category-header">
                  <h3>{category.name}</h3>

                  <button
                    className={!company?.open ? "btn-closed" : ""}
                    onClick={() => toggleCategory(category.id)}
                  >
                    {company?.open
                      ? expandedCategory === category.id
                        ? "Ocultar"
                        : "Ver produtos"
                      : `🔒 Fechado • Abre ${getNextOpening(company)}`}
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

          {/* 🔢 PAGINAÇÃO */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                ◀ Anterior
              </button>

              <span>
                Página {currentPage} de {totalPages}
              </span>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                Próxima ▶
              </button>
            </div>
          )}
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

      {/* 🔒 MODAL RESTAURANTE FECHADO */}
      {showClosedModal && (
        <div className="closed-modal">
          <div className="closed-box">
            <h2>🔒 Restaurante fechado</h2>
            <p>
              Abrimos{" "}
              <strong>{getNextOpening(company)}</strong>
            </p>
            <button onClick={() => setShowClosedModal(false)}>
              Entendi
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
