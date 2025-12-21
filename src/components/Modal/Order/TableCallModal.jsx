export default function TableCallModal({
  company,
  tables,
  selectedTable,
  setSelectedTable,
  calling,
  callSuccess,
  onCallWaiter,
  onClose
}) {
  return (
    <div className="orders-modal-backdrop">
      <div className="orders-modal">
        <h3>Chamar Garçom</h3>

        <select
          value={selectedTable || ""}
          onChange={e => setSelectedTable(e.target.value)}
        >
          <option value="">Selecione a mesa</option>
          {tables.map(t => (
            <option key={t.id} value={t.id}>
              Mesa {t.number}
            </option>
          ))}
        </select>

        <button
          className={`call-waiter-btn ${calling ? "loading" : ""} ${callSuccess ? "success" : ""}`}
          onClick={onCallWaiter}
          disabled={!selectedTable || calling}
        >
          {calling ? "Chamando..." : callSuccess ? "Garçom chamado ✅" : "Chamar Garçom"}
        </button>

        <button className="btn cancel" onClick={onClose}>
          Fechar
        </button>
      </div>
    </div>
  );
}
