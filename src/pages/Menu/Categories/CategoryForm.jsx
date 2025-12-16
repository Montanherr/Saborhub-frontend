import { useEffect, useState } from "react";

export default function CategoryForm({
  onSubmit,
  editingCategory,
  onCancel,
  loading
}) {
  const [name, setName] = useState("");

  useEffect(() => {
    if (editingCategory) {
      setName(editingCategory.name);
    } else {
      setName("");
    }
  }, [editingCategory]);

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit(name);
  }

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h2>
        {editingCategory ? "Editar Categoria" : "Nova Categoria"}
      </h2>

      <input
        type="text"
        placeholder="Nome da categoria"
        value={name}
        onChange={e => setName(e.target.value)}
        disabled={loading}
      />

      <div className="actions">
        <button type="submit" disabled={loading}>
          {editingCategory ? "Salvar alterações" : "Criar categoria"}
        </button>

        {editingCategory && (
          <button
            type="button"
            className="secondary"
            onClick={onCancel}
            disabled={loading}
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
