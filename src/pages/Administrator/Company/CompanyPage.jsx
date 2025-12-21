import { useEffect, useState } from "react";
import companyService from "../../../services/companyService";
import CompanyForm from "./CompanyForm";
import CompanyTable from "./CompanyTable";
import "./Company.css";

export default function CompanyPage() {
  const [companies, setCompanies] = useState([]);
  const [editingCompany, setEditingCompany] = useState(null);
  const [loading, setLoading] = useState(false);

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
    loadCompanies();
  }, []);

  const handleCreate = async (data) => {
    await companyService.create(data);
    await loadCompanies(); // 🔥 tempo real
  };

  const handleUpdate = async (id, data) => {
    await companyService.update(id, data);
    setEditingCompany(null);
    await loadCompanies(); // 🔥 tempo real
  };

  const handleDelete = async (id) => {
    if (window.confirm("Deseja excluir esta empresa?")) {
      await companyService.delete(id);
      await loadCompanies(); // 🔥 tempo real
    }
  };

  return (
    <div className="company-page">
      <h2>Cadastro de Empresas</h2>

      <CompanyForm
        onCreate={handleCreate}
        onUpdate={handleUpdate}
        editingCompany={editingCompany}
        cancelEdit={() => setEditingCompany(null)}
      />

      <CompanyTable
        companies={companies}
        loading={loading}
        onEdit={setEditingCompany}
        onDelete={handleDelete}
      />
    </div>
  );
}
