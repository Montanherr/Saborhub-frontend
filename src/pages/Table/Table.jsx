import TablesView from "../../components/Table/Table";
import { useAuth } from "../../context/AuthContext";

function Dashboard() {
  const { user } = useAuth();

  if (!user) return <p>Carregando usuário...</p>;

  return (
    <div>
      <h1>Mesas</h1>
      <TablesView companyId={user.companyId} />
    </div>
  );
}

export default Dashboard;
