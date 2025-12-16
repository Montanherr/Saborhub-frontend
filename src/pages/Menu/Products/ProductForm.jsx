import { useEffect, useState } from "react";

export default function ProductForm({
  categories,
  editingProduct,
  onSubmit,
  onCancel,
  loading
}) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    imageUrl: "",
    categoryId: ""
  });

  useEffect(() => {
    if (editingProduct) {
      setForm(editingProduct);
    } else {
      setForm({
        name: "",
        description: "",
        price: "",
        imageUrl: "",
        categoryId: ""
      });
    }
  }, [editingProduct]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit(form);
  }

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h2>{editingProduct ? "Editar Produto" : "Novo Produto"}</h2>

      <input name="name" placeholder="Nome" value={form.name} onChange={handleChange} />
      <input name="description" placeholder="Descrição" value={form.description} onChange={handleChange} />
      <input name="price" placeholder="Preço" value={form.price} onChange={handleChange} />
      <input name="imageUrl" placeholder="Imagem URL" value={form.imageUrl} onChange={handleChange} />

      <select name="categoryId" value={form.categoryId} onChange={handleChange}>
        <option value="">Selecione a categoria</option>
        {categories.map(c => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>

      <div className="actions">
        <button disabled={loading}>
          {editingProduct ? "Salvar" : "Cadastrar"}
        </button>

        {editingProduct && (
          <button type="button" className="secondary" onClick={onCancel}>
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
