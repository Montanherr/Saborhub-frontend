import { useEffect, useState } from "react";
import "./Company.css";
import { socket } from "../../../socket/socket";
import { toast } from "react-toastify";



const WEEK_DAYS = [
  { label: "Segunda", value: "monday" },
  { label: "Terça", value: "tuesday" },
  { label: "Quarta", value: "wednesday" },
  { label: "Quinta", value: "thursday" },
  { label: "Sexta", value: "friday" },
  { label: "Sábado", value: "saturday" },
  { label: "Domingo", value: "sunday" },
];

export default function CompanyForm({
  onCreate,
  onUpdate,
  editingCompany,
  cancelEdit,
}) {
  const [form, setForm] = useState({
    fantasyName: "",
    corporateName: "",
    document: "",
    phone: "",
    email: "",
    promotion: false,
    plan: "trial",
    trialEndsAt: "",
    isBlocked: false,
    has_delivery_fee: false,
    delivery_fee: "",
    deliveryTimeMin: "",
    deliveryTimeMax: "",
    openingTime: "",
    closingTime: "",
    workingDays: [],
    image: null,
    open: false, // 👈 FLAG
  });

  const [preview, setPreview] = useState(null);

  const [loading, setLoading] = useState(false);

  // =========================
  // SOCKET → STATUS AO VIVO
  // =========================
  useEffect(() => {
    const handleStatusUpdate = ({ companyId, open }) => {
      if (companyId !== editingCompany?.id) return;

      setForm((prev) => ({
        ...prev,
        open,
      }));
    };

    socket.on("company_status_updated", handleStatusUpdate);

    return () => {
      socket.off("company_status_updated", handleStatusUpdate);
    };
  }, [editingCompany]);
  // =========================
  // PREENCHE AO EDITAR
  // =========================
  useEffect(() => {
    if (editingCompany) {
      setForm({
        fantasyName: editingCompany.fantasyName || "",
        corporateName: editingCompany.corporateName || "",
        document: editingCompany.document || "",
        phone: editingCompany.phone || "",
        email: editingCompany.email || "",
        promotion: editingCompany.promotion || false,
        plan: editingCompany.plan || "trial",
        trialEndsAt: editingCompany.trialEndsAt || "",
        isBlocked: editingCompany.isBlocked || false,
        has_delivery_fee: editingCompany.has_delivery_fee || false,
        delivery_fee: editingCompany.delivery_fee || "",
        deliveryTimeMin: editingCompany.deliveryTimeMin || "",
        deliveryTimeMax: editingCompany.deliveryTimeMax || "",
        openingTime: editingCompany.openingTime || "",
        closingTime: editingCompany.closingTime || "",
        workingDays: editingCompany.workingDays || [],
        image: null,
        open: editingCompany.open || false, // 👈 status vindo da API
      });

      setPreview(
        typeof editingCompany.image === "string" ? editingCompany.image : null,
      );
    }
  }, [editingCompany]);

  // =========================
  // HANDLERS
  // =========================
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
      ...(name === "has_delivery_fee" && !checked ? { delivery_fee: "" } : {}),
    }));
  };

  const handleWorkingDays = (day) => {
    setForm((prev) => ({
      ...prev,
      workingDays: prev.workingDays.includes(day)
        ? prev.workingDays.filter((d) => d !== day)
        : [...prev.workingDays, day],
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setForm((prev) => ({
      ...prev,
      image: file,
    }));
    setPreview(URL.createObjectURL(file));
  };

  // =========================
  // SUBMIT
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    const formData = new FormData();

    Object.entries(form).forEach(([key, value]) => {
      if (key === "workingDays") {
        formData.append(key, JSON.stringify(value));
        return;
      }

      if (key === "open") return;

      if (typeof value === "boolean") {
        formData.append(key, value);
        return;
      }

      if (key === "delivery_fee") {
        formData.append(key, value === "" ? null : Number(value));
        return;
      }

      if (value !== null && value !== "") {
        formData.append(key, value);
      }
    });

    try {
      if (editingCompany) {
        await onUpdate(editingCompany.id, formData);
        toast.success("Empresa atualizada com sucesso 🎉");
      } else {
        await onCreate(formData);
        toast.success("Empresa criada com sucesso 🎉");
      }

      // 🔄 refresh da tela (opção 1 — melhor UX)
      window.location.reload();
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Erro ao salvar empresa ❌",
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // RENDER
  // =========================
  return (
    <form className="company-form card" onSubmit={handleSubmit}>
      <header className="form-header">
        <h2>Editar empresa</h2>
        <p>Informações completas do estabelecimento</p>

        {/* STATUS */}
        {editingCompany && (
          <span className={`status-badge ${form.open ? "open" : "closed"}`}>
            {form.open ? "🟢 Aberto agora" : "🔴 Fechado agora"}
          </span>
        )}
      </header>

      {/* LOGO */}
      <section className="form-section">
        <h3>🖼️ Logo da empresa</h3>

        <div className="image-upload">
          {preview ? (
            <img src={preview} alt="Logo da empresa" />
          ) : (
            <div className="image-placeholder">Sem imagem</div>
          )}

          <label className="upload-btn">
            Selecionar imagem
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={handleImageChange}
            />
          </label>
        </div>
      </section>

      {/* DADOS PRINCIPAIS */}
      <section className="form-section">
        <h3>📌 Dados principais</h3>

        <div className="form-grid">
          <div className="field">
            <label>Nome fantasia</label>
            <input
              name="fantasyName"
              value={form.fantasyName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="field">
            <label>Razão social</label>
            <input
              name="corporateName"
              value={form.corporateName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="field">
            <label>CNPJ / Documento</label>
            <input
              name="document"
              value={form.document}
              onChange={handleChange}
              required
            />
          </div>

          <div className="field">
            <label>Telefone</label>
            <input name="phone" value={form.phone} onChange={handleChange} />
          </div>

          <div className="field full">
            <label>E-mail</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
            />
          </div>
        </div>
      </section>

      {/* FUNCIONAMENTO */}
      <section className="form-section">
        <h3>⏰ Funcionamento</h3>

        <div className="form-grid">
          <div className="field">
            <label>Abertura</label>
            <input
              type="time"
              name="openingTime"
              value={form.openingTime}
              onChange={handleChange}
            />
          </div>

          <div className="field">
            <label>Fechamento</label>
            <input
              type="time"
              name="closingTime"
              value={form.closingTime}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="working-days">
          <label>Dias de funcionamento</label>
          <div className="checkbox-grid">
            {WEEK_DAYS.map(({ label, value }) => (
              <label key={value} className="checkbox">
                <input
                  type="checkbox"
                  checked={form.workingDays.includes(value)}
                  onChange={() => handleWorkingDays(value)}
                />
                {label}
              </label>
            ))}
          </div>
        </div>
      </section>

      {/* ENTREGA */}
      <section className="form-section">
        <h3>🚚 Entrega</h3>

        <label className="checkbox">
          <input
            type="checkbox"
            name="has_delivery_fee"
            checked={form.has_delivery_fee}
            onChange={handleChange}
          />
          Possui taxa de entrega
        </label>

        {form.has_delivery_fee && (
          <div className="field" style={{ marginTop: 12 }}>
            <label>Valor da taxa (R$)</label>
            <input
              type="number"
              name="delivery_fee"
              step="0.01"
              value={form.delivery_fee}
              onChange={handleChange}
              placeholder="Ex: 5.00"
            />
          </div>
        )}
      </section>

      {/* AÇÕES */}
      <footer className="form-actions">
        <button type="submit" className="primary" disabled={loading}>
          {loading ? "Salvando..." : "Salvar alterações"}
        </button>

        <button type="button" className="secondary" onClick={cancelEdit}>
          Cancelar
        </button>
      </footer>
    </form>
  );
}
