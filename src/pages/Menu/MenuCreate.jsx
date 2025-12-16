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

  // PRODUCT EDIT STATE
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    async function load() {
      const categoriesData = await categoryService.getCategories();
      const productsData = await productService.getProducts();

      setCategories(categoriesData.filter(c => c.companyId === loggedCompanyId));
      setProducts(productsData.filter(p => p.companyId === loggedCompanyId));
    }
    load();
  }, [loggedCompanyId]);

  async function handleCreateCategory(name) {
    try {
      const newCategory = await categoryService.createCategory({
        name,
        companyId: loggedCompanyId,
      });
      setCategories(prev => [...prev, newCategory]);
      toast.success("Categoria criada!");
    } catch {
      toast.error("Erro ao criar categoria");
    }
  }

  async function handleSaveProduct(productData) {
    try {
      if (editingProduct) {
        await productService.updateProduct(editingProduct.id, productData);

        setProducts(prev =>
          prev.map(p =>
            p.id === editingProduct.id
              ? { ...p, ...productData, id: editingProduct.id }
              : p
          )
        );

        toast.info("Produto atualizado!");
      } else {
        const newProduct = await productService.createProduct(productData);
        setProducts(prev => [...prev, newProduct]);
        toast.success("Produto criado!");
      }

      setPageByCategory(prev => ({
        ...prev,
        [productData.categoryId]: 1,
      }));

      setEditingProduct(null);
    } catch {
      toast.error("Erro ao salvar produto");
    }
  }

  async function handleDeleteProduct(product) {
    if (!window.confirm("Deseja remover este produto?")) return;

    await productService.deleteProduct(product.id);

    setProducts(prev => prev.filter(p => p.id !== product.id));
    setPageByCategory(prev => ({ ...prev, [product.categoryId]: 1 }));

    toast.warn("Produto excluído!");
  }

  return (
    <div className="menu-create-container">
      <h1>Gerenciar Menu</h1>

      <div className="forms-row">
        <CategoryForm onSubmit={handleCreateCategory} />

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
        loggedCompanyId={loggedCompanyId}
      />
    </div>
  );
}
