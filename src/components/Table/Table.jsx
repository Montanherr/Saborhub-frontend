import { useEffect, useState, useCallback, useRef } from "react";
import tableService from "../../services/tableService";
import tableAssignmentsService from "../../services/tableAssignments";
import { socket } from "../../socket/socket";
import { useAuth } from "../../context/AuthContext";
import "./Table.css";

/* ======================
   STATUS VISUAL (PT-BR)
====================== */
const STATUS_LABELS = {
  available: "Disponível",
  calling: "Chamando garçom",
  service: "Em atendimento",
  occupied: "Ocupada",
};

/* ======================
   PRIORIDADE DE STATUS
   calling > service > occupied
====================== */
function resolveTableStatus(assignments = []) {
  if (assignments.some(a => a.status === "calling")) return "calling";
  if (assignments.some(a => a.status === "service")) return "service";
  if (assignments.some(a => a.status === "occupied")) return "occupied";
  return "available";
}

export default function TablesView() {
  const { user } = useAuth();
  const companyId = user?.companyId;
  const isWaiter = user?.role === "waiter";

  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const callingAudio = useRef(null);
  const acceptedAudio = useRef(null);

  /* ======================
     FETCH INICIAL
  ====================== */
  const fetchTables = useCallback(async () => {
    if (!companyId) return;

    try {
      setLoading(true);
      const data = await tableService.getAll(companyId);

      const normalized = data.map(table => {
        const assignments = table.assignments || [];
        const status = resolveTableStatus(assignments);

        const activeAssignment =
          assignments.find(a => a.status === "calling") ||
          assignments.find(a => a.status === "service") ||
          assignments.find(a => a.status === "occupied") ||
          null;

        return {
          ...table,
          status,
          assignments,
          activeAssignment,
        };
      });

      setTables(normalized);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  /* ======================
     AUDIOS
  ====================== */
  useEffect(() => {
    callingAudio.current = new Audio("/sounds/calling.mp3");
    acceptedAudio.current = new Audio("/sounds/accept.mp3");
  }, []);

  /* ======================
     SOCKET
  ====================== */
  useEffect(() => {
    if (!companyId) return;

    fetchTables();

    const handleUpdate = (data) => {
      setTables(prev =>
        prev.map(t => {
          if (t.id !== data.id) return t;

          const assignments = data.assignments || [];
          const newStatus = resolveTableStatus(assignments);

          const activeAssignment =
            assignments.find(a => a.status === "calling") ||
            assignments.find(a => a.status === "service") ||
            assignments.find(a => a.status === "occupied") ||
            null;

          /* 🔔 SOM E VIBRAÇÃO */
          if (t.status !== newStatus) {
            if (newStatus === "calling") {
              callingAudio.current?.play().catch(() => {});
              navigator.vibrate?.([300, 150, 300]);
            }

            if (newStatus === "service") {
              acceptedAudio.current?.play().catch(() => {});
            }
          }

          return {
            ...t,
            status: newStatus,
            assignments,
            activeAssignment,
          };
        })
      );
    };

    socket.on(`table_update_${companyId}`, handleUpdate);

    return () => {
      socket.off(`table_update_${companyId}`, handleUpdate);
    };
  }, [companyId, fetchTables]);

  if (loading) return <p className="info">Carregando mesas...</p>;
  if (error) return <p className="error">Erro: {error}</p>;

  return (
    <div className="tables-container">
      <h2 className="title">Mesas</h2>

      <div className="tables-grid">
        {tables.map(table => {
          const assignment = table.activeAssignment;

          return (
            <div key={table.id} className={`table-card ${table.status}`}>

              {/* 🪑 CADEIRAS */}
              <div className="chairs top">
                <span className="chair" />
                <span className="chair" />
              </div>

              <div className="chairs left">
                <span className="chair" />
              </div>

              <div className="chairs right">
                <span className="chair" />
              </div>

              <div className="chairs bottom">
                <span className="chair" />
                <span className="chair" />
              </div>

              {/* 🍽️ MESA */}
              <div className="table-center">
                <h3>Mesa {table.number}</h3>

                <span className="status-label">
                  {STATUS_LABELS[table.status]}
                </span>

                {/* 🔔 CHAMANDO */}
                {table.status === "calling" && isWaiter && assignment && (
                  <button
                    className="btn primary"
                    onClick={() =>
                      tableAssignmentsService.accept(assignment.id)
                    }
                  >
                    Atender
                  </button>
                )}

                {/* 🟡 EM ATENDIMENTO */}
                {table.status === "service" && isWaiter && assignment && (
                  <button
                    className="btn warning"
                    onClick={() =>
                      tableAssignmentsService.finishService(assignment.id)
                    }
                  >
                    Finalizar atendimento
                  </button>
                )}

                {/* 🔴 OCUPADA */}
                {table.status === "occupied" && isWaiter && (
                  <button
                    className="btn danger"
                    onClick={() =>
                      tableAssignmentsService.open(table.id)
                    }
                  >
                    Liberar mesa
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
