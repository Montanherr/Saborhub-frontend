import { useEffect, useState } from "react";

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

  useEffect(() => {
    if (editingUser) {
      setForm({ ...editingUser, password: "" });
    }
  }, [editingUser]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (editingUser) {
      onUpdate(editingUser.id, form);
    } else {
      onCreate(form);
    }

    setForm({
      name: "",
      email: "",
      password: "",
      cpf: "",
      role: "user",
      companyId: "",
    });
  };

  return (
    <form className="user-form" onSubmit={handleSubmit}>
      <h3>{editingUser ? "Editar Usuário" : "Novo Usuário"}</h3>

      <input
        name="name"
        placeholder="Nome"
        value={form.name}
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

      <select name="role" value={form.role} onChange={handleChange}>
        {ROLE_OPTIONS.map((role) => (
          <option key={role.value} value={role.value}>
            {role.label}
          </option>
        ))}
      </select>

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
