import { useEffect, useState, useCallback } from "react";
import additionalService from "../../../services/additionalService";
import toast, { Toaster } from "react-hot-toast";
import "./Additional.css";

export default function AdditionalManager({ companyId }) {
  console.log("🔥 companyId recebido:", companyId, typeof companyId);

  const [additionals, setAdditionals] = useState([]);
  const [form, setForm] = useState({ name: "", price: "" });
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);

  // Garantir que companyId seja number apenas para GET
  const parsedCompanyId = Number(companyId);

  // =========================
  // LOAD PADRÃO COM useCallback (resolve warning do useEffect)
  // =========================
  const loadAdditionals = useCallback(async () => {
    if (!parsedCompanyId) return; // evita chamadas com ID inválido
    try {
      const data = await additionalService.getAll(parsedCompanyId);
      setAdditionals(data);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao carregar adicionais");
    }
  }, [parsedCompanyId]);

  useEffect(() => {
    loadAdditionals();
  }, [loadAdditionals]);

  // =========================
  // CREATE / UPDATE
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || form.price === "") {
      toast.error("Preencha todos os campos");
      return;
    }

    try {
      setLoading(true);

      if (editing) {
        await additionalService.update(editing.id, {
          name: form.name,
          price: Number(form.price), // 🔹 sempre number
          companyId: Number(companyId), // envia o companyId
        });
        toast.success("Adicional atualizado");
      } else {
        await additionalService.create({
          name: form.name,
          price: form.price,
          companyId: Number(companyId), // envia o companyId
        });
        toast.success("Adicional criado");
      }

      setForm({ name: "", price: "" });
      setEditing(null);
      loadAdditionals();
    } catch (err) {
      console.error(err);
      toast.error("Erro ao salvar adicional");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // EDIT
  // =========================
  const handleEdit = (add) => {
    setEditing(add);
    setForm({
      name: add.name,
      price: add.price,
    });
  };

  // =========================
  // DELETE
  // =========================
  const handleDelete = (id) => {
    toast((t) => (
      <div className="toast-confirm">
        <p>Deseja excluir este adicional?</p>
        <div className="toast-actions">
          <button
            className="btn-confirm"
            onClick={async () => {
              try {
                await additionalService.remove(id);
                toast.dismiss(t.id);
                toast.success("Excluído com sucesso");
                loadAdditionals();
              } catch (err) {
                console.error(err);
                toast.error("Erro ao excluir");
              }
            }}
          >
            Sim
          </button>

          <button className="btn-cancel" onClick={() => toast.dismiss(t.id)}>
            Cancelar
          </button>
        </div>
      </div>
    ));
  };

  return (
    <div className="additional-container">
      <Toaster position="top-right" />

      {/* ===== FORM ===== */}
      <form className="additional-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Nome do adicional (Ex: Bacon)"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <input
          type="number"
          placeholder="Preço"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
        />

        <button type="submit" disabled={loading}>
          {editing ? "Atualizar" : "Cadastrar"}
        </button>

        {editing && (
          <button
            type="button"
            className="cancel-btn"
            onClick={() => {
              setEditing(null);
              setForm({ name: "", price: "" });
            }}
          >
            Cancelar
          </button>
        )}
      </form>

      {/* ===== LISTA ===== */}
      <div className="additional-list">
        {additionals.length === 0 && (
          <p className="empty">Nenhum adicional cadastrado</p>
        )}

        {additionals.map((add) => (
          <div key={add.id} className="additional-card">
            <div className="info">
              <strong>{add.name}</strong>
              <span>R$ {Number(add.price).toFixed(2)}</span>
            </div>

            <div className="actions">
              <button className="edit-btn" onClick={() => handleEdit(add)}>
                ✏️
              </button>

              <button
                className="delete-btn"
                onClick={() => handleDelete(add.id)}
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
