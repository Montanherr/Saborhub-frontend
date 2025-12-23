import { useEffect, useState } from "react";
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

  const loggedCompanyId = Number(localStorage.getItem("companyId"));

  const [editingCategory, setEditingCategory] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);

  /* ======================
     LOAD INICIAL
  ====================== */
  useEffect(() => {
    async function load() {
      try {
        if (!loggedCompanyId) return;

        const categoriesData =
          await categoryService.getCategories(loggedCompanyId);

        const productsData =
          await productService.getProducts();

        setCategories(categoriesData);

        setProducts(
          productsData.filter(
            (p) => p.companyId === loggedCompanyId
          )
        );
      } catch (err) {
        console.error(err);
        toast.error("Erro ao carregar menu");
      }
    }

    load();
  }, [loggedCompanyId]);

  /* ======================
     SOCKET
  ====================== */
  useEffect(() => {
    if (!loggedCompanyId) return;

    socket.emit("join_company", loggedCompanyId);

    socket.on("produto_criado", (product) => {
      if (product.companyId !== loggedCompanyId) return;

      setProducts((prev) => {
        const exists = prev.some(
          (p) => p.id === product.id
        );
        return exists ? prev : [...prev, product];
      });
    });

    socket.on("product_updated", (product) => {
      if (product.companyId !== loggedCompanyId) return;

      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id ? product : p
        )
      );
    });

    socket.on("product_deleted", ({ id }) => {
      setProducts((prev) =>
        prev.filter((p) => p.id !== id)
      );
    });

    return () => {
      socket.off("produto_criado");
      socket.off("product_updated");
      socket.off("product_deleted");
    };
  }, [loggedCompanyId]);

  /* ======================
     CATEGORY
  ====================== */
  async function handleSaveCategory(name) {
    try {
      if (editingCategory) {
        const updated =
          await categoryService.updateCategory(
            editingCategory.id,
            { name }
          );

        setCategories((prev) =>
          prev.map((c) =>
            c.id === updated.id ? updated : c
          )
        );

        toast.info("Categoria atualizada!");
        setEditingCategory(null);
      } else {
        const newCategory =
          await categoryService.createCategory(
            loggedCompanyId,
            { name }
          );

        setCategories((prev) => [
          ...prev,
          newCategory,
        ]);

        toast.success("Categoria criada!");
      }

      setActiveTab("preview");
    } catch {
      toast.error("Erro ao salvar categoria");
    }
  }

  /* ======================
     PRODUCT (🔥 CORRIGIDO)
  ====================== */
  async function handleSaveProduct(productData) {
    try {
      const formData = new FormData();

      formData.append("name", productData.name);
      formData.append(
        "description",
        productData.description || ""
      );
      formData.append(
        "price",
        Number(productData.price)
      );
      formData.append(
        "categoryId",
        Number(productData.categoryId)
      );
      formData.append(
        "companyId",
        loggedCompanyId
      );
      formData.append("available", "1");

      // PROMOÇÃO (SEGURA)
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
          : null
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
        formData.append(
          "image",
          productData.imageFile
        );
      }

      let savedProduct;

      if (editingProduct) {
        savedProduct =
          await productService.updateProduct(
            editingProduct.id,
            formData
          );

        setProducts((prev) =>
          prev.map((p) =>
            p.id === savedProduct.id
              ? savedProduct
              : p
          )
        );

        toast.info("Produto atualizado!");
      } else {
        savedProduct =
          await productService.createProduct(
            formData
          );

        setProducts((prev) => [
          ...prev,
          savedProduct,
        ]);

        toast.success("Produto criado!");
      }

      setEditingProduct(null);
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
            onCancelEdit={() =>
              setEditingCategory(null)
            }
          />

          <ProductForm
            categories={categories}
            onSubmit={handleSaveProduct}
            editingProduct={editingProduct}
            onCancelEdit={() =>
              setEditingProduct(null)
            }
          />
        </div>
      )}

      {activeTab === "preview" && (
        <MenuPreview
          categories={categories}
          products={products}
          onEdit={(product) => {
            setEditingProduct(product);
            setActiveTab("manage");
          }}
          onDelete={async (product) => {
            if (
              !window.confirm(
                "Deseja remover este produto?"
              )
            )
              return;

            await productService.deleteProduct(
              product.id
            );

            setProducts((prev) =>
              prev.filter(
                (p) => p.id !== product.id
              )
            );

            toast.warn("Produto excluído!");
          }}
          onEditCategory={(category) => {
            setEditingCategory(category);
            setActiveTab("manage");
          }}
        />
      )}
    </div>
  );
}
