import { useEffect, useState } from "react";

/* =========================
   ROLES (UI PT-BR / API EN)
========================= */
const ROLE_OPTIONS = [
  { label: "Usuário", value: "user" },
  { label: "Gerente", value: "manager" },
  { label: "Administrador", value: "admin" },
  { label: "Garçom", value: "waiter" },
];

export default function UserForm({
  companies,
  editingUser,
  onCreate,
  onUpdate,
  cancelEdit,
}) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    cpf: "",
    role: "user",
    companyId: "",
  });

  /* =========================
     CARREGAR USUÁRIO (EDIÇÃO)
  ========================= */
  useEffect(() => {
    if (editingUser) {

      setForm({
        name: editingUser.name || "",
        email: editingUser.email || "",
        password: "",
        cpf: editingUser.cpf || "",
        role: editingUser.role || "user",
        companyId: editingUser.companyId || "",
      });
    }
  }, [editingUser]);

  /* =========================
     HANDLERS
  ========================= */
  const handleChange = (e) => {
    const { name, value } = e.target;


    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();


    const payload = { ...form };

    // Não envia senha vazia na edição
    if (editingUser && !payload.password) {
      delete payload.password;
    }


    if (editingUser) {
      onUpdate(editingUser.id, payload);
    } else {
      onCreate(payload);
    }

    // Reset
    setForm({
      name: "",
      email: "",
      password: "",
      cpf: "",
      role: "user",
      companyId: "",
    });

  };

  /* =========================
     RENDER
  ========================= */
  return (
    <form className="user-form" onSubmit={handleSubmit}>
      <h3>{editingUser ? "Editar Usuário" : "Novo Usuário"}</h3>

      <input
        name="name"
        placeholder="Nome completo"
        value={form.name}
        onChange={handleChange}
        required
      />

      <input
        name="email"
        type="email"
        placeholder="E-mail"
        value={form.email}
        onChange={handleChange}
        required
      />

      {!editingUser && (
        <input
          name="password"
          type="password"
          placeholder="Senha"
          value={form.password}
          onChange={handleChange}
          required
        />
      )}

      <input
        name="cpf"
        placeholder="CPF"
        value={form.cpf}
        onChange={handleChange}
        required
      />

      {/* ROLE */}
      <select name="role" value={form.role} onChange={handleChange}>
        {ROLE_OPTIONS.map((role) => (
          <option key={role.value} value={role.value}>
            {role.label}
          </option>
        ))}
      </select>

      {/* EMPRESA */}
      <select
        name="companyId"
        value={form.companyId}
        onChange={handleChange}
        required
      >
        <option value="">Selecione a empresa</option>

        {companies.map((company) => (
          <option key={company.id} value={company.id}>
            {company.fantasyName}
          </option>
        ))}
      </select>

      {/* AÇÕES */}
      <div className="form-actions">
        <button type="submit">
          {editingUser ? "Atualizar" : "Cadastrar"}
        </button>

        {editingUser && (
          <button
            type="button"
            className="cancel"
            onClick={cancelEdit}
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
