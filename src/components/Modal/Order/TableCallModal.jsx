import "./TableCallModal.css";


export default function TableCallModal({
  tables,
  loading,
  error,
  selectedTable,
  setSelectedTable,
  calling,
  callSuccess,
  onCallWaiter,
  onClose
}) {
  return (
    <div className="orders-modal-backdrop table-call-backdrop" role="presentation">
      <section className="table-call-modal" role="dialog" aria-modal="true" aria-labelledby="table-call-title">
        <div className="table-call-modal__header">
          <span className="table-call-modal__eyebrow">ATENDIMENTO NA MESA</span>
          <h3 id="table-call-title">Chamar garçom</h3>
          <p>Selecione sua mesa para avisar a equipe.</p>
        </div>

        {loading && <div className="table-call-modal__message">Carregando mesas…</div>}
        {error && <div className="table-call-modal__message table-call-modal__message--error">{error}</div>}
        {!loading && !error && tables.length === 0 && <div className="table-call-modal__message">Nenhuma mesa disponível no momento.</div>}
        {!loading && !error && tables.length > 0 && (
          <div className="table-call-modal__grid" role="radiogroup" aria-label="Mesas disponíveis">
            {tables.map((table) => {
              const available = table.status === "available";
              const selected = Number(selectedTable) === Number(table.id);
              return (
                <button key={table.id} type="button" className={`table-call-card ${selected ? "is-selected" : ""} ${!available ? "is-unavailable" : ""}`} onClick={() => available && setSelectedTable(table.id)} disabled={!available} role="radio" aria-checked={selected}>
                  <span className="table-call-card__number">{table.number}</span>
                  <span className="table-call-card__label">Mesa</span>
                  <span className={`table-call-card__status table-call-card__status--${table.status}`}>{available ? "Disponível" : "Em uso"}</span>
                </button>
              );
            })}
          </div>
        )}

        <button
          className={`call-waiter-btn ${calling ? "loading" : ""} ${callSuccess ? "success" : ""}`}
          onClick={onCallWaiter}
          disabled={!selectedTable || calling || loading}
        >
          {calling ? "Chamando..." : callSuccess ? "Garçom chamado ✅" : "Chamar Garçom"}
        </button>

        <button className="btn cancel" onClick={onClose}>
          Fechar
        </button>
      </section>
    </div>
  );
}
