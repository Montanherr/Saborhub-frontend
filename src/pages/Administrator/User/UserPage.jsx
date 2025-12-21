import { useEffect, useState } from "react";
import userService from "../../../services/userService";
import companyService from "../../../services/companyService";
import { useAuth } from "../../../context/AuthContext";
import UserForm from "./UserForm";
import UserTable from "./UserTable";
import "./User.css";

export default function UserPage() {
  const { user } = useAuth();

  const [users, setUsers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [loading, setLoading] = useState(false);

const loadData = async () => {
  try {
    setLoading(true);

    const [usersData, companiesData] = await Promise.all([
      userService.getAdminUsers(),
      companyService.getAdminCompanies(),
    ]);

    setUsers(usersData);
    setCompanies(companiesData);

  } catch (error) {
    console.error("Erro ao carregar dados:", error);
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (data) => {
    await userService.createUser(data);
    await loadData();
  };

  const handleUpdate = async (id, data) => {
    await userService.updateUser(id, data);
    setEditingUser(null);
    await loadData();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Deseja excluir este usuário?")) {
      await userService.deleteUser(id);
      await loadData();
    }
  };

  return (
    <div className="user-page">
      <h2>Cadastro de Usuários</h2>

      <UserForm
        companies={companies}
        editingUser={editingUser}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
        cancelEdit={() => setEditingUser(null)}
      />

      <UserTable
        users={users}
        loading={loading}
        onEdit={setEditingUser}
        onDelete={handleDelete}
      />
    </div>
  );
}
