import { useEffect, useState, useCallback } from "react";
import categoryService from "../../services/categoriesService";
import productService from "../../services/productService";
import { toast } from "react-toastify";
import { socket } from "../../socket/socket";

import CategoryForm from "./CategoryForm";
import ProductForm from "./ProductForm";
import MenuPreview from "./MenuPreview";
import Tabs from "./Tabs";

import "./MenuCreate.css";

export default function MenuCreate() {
  const [activeTab, setActiveTab] = useState("preview");

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  const [editingCategory, setEditingCategory] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);

  const [loading, setLoading] = useState(false);

  const loggedCompanyId = Number(localStorage.getItem("companyId"));

  /* ======================
     LOAD CENTRALIZADO
  ====================== */
  const loadMenu = useCallback(async () => {
    try {
      if (!loggedCompanyId) return;

      setLoading(true);

      const categoriesData =
        await categoryService.getCategories(loggedCompanyId);

      const productsData =
        await productService.getProducts();

      setCategories(categoriesData);
      setProducts(
        productsData.filter(
          p => p.companyId === loggedCompanyId
        )
      );
    } catch (err) {
      console.error(err);
      toast.error("Erro ao carregar menu");
    } finally {
      setLoading(false);
    }
  }, [loggedCompanyId]);

  /* ======================
     LOAD INICIAL
  ====================== */
  useEffect(() => {
    loadMenu();
  }, [loadMenu]);

  /* ======================
     SOCKET
  ====================== */
  useEffect(() => {
    if (!loggedCompanyId) return;

    socket.emit("join_company", loggedCompanyId);

    socket.on("produto_criado", loadMenu);
    socket.on("product_updated", loadMenu);
    socket.on("product_deleted", loadMenu);

    return () => {
      socket.off("produto_criado", loadMenu);
      socket.off("product_updated", loadMenu);
      socket.off("product_deleted", loadMenu);
    };
  }, [loggedCompanyId, loadMenu]);

  /* ======================
     CATEGORY
  ====================== */
  async function handleSaveCategory(name) {
    try {
      if (editingCategory) {
        await categoryService.updateCategory(
          editingCategory.id,
          { name }
        );
        toast.info("Categoria atualizada!");
        setEditingCategory(null);
      } else {
        await categoryService.createCategory(
          loggedCompanyId,
          { name }
        );
        toast.success("Categoria criada!");
      }

      await loadMenu();
      setActiveTab("preview");
    } catch {
      toast.error("Erro ao salvar categoria");
    }
  }

  /* ======================
     PRODUCT
  ====================== */
  async function handleSaveProduct(productData) {
    try {
      const formData = new FormData();

      formData.append("name", productData.name);
      formData.append("description", productData.description || "");
      formData.append("price", Number(productData.price));
      formData.append("categoryId", Number(productData.categoryId));
      formData.append("companyId", loggedCompanyId);
      formData.append("available", "1");

      // PROMOÇÃO
      formData.append(
        "promotion",
        productData.promotion ? "1" : "0"
      );
      formData.append(
        "promotion_value",
        productData.promotion
          ? Number(productData.promotion_value)
          : 0
      );
      formData.append(
        "promotion_type",
        productData.promotion
          ? productData.promotion_type
          : "fixed"
      );

      // TAXA DE ENTREGA
      formData.append(
        "has_delivery_fee",
        productData.has_delivery_fee ? "1" : "0"
      );
      formData.append(
        "delivery_fee",
        productData.has_delivery_fee
          ? Number(productData.delivery_fee)
          : 0
      );

      if (productData.imageFile) {
        formData.append("image", productData.imageFile);
      }

      if (editingProduct) {
        await productService.updateProduct(
          editingProduct.id,
          formData
        );
        toast.info("Produto atualizado!");
      } else {
        await productService.createProduct(formData);
        toast.success("Produto criado!");
      }

      setEditingProduct(null);
      await loadMenu();
      setActiveTab("preview");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao salvar produto");
    }
  }

  return (
    <div className="menu-create-container">
      <h1>Gerenciar Menu</h1>

      <Tabs
        activeTab={activeTab}
        onChange={setActiveTab}
        tabs={[
          { id: "preview", label: "🧾 Preview do Menu" },
          { id: "manage", label: "⚙️ Gerenciar Menu" },
        ]}
      />

      {activeTab === "manage" && (
        <div className="forms-row">
          <CategoryForm
            onSubmit={handleSaveCategory}
            editingCategory={editingCategory}
            onCancelEdit={() => setEditingCategory(null)}
          />

          <ProductForm
            categories={categories}
            onSubmit={handleSaveProduct}
            editingProduct={editingProduct}
            onCancelEdit={() => setEditingProduct(null)}
          />
        </div>
      )}

      {activeTab === "preview" && (
        loading ? (
          <p className="loading">Carregando menu...</p>
        ) : (
          <MenuPreview
            categories={categories}
            products={products}
            onEdit={product => {
              setEditingProduct(product);
              setActiveTab("manage");
            }}
            onDelete={async product => {
              if (!window.confirm("Deseja remover este produto?")) return;

              await productService.deleteProduct(product.id);
              toast.warn("Produto excluído!");
              await loadMenu();
            }}
            onEditCategory={category => {
              setEditingCategory(category);
              setActiveTab("manage");
            }}
          />
        )
      )}
    </div>
  );
}
