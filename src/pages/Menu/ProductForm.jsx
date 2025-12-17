import { useEffect, useState } from "react";

export default function ProductForm({
  categories,
  onSubmit,
  editingProduct,
  onCancelEdit,
}) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    imageFile: null,
    available: true,
    categoryId: "",
  });

  useEffect(() => {
    if (editingProduct) {
      setForm({
        name: editingProduct.name || "",
        description: editingProduct.description || "",
        price: editingProduct.price || "",
        imageFile: null, // não preencher com URL
        available: editingProduct.available,
        categoryId: editingProduct.categoryId || "",
      });
    }
  }, [editingProduct]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  function handleFileChange(e) {
    setForm(prev => ({ ...prev, imageFile: e.target.files[0] || null }));
  }

  function handleSubmit(e) {
    e.preventDefault();

    const payload = {
      ...form,
      price: Number(form.price),
      categoryId: Number(form.categoryId),
    };

    onSubmit(payload);

    // Resetar formulário
    setForm({
      name: "",
      description: "",
      price: "",
      imageFile: null,
      available: true,
      categoryId: "",
    });
  }

  return (
    <div className="form-box">
      <h2>{editingProduct ? "Editar Produto" : "Cadastrar Produto"}</h2>

      <form onSubmit={handleSubmit}>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Nome"
          required
        />

        <input
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Descrição"
        />

        <input
          name="price"
          type="number"
          value={form.price}
          onChange={handleChange}
          placeholder="Valor"
          required
        />

        <input
          type="file"
          name="imageFile"
          accept="image/*"
          onChange={handleFileChange}
        />

        <select
          name="categoryId"
          value={form.categoryId}
          onChange={handleChange}
          required
        >
          <option value="">Categoria</option>
          {categories.map(cat => (
            <option key={`cat-${cat.id}`} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        <button type="submit">
          {editingProduct ? "Salvar Alterações" : "Salvar Produto"}
        </button>

        {editingProduct && (
          <button type="button" onClick={onCancelEdit}>
            Cancelar
          </button>
        )}
      </form>
    </div>
  );
}
