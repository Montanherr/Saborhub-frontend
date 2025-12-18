import { useEffect, useState } from "react";
import tableService from "../../services/tableService";
import tableAssignmentsService from "../../services/tableAssignments";
import { socket } from "socket/socket";
import { useAuth } from "../../context/AuthContext";
import "./Table.css";

export default function TablesView() {
  const { user } = useAuth();
  const companyId = user?.companyId;

  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🔄 Carrega mesas
  const fetchTables = async () => {
    if (!companyId) return;

    try {
      setLoading(true);
      const data = await tableService.getAll(companyId);

      const normalized = data.map((table) => {
        const active =
          table.assignments.find((a) => a.status === "calling") ||
          table.assignments.find((a) => a.status === "occupied");

        return {
          ...table,
          status: active?.status || "available",
          activeAssignment: active || null,
        };
      });

      setTables(normalized);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  // 🔌 Socket connect
  useEffect(() => {
    if (!companyId) return;

    fetchTables();

    const onConnect = () => {
      console.log("📥 Socket conectou → sync mesas");
      fetchTables();
    };

    socket.on("connect", onConnect);
    return () => socket.off("connect", onConnect);
  }, [companyId]);

useEffect(() => {
  if (!companyId) return;

const onUpdate = (data) => {
  // normaliza assignments
  const assignments = data.assignments?.map(a => a.dataValues || a) || [];

  const status = assignments.some(a => a.status === "occupied")
    ? "occupied"
    : assignments.some(a => a.status === "calling")
    ? "calling"
    : "available";

  const activeAssignment = assignments.find(a => ["calling", "occupied"].includes(a.status)) || null;

  const updatedTable = {
    ...data,
    assignments,
    status,
    activeAssignment,
  };

  setTables(prev => {
    const exists = prev.find(t => t.id === data.id);
    if (exists) {
      return prev.map(t => (t.id === data.id ? updatedTable : t));
    } else {
      return [...prev, updatedTable];
    }
  });
};


  socket.on(`table_update_${companyId}`, onUpdate);
  return () => socket.off(`table_update_${companyId}`, onUpdate);
}, [companyId]);

  // 🎯 Ação principal da mesa
  const handleAction = async (table) => {
    try {
      const assignment = table.activeAssignment;

      if (table.status === "available") {
        await tableAssignmentsService.open(table.id);
      }

      else if (table.status === "calling" && assignment) {
        await tableAssignmentsService.accept(assignment.id);
      }

      else if (table.status === "occupied") {
        if (!assignment || assignment.waiterId !== user.id) {
          alert("Essa mesa está sob atendimento de outro garçom");
          return;
        }
        await tableAssignmentsService.finish(assignment.id);
      }

      fetchTables();
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    }
  };

  if (loading) return <p>Carregando mesas...</p>;
  if (error) return <p>Erro: {error}</p>;

  return (
    <div className="tables-grid">
      {tables.map((table) => (
        <div
          key={table.id}
          className={`table-card ${table.status}`}
          onClick={() => handleAction(table)}
        >
          <h3>Mesa {table.number}</h3>
          <p>Status: {table.status}</p>

          {table.status === "calling" && (
            <button className="btn primary">Atender</button>
          )}

          {table.status === "occupied" &&
            table.activeAssignment?.waiterId === user.id && (
              <button className="btn danger">Finalizar</button>
            )}

          {table.status === "occupied" &&
            table.activeAssignment?.waiterId !== user.id && (
              <p className="blocked">Em atendimento</p>
            )}
        </div>
      ))}
    </div>
  );
}
