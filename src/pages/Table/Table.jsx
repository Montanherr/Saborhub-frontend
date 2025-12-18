import { useEffect, useState } from "react";
import TablesView from "../../components/Table/Table";
import { useAuth } from "../../context/AuthContext";

function Dashboard() {
  const { user } = useAuth(); // pegamos o usuário logado do contexto
  const [refreshKey, setRefreshKey] = useState(0); // chave para forçar refresh

  // Atualiza a cada 3 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey((prev) => prev + 1);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  if (!user) return <p>Carregando usuário...</p>;

  return (
    <div>
      <h1>Mesas da Empresa</h1>
      <TablesView key={refreshKey} companyId={user.companyId} />
    </div>
  );
}

export default Dashboard;
