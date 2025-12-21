export default function OrderReviewModal({
  items,
  total,
  loading,
  onConfirm,
  onBack,
  onAddMore,
  onClose
}) {
  return (
    <div className="orders-modal-backdrop">
      <div className="orders-modal">
        <h3>Revisar Pedido</h3>

        <div className="order-items">
          {items.map(item => (
            <div key={item.id} className="order-item">
              {item.name} x{item.quantity} – R${" "}
              {(item.price * item.quantity).toFixed(2)}
            </div>
          ))}
        </div>

        <p className="order-total">Total: R$ {total}</p>

        <div className="order-actions">
          <button className="btn cancel" onClick={onBack}>
            Voltar
          </button>

          <button className="btn secondary" onClick={onAddMore}>
            Adicionar mais itens
          </button>


          <button
            className="btn primary"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Enviando..." : "Confirmar Pedido"}
          </button>
        </div>
      </div>
    </div>
  );
}
