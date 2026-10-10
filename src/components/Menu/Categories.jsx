import { useEffect, useState, useReducer } from "react";
import { useParams } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import categoryService from "../../services/categoriesService";
import companyService from "../../services/companyService";
import productService from "../../services/productService";

import ProductCard from "../../components/Menu/Product/ProductCard";
import StoreHeader from "../../components/Menu/StoreHeader/StoreHeader";
import OrdersModal from "../../components/Modal/Order/Order";

import MostSoldSection from "../../components/Menu/StoreHeader/MostSoldSection";

import { socket } from "../../socket/socket";

import "./Categories.css";

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
  if (
    !company?.openingTime ||
    !company?.closingTime ||
    !Array.isArray(company?.workingDays)
  ) {
    return false;
  }

  const now = new Date();
  const currentDay = now.getDay();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const openToday = company.workingDays.some(
    (day) => DAY_MAP[day] === currentDay,
  );
  if (!openToday) return false;

  const [openH, openM] = company.openingTime.split(":").map(Number);
  const [closeH, closeM] = company.closingTime.split(":").map(Number);

  const openMinutes = openH * 60 + openM;
  const closeMinutes = closeH * 60 + closeM;

  return openMinutes < closeMinutes
    ? currentMinutes >= openMinutes && currentMinutes <= closeMinutes
    : currentMinutes >= openMinutes || currentMinutes <= closeMinutes;
}

function MenuSkeleton() {
  return (
    <div className="menu-skeleton" role="status" aria-label="Carregando cardápio">
      <div className="menu-skeleton__store">
        <span className="menu-skeleton__logo" />
        <div><span className="menu-skeleton__title" /><span className="menu-skeleton__line" /></div>
      </div>
      <div className="menu-skeleton__chips">{[1, 2, 3, 4].map((item) => <span key={item} />)}</div>
      <span className="menu-skeleton__search" />
      <span className="menu-skeleton__heading" />
      <div className="menu-skeleton__products">
        {[1, 2, 3, 4].map((item) => <div className="menu-skeleton__product" key={item}><span /><div><i /><i /><b /></div></div>)}
      </div>
    </div>
  );
}

export default function CategoriesScreen() {
  const { companySlug } = useParams();
  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  const [company, setCompany] = useState(null);
  const [categories, setCategories] = useState([]);
  const [productsByCategory, setProductsByCategory] = useState({});
  const [loading, setLoading] = useState(true);
  const [hasCustomerData, setHasCustomerData] = useState(false);
  const [mostSold, setMostSold] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryPages, setCategoryPages] = useState({});

  const [orderItems, setOrderItems] = useState([]);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showClosedModal, setShowClosedModal] = useState(false);

  // atualização automática da hora
  useEffect(() => {
    const interval = setInterval(() => forceUpdate(), 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!companySlug) return;

    async function loadMenu() {
      try {
        setLoading(true);

        // 1️⃣ Pegar dados da empresa
        const companyData = await companyService.getBySlug(companySlug);
        if (!companyData) throw new Error("Empresa não encontrada");

        // 2️⃣ Pegar categorias, produtos mais vendidos e todos os produtos
        const [categoriesData, mostSoldData, allProductsData] =
          await Promise.all([
            categoryService.getCategories(companyData.id),
            productService.getMostSoldProducts(companyData.id),
            productService.getProductsByCompany(companyData.id),
          ]);

        // 3️⃣ Agrupar produtos por categoria
        const grouped = {};
        categoriesData.forEach((cat) => {
          grouped[cat.id] = allProductsData.filter(
            (p) => p.categoryId === cat.id,
          );
        });

        // 4️⃣ Atualizar estados
        setCompany(companyData);
        setCategories(categoriesData);
        setMostSold(mostSoldData || []);
        setProductsByCategory(grouped);
      } catch (err) {
        console.error("Erro ao carregar cardápio:", err);
      } finally {
        setLoading(false);
      }
    }

    loadMenu();
  }, [companySlug]);

  // websocket atualização produtos
  useEffect(() => {
    if (!company?.id) return;

    socket.emit("join_company", company.id);

    const updateProduct = (product) => {
      if (!product?.categoryId) return;

      setProductsByCategory((prev) => {
        const updated = { ...prev };

        const list = updated[product.categoryId] || [];

        updated[product.categoryId] = list.map((p) =>
          p.id === product.id ? { ...p, ...product } : p,
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
  }, [company]);

  const openNow = isStoreOpen(company);

const addToOrder = (product) => {
  if (!openNow || !product?.available) {
    setShowClosedModal(true);
    return;
  }

  const newItem = {
    ...product,
    quantity: 1,
    uniqueId: uuidv4(), // 🔥 chave única
    additionals: [],
  };

  setOrderItems((prev) => [...prev, newItem]);
};

  const scrollToCategory = (id) => {
    const element = document.getElementById(`category-${id}`);

    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const changeCategoryPage = (categoryId, nextPage) => {
    setCategoryPages((previous) => ({
      ...previous,
      [categoryId]: nextPage,
    }));

    document.getElementById(`category-${categoryId}`)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div className={`categories-container ${!openNow ? "store-closed" : ""}`}>
      {company && <StoreHeader company={company} openNow={openNow} />}

      {loading ? (
        <MenuSkeleton />
      ) : (
        <>
          {/* MENU DE CATEGORIAS */}

          <div className="categories-menu">
            {categories.map((cat) => (
              <button key={cat.id} onClick={() => scrollToCategory(cat.id)}>
                {cat.name}
              </button>
            ))}
          </div>

          <div className="menu-toolbar">
            <div className="menu-toolbar__intro">
              <span>EXPLORE O CARDÁPIO</span>
              <strong>{searchTerm ? "Resultados da busca" : "Escolha seus favoritos"}</strong>
            </div>
            <label className="menu-search">
              <span aria-hidden="true">⌕</span>
              <input
                type="search"
                placeholder="Buscar no cardápio"
                value={searchTerm}
                onChange={(event) => {
                  setSearchTerm(event.target.value);
                  setCategoryPages({});
                }}
              />
            </label>
            {searchTerm && (
              <button className="clear-search" onClick={() => setSearchTerm("")}>
                Limpar busca
              </button>
            )}
          </div>

          {/* SEÇÕES ESPECIAIS */}

          <MostSoldSection products={mostSold} onAdd={addToOrder} />

          {/* LISTA DE CATEGORIAS */}

          <div className="categories-sections">
            {categories.map((category) => {
              const products = productsByCategory[category.id] || [];
              const normalizedSearch = searchTerm.trim().toLowerCase();
              const filteredProducts = normalizedSearch
                ? products.filter((product) =>
                    [product.name, product.description]
                      .filter(Boolean)
                      .some((value) => String(value).toLowerCase().includes(normalizedSearch)),
                  )
                : products;

              if (!filteredProducts.length) return null;

              const productsPerPage = 6;
              const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
              const currentPage = Math.min(categoryPages[category.id] || 1, totalPages);
              const visibleProducts = filteredProducts.slice(
                (currentPage - 1) * productsPerPage,
                currentPage * productsPerPage,
              );

              return (
                <section
                  key={category.id}
                  id={`category-${category.id}`}
                  className="category-section"
                >
                  <h2 className="category-title">{category.name}</h2>

                  <div className="product-grid">
                    {visibleProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onAdd={addToOrder}
                      />
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <div className="category-pagination" aria-label={`Paginação de ${category.name}`}>
                      <button
                        onClick={() => changeCategoryPage(category.id, currentPage - 1)}
                        disabled={currentPage === 1}
                        aria-label="Página anterior"
                      >
                        ←
                      </button>
                      <span>{currentPage} / {totalPages}</span>
                      <button
                        onClick={() => changeCategoryPage(category.id, currentPage + 1)}
                        disabled={currentPage === totalPages}
                        aria-label="Próxima página"
                      >
                        →
                      </button>
                    </div>
                  )}
                </section>
              );
            })}
            {!categories.some((category) => (productsByCategory[category.id] || []).some((product) => [product.name, product.description].filter(Boolean).some((value) => String(value).toLowerCase().includes(searchTerm.trim().toLowerCase())))) && searchTerm && (
              <div className="menu-empty-search">Nenhum produto encontrado para “{searchTerm}”.</div>
            )}
          </div>
        </>
      )}
      {/* CARRINHO FLUTUANTE */}
      {orderItems.length > 0 && (
        <div className="floating-cart" onClick={() => setShowOrderModal(true)}>
          <div className="cart-left">
            🛒 {orderItems.reduce((a, b) => a + b.quantity, 0)} itens
          </div>

          <div className="cart-right">Ver carrinho</div>
        </div>
      )}
      {showOrderModal && (
        <OrdersModal
          company={company}
          items={orderItems}
          setItems={setOrderItems}
          close={() => setShowOrderModal(false)}
          initialStep={hasCustomerData ? 1 : 0}
          setHasCustomerData={setHasCustomerData}
        />
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
