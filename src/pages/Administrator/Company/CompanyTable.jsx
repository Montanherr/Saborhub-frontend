import "./CompanyTable.css";

export default function CompanyTable({
  companies,
  loading,
  onEdit,
  onDelete,
}) {
  if (loading) {
    return <div className="table-loading">Carregando empresas...</div>;
  }

  if (!companies.length) {
    return <div className="table-empty">Nenhuma empresa encontrada</div>;
  }

  return (
    <div className="company-table-wrapper">
      {/* DESKTOP */}
      <table className="company-table">
        <thead>
          <tr>
            <th>Empresa</th>
            <th>Documento</th>
            <th>Contato</th>
            <th>Ações</th>
          </tr>
        </thead>

        <tbody>
          {companies.map((company) => (
            <tr key={company.id}>
              <td>
                <strong>{company.fantasyName}</strong>
                <span>{company.corporateName}</span>
              </td>

              <td>{company.document}</td>

              <td>{company.email}</td>

              <td className="actions">
                <button onClick={() => onEdit(company)}>Editar</button>
                <button
                  className="danger"
                  onClick={() => onDelete(company.id)}
                >
                  Excluir
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* MOBILE */}
      <div className="company-cards">
        {companies.map((company) => (
          <div className="company-card" key={company.id}>
            <div className="card-header">
              <h4>{company.fantasyName}</h4>
              <span>{company.document}</span>
            </div>

            <div className="card-body">
              <p>
                <strong>Razão Social:</strong> {company.corporateName}
              </p>
              <p>
                <strong>Email:</strong> {company.email}
              </p>
            </div>

            <div className="card-actions">
              <button onClick={() => onEdit(company)}>Editar</button>
              <button
                className="danger"
                onClick={() => onDelete(company.id)}
              >
                Excluir
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
