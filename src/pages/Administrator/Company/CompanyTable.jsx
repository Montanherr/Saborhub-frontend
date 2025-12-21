export default function CompanyTable({
  companies,
  loading,
  onEdit,
  onDelete,
}) {
  if (loading) return <p>Carregando empresas...</p>;

  return (
    <div className="company-table-wrapper">
    <table className="company-table">
      <thead>
        <tr>
          <th>Nome Fantasia</th>
          <th>Razão Social</th>
          <th>Documento</th>
          <th>E-mail</th>
          <th>Ações</th>
        </tr>
      </thead>

      <tbody>
        {companies.length === 0 ? (
          <tr>
            <td colSpan="5">Nenhuma empresa encontrada</td>
          </tr>
        ) : (
          companies.map((company) => (
            <tr key={company.id}>
              <td>{company.fantasyName}</td>
              <td>{company.corporateName}</td>
              <td>{company.document}</td>
              <td>{company.email}</td>
              <td className="actions">
                <button onClick={() => onEdit(company)}>Editar</button>
                <button
                  className="delete"
                  onClick={() => onDelete(company.id)}
                >
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
