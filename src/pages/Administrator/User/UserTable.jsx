export default function UserTable({ users, loading, onEdit, onDelete }) {
  if (loading) return <p>Carregando usuários...</p>;

  return (
    <div className="table-wrapper">
    <table className="user-table">
      <thead>
        <tr>
          <th>Nome</th>
          <th>E-mail</th>
          <th>CPF</th>
          <th>Cargo</th>
          <th>Empresa</th>
          <th>Ações</th>
        </tr>
      </thead>

      <tbody>
        {users.length === 0 ? (
          <tr>
            <td colSpan="6">Nenhum usuário encontrado</td>
          </tr>
        ) : (
          users.map((u) => (
            <tr key={u.id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.cpf}</td>
              <td>
                {u.role === "admin"
                  ? "Administrador"
                  : u.role === "manager"
                  ? "Gerente"
                  : u.role === "waiter"
                  ? "Garçom"
                  : "Usuário"}
              </td>

              <td>{u.company?.fantasyName || "-"}</td>
              <td className="actions">
                <button onClick={() => onEdit(u)}>Editar</button>
                <button className="delete" onClick={() => onDelete(u.id)}>
                  Excluir
                </button>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
    </div>
  );
}
