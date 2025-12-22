// src/components/Table/Table.jsx
import { useEffect, useState, useCallback, useRef } from "react";
import tableService from "../../services/tableService";
import tableAssignmentsService from "../../services/tableAssignments";
import { socket } from "socket/socket";
import { useAuth } from "../../context/AuthContext";
import "./Table.css";

export default function TablesView() {
  const { user } = useAuth();
  const companyId = user?.companyId;
  const isWaiter = user?.role === "waiter";

  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const callingAudio = useRef(null);
  const acceptedAudio = useRef(null);

  // 🔄 Fetch inicial
  const fetchTables = useCallback(async () => {
    if (!companyId) return;

    try {
      setLoading(true);
      const data = await tableService.getAll(companyId);

      const normalized = data.map((table) => {
        const activeAssignment =
          table.assignments?.find((a) => a.status === "calling") ||
          table.assignments?.find((a) => a.status === "service") ||
          table.assignments?.find((a) => a.status === "occupied") ||
          null;

        return {
          ...table,
          status: activeAssignment?.status || "available",
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

  useEffect(() => {
    callingAudio.current = new Audio("/sounds/calling.mp3");
    acceptedAudio.current = new Audio("/sounds/accept.mp3");
  }, []);

  // 🔌 Socket updates
  useEffect(() => {
    if (!companyId) return;

    fetchTables();

    const handleUpdate = (data) => {
      setTables((prev) =>
        prev.map((t) => {
          if (t.id !== data.id) return t;

          const assignments = data.assignments || [];

          let newStatus = "available";
          if (assignments.some((a) => a.status === "calling")) {
            newStatus = "calling";
          } else if (assignments.some((a) => a.status === "service")) {
            newStatus = "service";
          } else if (assignments.some((a) => a.status === "occupied")) {
            newStatus = "occupied";
          }

          const activeAssignment =
            assignments.find((a) => a.status === "calling") ||
            assignments.find((a) => a.status === "service") ||
            assignments.find((a) => a.status === "occupied") ||
            null;

          if (t.status !== newStatus) {
            if (newStatus === "calling") {
              callingAudio.current?.play().catch(() => {});
              if ("vibrate" in navigator) {
                navigator.vibrate([300, 150, 300]);
              }
            }

            if (newStatus === "service") {
              acceptedAudio.current?.play().catch(() => {});
            }
          }

          return {
            ...t,
            status: newStatus,
            activeAssignment,
            assignments,
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
        {tables.map((table) => {
          const assignment = table.activeAssignment;

          return (
            <div key={table.id} className={`table-card ${table.status}`}>
              <h3>Mesa {table.number}</h3>
              <span className="status-label">{table.status}</span>

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

              {/* ✅ EM ATENDIMENTO */}
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

              {/* 🟡 OCUPADA (cliente ainda está na mesa) */}
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
          );
        })}
      </div>
    </div>
  );
}
