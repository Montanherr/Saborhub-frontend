import { useEffect, useState } from "react";
import categoryService from "../../../services/categoriesService";
import { toast } from "react-toastify";
import CategoryForm from "./CategoryForm";
import "./Categories.css";

export default function CategoryList() {
  const [categories, setCategories] = useState([]);
  const [editingCategory, setEditingCategory] = useState(null);
  const [loading, setLoading] = useState(false);

  const companyId = Number(localStorage.getItem("companyId"));

  useEffect(() => {
    loadCategories();
  }, [companyId]);

  async function loadCategories() {
    try {
      setLoading(true);
      const data = await categoryService.getCategories(companyId);
      setCategories(data);
    } catch {
      toast.error("Erro ao carregar categorias");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(name) {
    try {
      setLoading(true);

      if (editingCategory) {
        const updated = await categoryService.updateCategory(
          editingCategory.id,
          { name }
        );

        setCategories(prev =>
          prev.map(c => (c.id === updated.id ? updated : c))
        );

        toast.success("Categoria atualizada!");
        setEditingCategory(null);
      } else {
        const created = await categoryService.createCategory(
          companyId,
          { name }
        );

        setCategories(prev => [...prev, created]);
        toast.success("Categoria criada!");
      }
    } catch {
      toast.error("Erro ao salvar categoria");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(category) {
    if (!window.confirm("Excluir categoria?")) return;

    try {
      setLoading(true);
      await categoryService.deleteCategory(category.id);
      setCategories(prev => prev.filter(c => c.id !== category.id));
      toast.warn("Categoria excluída");
    } catch {
      toast.error("Erro ao excluir categoria");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-container">
      {loading && <div className="overlay">Carregando...</div>}

      <CategoryForm
        onSubmit={handleSave}
        editingCategory={editingCategory}
        onCancel={() => setEditingCategory(null)}
        loading={loading}
      />

      <div className="list card">
        <h2>Categorias</h2>

        {categories.length === 0 && (
          <p className="empty">Nenhuma categoria cadastrada</p>
        )}

        {categories.map(category => (
          <div key={category.id} className="list-item">
            <span>{category.name}</span>

            <div className="buttons">
              <button
                className="icon"
                onClick={() => setEditingCategory(category)}
              >
                ✏️
              </button>

              <button
                className="icon danger"
                onClick={() => handleDelete(category)}
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
