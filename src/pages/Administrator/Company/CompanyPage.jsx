import { useEffect, useState } from "react";
import companyService from "../../../services/companyService";
import CompanyForm from "./CompanyForm";
import "./Company.css";

export default function CompanyPage() {
  const [companies, setCompanies] = useState([]);
  const [editingCompany, setEditingCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const data = await companyService.getAdminCompanies();
      setCompanies(data);
    } catch (error) {
      console.error("Erro ao carregar empresas:", error);
    } finally {
      setLoading(false);
    }
  };

useEffect(() => {
  const loadCompanies = async () => {
    setLoading(true);

    const data = await companyService.getAdminCompanies();
    setCompanies(data);

    // 👇 ISSO É O QUE DISPARA O FORM PREENCHIDO
    if (data.length > 0) {
      setEditingCompany(data[0]);
    }

    setLoading(false);
  };

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

  const handleDelete = async (id) => {
    if (!window.confirm("Deseja excluir esta empresa?")) return;
    await companyService.delete(id);
    await loadCompanies();
  };

  return (
    <div className="company-page">
      <header className="page-header">
        <div>
          <h1>Empresas</h1>
          <p>Gerencie os estabelecimentos cadastrados</p>
        </div>
      </header>

      <section className="page-section">
        <CompanyForm
          onCreate={handleCreate}
          onUpdate={handleUpdate}
          editingCompany={editingCompany}
          cancelEdit={() => setEditingCompany(null)}
        />
      </section>


    </div>
  );
}
