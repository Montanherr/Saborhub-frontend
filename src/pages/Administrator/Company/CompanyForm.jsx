import { useEffect, useState } from "react";

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
    email: "",
  });

  useEffect(() => {
    if (editingCompany) {
      setForm(editingCompany);
    }
  }, [editingCompany]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (editingCompany) {
      onUpdate(editingCompany.id, form);
    } else {
      onCreate(form);
    }

    setForm({
      fantasyName: "",
      corporateName: "",
      document: "",
      email: "",
    });
  };

  return (
    <form className="company-form card" onSubmit={handleSubmit}>
      <h3>{editingCompany ? "Editar Empresa" : "Nova Empresa"}</h3>
<div className="form-grid">
  
      <input
        name="fantasyName"
        placeholder="Nome Fantasia"
        value={form.fantasyName}
        onChange={handleChange}
        required
      />

      <input
        name="corporateName"
        placeholder="Razão Social"
        value={form.corporateName}
        onChange={handleChange}
        required
      />

      <input
        name="document"
        placeholder="CNPJ / Documento"
        value={form.document}
        onChange={handleChange}
        required
      />

      <input
        name="email"
        placeholder="E-mail"
        value={form.email}
        onChange={handleChange}
        required
      />
</div>

      <div className="form-actions">
        <button type="submit">
          {editingCompany ? "Atualizar" : "Cadastrar"}
        </button>

        {editingCompany && (
          <button type="button" onClick={cancelEdit} className="cancel">
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
