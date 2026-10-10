import { useEffect, useState, useCallback, useRef } from "react";
import tableService from "../../services/tableService";
import tableAssignmentsService from "../../services/tableAssignments";
import { socket } from "../../socket/socket";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
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

  // 🔥 NORMALIZA ROLE (CORREÇÃO DEFINITIVA)
  const role = (user?.role || "").toLowerCase();

  const canAttendTables = ["waiter", "manager"].includes(role);
  const canManageTables = ["admin", "manager"].includes(role);

  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tableDialog, setTableDialog] = useState(null);

  const callingAudio = useRef(null);
  const acceptedAudio = useRef(null);

  /* ======================
     FETCH
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
            number: data.number,
            status: newStatus,
            assignments,
            activeAssignment,
          };
        })
      );
    };

    const handleDeleted = ({ tableId }) => {
      setTables(prev => prev.filter(table => Number(table.id) !== Number(tableId)));
    };

    const handleCreated = () => fetchTables();

    socket.on(`table_update_${companyId}`, handleUpdate);
    socket.on("table_created", handleCreated);
    socket.on("table_deleted", handleDeleted);

    return () => {
      socket.off(`table_update_${companyId}`, handleUpdate);
      socket.off("table_created", handleCreated);
      socket.off("table_deleted", handleDeleted);
    };
  }, [companyId, fetchTables]);

  /* ======================
     CRUD
  ====================== */
  const openCreateTable = () => {
    setTableDialog({ mode: "create", number: "" });
  };

  const openEditTable = (table) => {
    setTableDialog({ mode: "edit", tableId: table.id, number: String(table.number) });
  };

  const closeTableDialog = () => setTableDialog(null);

  const handleTableDialogSubmit = async (event) => {
    event.preventDefault();
    const number = tableDialog?.number?.trim();
    if (!number) return;

    try {
      setLoading(true);
      if (tableDialog.mode === "edit") {
        await tableService.update(tableDialog.tableId, { number });
        toast.success("Mesa atualizada com sucesso!");
      } else {
        await tableService.create({ number, companyId });
        toast.success(`Mesa ${number} criada com sucesso!`);
      }
      closeTableDialog();
      await fetchTables();
    } catch (err) {
      const backendMessage = err.response?.data?.error;
      const isQrCodeError = backendMessage?.includes("Data too long for column 'qrcode'");
      toast.error(
        isQrCodeError
          ? "A mesa foi criada, mas o QR Code não pôde ser salvo. Ajuste a coluna qrcode do banco."
          : backendMessage || (tableDialog.mode === "edit" ? "Erro ao atualizar mesa" : "Erro ao criar mesa"),
      );
    }
  };

  const handleDeleteTable = async (id) => {
    if (!window.confirm("Excluir esta mesa?")) return;

    try {
      setLoading(true);
      await tableService.delete(id);
      toast.success("Mesa excluída com sucesso!");
      await fetchTables();
    } catch (err) {
      toast.error(err.response?.data?.error || "Erro ao excluir mesa");
    }
  };

  /* ======================
     RENDER
  ====================== */
  if (loading) {
    return (
      <div className="tables-loading" role="status" aria-label="Carregando mesas">
        <div className="tables-loading__heading" />
        <div className="tables-loading__grid">
          {[1, 2, 3, 4].map((item) => <div className="tables-loading__card" key={item} />)}
        </div>
      </div>
    );
  }
  if (error) return <p className="error">Erro ao carregar mesas: {error}</p>;

  const statusCount = tables.reduce((count, table) => {
    count[table.status] = (count[table.status] || 0) + 1;
    return count;
  }, {});

  return (
    <div className="tables-container">
      <div className="header">
        <div>
          <span className="tables-eyebrow">OPERAÇÃO EM TEMPO REAL</span>
          <h2 className="tables-title">Mesas</h2>
          <p className="tables-subtitle">Acompanhe o atendimento e a ocupação da sua loja.</p>
        </div>
        <div className="tables-header-actions">
          <span className="tables-total">{tables.length} mesa(s)</span>
          {canManageTables && (
            <button className="btn primary" onClick={openCreateTable}>
              + Nova mesa
            </button>
          )}
        </div>
      </div>

      <div className="tables-summary" aria-label="Resumo das mesas">
        {Object.entries(STATUS_LABELS).map(([status, label]) => (
          <span className={`tables-summary__item ${status}`} key={status}>
            <i /> {label} <strong>{statusCount[status] || 0}</strong>
          </span>
        ))}
      </div>

      <div className="tables-grid">
        {tables.length === 0 ? (
          <div className="tables-empty">Nenhuma mesa cadastrada.</div>
        ) : tables.map(table => {
          const assignment = table.activeAssignment;

          return (
            <div
              key={table.id}
              className={`table-card ${table.status}`}
            >
              {canManageTables && (
                <div className="table-actions">
                  <button
                    className="btn small"
                    type="button"
                    title={`Editar mesa ${table.number}`}
                    aria-label={`Editar mesa ${table.number}`}
                    onClick={() => openEditTable(table)}
                  >
                    ✏️
                  </button>
                  <button
                    className="btn small danger"
                    type="button"
                    title={`Excluir mesa ${table.number}`}
                    aria-label={`Excluir mesa ${table.number}`}
                    onClick={() => handleDeleteTable(table.id)}
                  >
                    🗑️
                  </button>
                </div>
              )}

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

              <div className="table-center">
                <h3>Mesa {table.number}</h3>

                <span className="status-label">
                  {STATUS_LABELS[table.status]}
                </span>

                {table.status === "calling" &&
                  canAttendTables &&
                  assignment && (
                    <button
                      className="btn primary"
                      onClick={() =>
                        tableAssignmentsService.accept(
                          assignment.id
                        )
                      }
                    >
                      Atender
                    </button>
                  )}

                {table.status === "service" &&
                  canAttendTables &&
                  assignment && (
                    <button
                      className="btn warning"
                      onClick={() =>
                        tableAssignmentsService.finishService(
                          assignment.id
                        )
                      }
                    >
                      Finalizar atendimento
                    </button>
                  )}

                {table.status === "occupied" &&
                  canAttendTables && (
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

      {tableDialog && (
        <div className="table-dialog-overlay" role="presentation" onMouseDown={closeTableDialog}>
          <form
            className="table-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="table-dialog-title"
            onSubmit={handleTableDialogSubmit}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="table-dialog__header">
              <div>
                <span className="tables-eyebrow">GESTÃO DE MESAS</span>
                <h2 id="table-dialog-title">
                  {tableDialog.mode === "edit" ? "Editar mesa" : "Nova mesa"}
                </h2>
              </div>
              <button type="button" className="table-dialog__close" onClick={closeTableDialog} aria-label="Fechar">
                ×
              </button>
            </div>
            <p className="table-dialog__description">Informe o número que será exibido para a equipe.</p>
            <label className="table-dialog__field">
              Número da mesa
              <input
                autoFocus
                type="text"
                inputMode="numeric"
                value={tableDialog.number}
                onChange={(event) => setTableDialog((current) => ({ ...current, number: event.target.value }))}
                placeholder="Ex.: 01"
                required
              />
            </label>
            <div className="table-dialog__actions">
              <button type="button" className="btn secondary" onClick={closeTableDialog}>Cancelar</button>
              <button type="submit" className="btn primary" disabled={loading}>
                {loading ? "Salvando..." : tableDialog.mode === "edit" ? "Salvar alterações" : "Criar mesa"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
