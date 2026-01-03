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

    available: true, // 🔥 NOVO

    promotion: false,
    promotion_value: "",

    has_delivery_fee: false,
    delivery_fee: "",
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
      categoryId: Number(editingProduct.categoryId),
      imageFile: null,

      available: editingProduct.available ?? true,

      promotion: !!editingProduct.promotion,
      promotion_value: editingProduct.promotion
        ? editingProduct.promotion_value
        : "",

      has_delivery_fee: !!editingProduct.has_delivery_fee,
      delivery_fee: editingProduct.has_delivery_fee
        ? editingProduct.delivery_fee
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
      return alert(
        "O valor promocional deve ser menor que o preço original"
      );
    }

    onSubmit({
      name: form.name,
      description: form.description,
      price: Number(form.price),
      categoryId: Number(form.categoryId),
      imageFile: form.imageFile,

      available: form.available, // 🔥

      promotion: form.promotion,
      promotion_value: form.promotion
        ? Number(form.promotion_value)
        : 0,

      has_delivery_fee: form.has_delivery_fee,
      delivery_fee: form.has_delivery_fee
        ? Number(form.delivery_fee)
        : 0,
    });
  }

  return (
    <div className="form-box">
      <h2>
        {editingProduct
          ? "Editar Produto"
          : "Cadastrar Produto"}
      </h2>

      <form className="form" onSubmit={handleSubmit}>
        <input
          className="input"
          placeholder="Nome"
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
          required
        />

        <input
          className="input"
          placeholder="Descrição"
          value={form.description}
          onChange={(e) =>
            update("description", e.target.value)
          }
        />

        <input
          className="input"
          type="number"
          placeholder="Preço"
          value={form.price}
          onChange={(e) =>
            update("price", e.target.value)
          }
          required
        />

        <input
          type="file"
          onChange={(e) =>
            update("imageFile", e.target.files[0])
          }
        />

        <select
          className="select"
          value={form.categoryId}
          onChange={(e) =>
            update("categoryId", e.target.value)
          }
          required
        >
          <option value="">Categoria</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        {/* 🔥 DISPONIBILIDADE */}
        <label className="toggle">
          <input
            type="checkbox"
            checked={form.available}
            onChange={(e) =>
              update("available", e.target.checked)
            }
          />
          Produto disponível
        </label>

        {/* PROMOÇÃO */}
        <label className="toggle">
          <input
            type="checkbox"
            checked={form.promotion}
            onChange={(e) =>
              update("promotion", e.target.checked)
            }
          />
          Promoção
        </label>

        {form.promotion && (
          <input
            className="input"
            type="number"
            placeholder="Valor promocional"
            value={form.promotion_value}
            onChange={(e) =>
              update("promotion_value", e.target.value)
            }
            required
          />
        )}

        {/* TAXA ENTREGA */}
        <label className="toggle">
          <input
            type="checkbox"
            checked={form.has_delivery_fee}
            onChange={(e) =>
              update("has_delivery_fee", e.target.checked)
            }
          />
          Taxa de entrega
        </label>

        {form.has_delivery_fee && (
          <input
            className="input"
            type="number"
            placeholder="Valor da taxa"
            value={form.delivery_fee}
            onChange={(e) =>
              update("delivery_fee", e.target.value)
            }
          />
        )}

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
