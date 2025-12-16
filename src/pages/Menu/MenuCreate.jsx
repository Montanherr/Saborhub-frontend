import { useEffect, useState } from "react";
import categoryService from "../../services/categoriesService";
import productService from "../../services/productService";
import { toast } from "react-toastify";

import CategoryForm from "./CategoryForm";
import ProductForm from "./ProductForm";
import MenuPreview from "./MenuPreview";

import "./MenuCreate.css";

export default function MenuCreate() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [pageByCategory, setPageByCategory] = useState({});

  const loggedCompanyId = Number(localStorage.getItem("companyId"));
  const itemsPerPage = 3;

  const [editingCategory, setEditingCategory] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);

  // 🔹 LOAD INICIAL
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
          productsData.filter(p => p.companyId === loggedCompanyId)
        );
      } catch (err) {
        console.error(err);
        toast.error("Erro ao carregar menu");
      }
    }

    load();
  }, [loggedCompanyId]);

  // 🔹 CREATE / UPDATE CATEGORY
async function handleSaveCategory(name) {
  try {
    if (editingCategory) {
      const updated = await categoryService.updateCategory(
        editingCategory.id,
        { name }
      );

      // Atualiza categorias
      setCategories(prev =>
        prev.map(c =>
          c.id === updated.id ? updated : c
        )
      );

      // 🔥 FORÇA RE-RENDER DO PREVIEW
      setProducts(prev => [...prev]);

      toast.info("Categoria atualizada!");
      setEditingCategory(null);
    } else {
      const newCategory = await categoryService.createCategory(
        loggedCompanyId,
        { name }
      );

      setCategories(prev => [...prev, newCategory]);
      toast.success("Categoria criada!");
    }
  } catch (err) {
    console.error(err);
    toast.error("Erro ao salvar categoria");
  }
}


  // 🔹 CREATE / UPDATE PRODUCT
  async function handleSaveProduct(productData) {
    try {
      const payload = {
        ...productData,
        companyId: loggedCompanyId,
      };

      if (editingProduct) {
        await productService.updateProduct(
          editingProduct.id,
          payload
        );

        setProducts(prev =>
          prev.map(p =>
            p.id === editingProduct.id
              ? { ...p, ...payload }
              : p
          )
        );

        toast.info("Produto atualizado!");
      } else {
        const newProduct =
          await productService.createProduct(payload);

        setProducts(prev => [...prev, newProduct]);
        toast.success("Produto criado!");
      }

      setPageByCategory(prev => ({
        ...prev,
        [payload.categoryId]: 1,
      }));

      setEditingProduct(null);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao salvar produto");
    }
  }

  // 🔹 DELETE PRODUCT
  async function handleDeleteProduct(product) {
    if (!window.confirm("Deseja remover este produto?")) return;

    await productService.deleteProduct(product.id);

    setProducts(prev =>
      prev.filter(p => p.id !== product.id)
    );

    toast.warn("Produto excluído!");
  }

  // 🔹 EDIT CATEGORY
  function handleEditCategory(category) {
    setEditingCategory(category);
  }

  // 🔹 DELETE CATEGORY
  async function handleDeleteCategory(category) {
    if (!window.confirm("Excluir esta categoria?")) return;

    const hasProducts =
      products.some(p => p.categoryId === category.id);

    if (hasProducts) {
      toast.warning(
        "Remova os produtos da categoria primeiro"
      );
      return;
    }

    try {
      await categoryService.deleteCategory(category.id);

      setCategories(prev =>
        prev.filter(c => c.id !== category.id)
      );

      toast.warn("Categoria removida!");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao excluir categoria");
    }
  }

  return (
    <div className="menu-create-container">
      <h1>Gerenciar Menu</h1>

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

      <MenuPreview
        categories={categories}
        products={products}
        pageByCategory={pageByCategory}
        setPageByCategory={setPageByCategory}
        itemsPerPage={itemsPerPage}
        onEdit={setEditingProduct}
        onDelete={handleDeleteProduct}
        onEditCategory={handleEditCategory}
        onDeleteCategory={handleDeleteCategory}
      />
    </div>
  );
}
