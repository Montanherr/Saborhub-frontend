import { useEffect, useState } from "react";
import "./form-system.css";

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
    categoryId: "",
    imageFile: null,

    available: true,

    promotion: false,
    promotion_value: "",
  });

  /* ======================
     LOAD EDIÇÃO
  ====================== */
  useEffect(() => {
    if (!editingProduct) return;

    setForm({
      name: editingProduct.name ?? "",
      description: editingProduct.description ?? "",
      price: editingProduct.price ?? "",
      categoryId: Number(editingProduct.categoryId) || "",
      imageFile: null,

      available:
        editingProduct.available !== undefined
          ? editingProduct.available
          : true,

      promotion: Boolean(editingProduct.promotion),
      promotion_value: editingProduct.promotion
        ? editingProduct.promotion_value
        : "",
    });
  }, [editingProduct]);

  function update(name, value) {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  /* ======================
     SUBMIT
  ====================== */
  function handleSubmit(e) {
    e.preventDefault();

    if (
      form.promotion &&
      Number(form.promotion_value) >= Number(form.price)
    ) {
      return alert("O valor promocional deve ser menor que o preço original");
    }

    // 🔥 DEBUG OPCIONAL
    console.log("Arquivo selecionado:", form.imageFile);

    onSubmit({
      name: form.name,
      description: form.description,
      price: Number(form.price),
      categoryId: Number(form.categoryId),
      imageFile: form.imageFile,

      available: form.available,

      promotion: form.promotion,
      promotion_value: form.promotion ? Number(form.promotion_value) : 0,
    });
  }

  return (
    <div className="form-box">
      <h2>{editingProduct ? "Editar Produto" : "Cadastrar Produto"}</h2>

      <form className="form" onSubmit={handleSubmit}>
        {/* NOME */}
        <input
          className="input"
          placeholder="Nome"
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
          required
        />

        {/* DESCRIÇÃO */}
        <input
          className="input"
          placeholder="Descrição"
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
        />

        {/* PREÇO */}
        <input
          className="input"
          type="number"
          placeholder="Preço"
          value={form.price}
          onChange={(e) => update("price", e.target.value)}
          required
        />

        {/* IMAGEM */}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => update("imageFile", e.target.files[0])}
        />

        {/* CATEGORIA */}
        <select
          className="select"
          value={form.categoryId}
          onChange={(e) => update("categoryId", e.target.value)}
          required
        >
          <option value="">Categoria</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        {/* DISPONÍVEL */}
        <label className="toggle">
          <input
            type="checkbox"
            checked={form.available}
            onChange={(e) => update("available", e.target.checked)}
          />
          Produto disponível
        </label>

        {/* PROMOÇÃO */}
        <label className="toggle">
          <input
            type="checkbox"
            checked={form.promotion}
            onChange={(e) => update("promotion", e.target.checked)}
          />
          Promoção
        </label>

        {form.promotion && (
          <input
            className="input"
            type="number"
            placeholder="Valor promocional"
            value={form.promotion_value}
            onChange={(e) => update("promotion_value", e.target.value)}
            required
          />
        )}

        {/* BOTÕES */}
        <div className="actions">
          <button className="btn btn-primary" type="submit">
            Salvar
          </button>

          {editingProduct && (
            <button
              className="btn btn-secondary"
              type="button"
              onClick={onCancelEdit}
            >
              Cancelar
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
