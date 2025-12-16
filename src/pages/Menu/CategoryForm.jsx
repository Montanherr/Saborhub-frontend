import { useEffect, useState, useCallback } from "react";
import productService from "../../services/productService";
import categoryService from "../../services/categoriesService";
import { toast } from "react-toastify";
import ProductForm from "./ProductForm";

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(false);

  const companyId = Number(localStorage.getItem("companyId"));

  // Função estável usando useCallback
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [p, c] = await Promise.all([
        productService.getProducts(),
        categoryService.getCategories(companyId)
      ]);

      setProducts(p.filter(p => p.companyId === companyId));
      setCategories(c);
    } catch {
      toast.error("Erro ao carregar produtos");
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  // useEffect depende apenas da função estável
  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleSave(data) {
    try {
      setLoading(true);

      if (editingProduct) {
        await productService.updateProduct(editingProduct.id, data);
        setProducts(prev =>
          prev.map(p => (p.id === editingProduct.id ? { ...p, ...data } : p))
        );
        toast.success("Produto atualizado!");
      } else {
        const created = await productService.createProduct({
          ...data,
          companyId
        });
        setProducts(prev => [...prev, created]);
        toast.success("Produto criado!");
      }

      setEditingProduct(null);
    } catch {
      toast.error("Erro ao salvar produto");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(product) {
    if (!window.confirm("Excluir produto?")) return;

    setLoading(true);
    await productService.deleteProduct(product.id);
    setProducts(prev => prev.filter(p => p.id !== product.id));
    setLoading(false);
    toast.warn("Produto removido");
  }

  return (
    <div className="page-container">
      {loading && <div className="overlay">Carregando...</div>}

      <ProductForm
        categories={categories}
        editingProduct={editingProduct}
        onSubmit={handleSave}
        onCancel={() => setEditingProduct(null)}
        loading={loading}
      />

      <div className="card">
        <h2>Produtos</h2>

        {products.map(p => (
          <div key={p.id} className="list-item">
            <span>{p.name}</span>

            <div className="buttons">
              <button onClick={() => setEditingProduct(p)}>✏️</button>
              <button className="danger" onClick={() => handleDelete(p)}>🗑️</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
