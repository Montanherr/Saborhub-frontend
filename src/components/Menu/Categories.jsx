import { useEffect, useState, useReducer } from "react";
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

const CATEGORIES_PER_PAGE = 5;

const DAY_MAP = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

function isStoreOpen(company) {
  if (!company?.openingTime || !company?.closingTime || !Array.isArray(company?.workingDays)) {
    return false;
  }

  const now = new Date();
  const currentDay = now.getDay();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const openToday = company.workingDays.some(day => DAY_MAP[day] === currentDay);
  if (!openToday) return false;

  const [openH, openM] = company.openingTime.split(":").map(Number);
  const [closeH, closeM] = company.closingTime.split(":").map(Number);

  const openMinutes = openH * 60 + openM;
  const closeMinutes = closeH * 60 + closeM;

  return openMinutes < closeMinutes
    ? currentMinutes >= openMinutes && currentMinutes <= closeMinutes
    : currentMinutes >= openMinutes || currentMinutes <= closeMinutes;
}

export default function CategoriesScreen() {
  const { companySlug } = useParams();
  const [, forceUpdate] = useReducer(x => x + 1, 0);

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

  // Atualiza hora a cada minuto
  useEffect(() => {
    const interval = setInterval(() => forceUpdate(), 60000);
    return () => clearInterval(interval);
  }, []);

  // Load inicial do cardápio
  useEffect(() => {
    if (!companySlug) return;

    async function loadMenu() {
      try {
        setLoading(true);

        const companyData = await companyService.getBySlug(companySlug);
        if (!companyData) throw new Error("Empresa não encontrada");

        const [categoriesData, mostSoldData, newProductsData, productsData] = await Promise.all([
          categoryService.getCategories(companyData.id),
          productService.getMostSoldProducts(companyData.id),
          productService.getNewProducts(companyData.id),
          productService.getProductsByCompany(companyData.id), // ✅ Corrigido
        ]);

        // Agrupa produtos por categoria
        const grouped = {};
        categoriesData.forEach(cat => {
          grouped[cat.id] = productsData.filter(p => p.categoryId === cat.id);
        });

        setCompany(companyData);
        setCategories(categoriesData);
        setMostSold(mostSoldData || []);
        setNewProducts(newProductsData || []);
        setProductsByCategory(grouped);

      } catch (err) {
        console.error("Erro ao carregar cardápio:", err);
      } finally {
        setLoading(false);
      }
    }

    loadMenu();
  }, [companySlug]);

  // Socket para atualizações em tempo real
  useEffect(() => {
    if (!company?.id) return;

    socket.emit("join_company", company.id);

    const updateProduct = product => {
      if (!product?.categoryId) return;
      setProductsByCategory(prev => {
        const updated = { ...prev };
        const list = updated[product.categoryId] || [];
        updated[product.categoryId] = list.map(p => p.id === product.id ? { ...p, ...product } : p);
        return updated;
      });
    };

    socket.on("product_updated", updateProduct);
    socket.on("product_availability_updated", updateProduct);

    return () => {
      socket.off("product_updated", updateProduct);
      socket.off("product_availability_updated", updateProduct);
    };
  }, [company]);

  const openNow = isStoreOpen(company);

  const toggleCategory = id => {
    if (!openNow) {
      setShowClosedModal(true);
      return;
    }
    setExpandedCategory(expandedCategory === id ? null : id);
  };

  const addToOrder = product => {
    if (!openNow || !product?.available) {
      setShowClosedModal(true);
      return;
    }

    setOrderItems(prev => {
      const exists = prev.find(i => i.id === product.id);
      if (exists) {
        return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...product, quantity: 1 }];
    });

    setShowOrderModal(true);
  };

  const totalPages = Math.ceil(categories.length / CATEGORIES_PER_PAGE);
  const paginatedCategories = categories.slice(
    (currentPage - 1) * CATEGORIES_PER_PAGE,
    currentPage * CATEGORIES_PER_PAGE
  );

  return (
    <div className={`categories-container ${!openNow ? "store-closed" : ""}`}>
      {company && <StoreHeader company={company} openNow={openNow} />}

      {loading ? (
        <p className="loading">Carregando cardápio...</p>
      ) : (
        <>
          <MostSoldSection products={mostSold} onAdd={addToOrder} />
          <NewProductsSection products={newProducts} onAdd={addToOrder} />

          <div className="category-grid">
            {paginatedCategories.map(category => (
              <div key={category.id} className="category-card">
                <div className="category-header">
                  <h3>{category.name}</h3>
                  <button className={!openNow ? "btn-closed" : ""} onClick={() => toggleCategory(category.id)}>
                    {openNow
                      ? expandedCategory === category.id
                        ? "Ocultar"
                        : "Ver produtos"
                      : "🔒 Fechado"}
                  </button>
                </div>

                {expandedCategory === category.id && (
                  <div className="product-grid">
                    {productsByCategory[category.id]?.map(product => (
                      <ProductCard key={product.id} product={product} onAdd={addToOrder} />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>◀ Anterior</button>
              <span>Página {currentPage} de {totalPages}</span>
              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>Próxima ▶</button>
            </div>
          )}
        </>
      )}

      {showOrderModal && (
        <OrdersModal company={company} items={orderItems} setItems={setOrderItems} close={() => setShowOrderModal(false)} />
      )}

      {showClosedModal && (
        <div className="closed-modal">
          <div className="closed-box">
            <h2>🔒 Restaurante fechado</h2>
            <p>Estamos fora do horário de funcionamento.</p>
            <button onClick={() => setShowClosedModal(false)}>Entendi</button>
          </div>
        </div>
      )}
    </div>
  );
}
