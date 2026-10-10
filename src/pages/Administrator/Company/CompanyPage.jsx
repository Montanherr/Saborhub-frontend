import { useEffect, useState } from "react";
import companyService from "../../../services/companyService";
import CompanyForm from "./CompanyForm";
import "./Company.css";

export default function CompanyPage() {
  const [editingCompany, setEditingCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadCompanies = async () => {
    try {
      const data = await companyService.getAdminCompanies();

      // Preenche automaticamente o formulário
      if (data.length > 0) {
        setEditingCompany(data[0]);
      }
    } catch (error) {
      console.error("Erro ao carregar empresas:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  const handleCreate = async (data) => {
    await companyService.create(data);
    await loadCompanies();
  };

  const handleUpdate = async (id, data) => {
    await companyService.update(id, data);
    setEditingCompany(null);
    await loadCompanies();
  };

  return (
    <div className="company-page">
      <header className="page-header">
        <div>
          <h1>Meu estabelecimento</h1>
        </div>
      </header>

      <section className="page-section">
        {loading ? (
          <div className="company-loading" role="status" aria-label="Carregando empresa">
            <div className="company-loading__head">
              <span />
              <span />
            </div>
            <div className="company-loading__body">
              <span />
              <span />
              <span />
              <span />
            </div>
          </div>
        ) : (
          <CompanyForm
            onCreate={handleCreate}
            onUpdate={handleUpdate}
            editingCompany={editingCompany}
            cancelEdit={() => setEditingCompany(null)}
          />
        )}
      </section>
    </div>
  );
}
