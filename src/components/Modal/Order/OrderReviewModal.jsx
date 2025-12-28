import "./OrderReviewModal.css";

export default function OrderReviewModal({
  items,
  subtotal,
  deliveryFeeTotal,
  total,
  calculateFinalPrice,
  loading,
  onConfirm,
  onBack,
  onAddMore
}) {
  return (
    <>
      <h3>Revisar Pedido</h3>

      <div className="order-items">
        {items.map((item) => {
          const finalPrice = calculateFinalPrice(item);

          return (
            <div key={item.id} className="order-item">
              <div>
                {item.name} x{item.quantity}
                {item.promotion && (
                  <span className="promo-tag">
                    (Promo:{" "}
                    {item.promotion_type === "percentage"
                      ? `-${item.promotion_value}%`
                      : `R$ ${Number(item.promotion_value).toFixed(2)}`}
                    )
                  </span>
                )}
              </div>

              <div>
                R$ {(finalPrice * item.quantity).toFixed(2)}
              </div>
            </div>
          );
        })}
      </div>

      <div className="order-summary">
        <p>Subtotal: R$ {subtotal.toFixed(2)}</p>

        {deliveryFeeTotal > 0 && (
          <p>Taxa de entrega: R$ {deliveryFeeTotal.toFixed(2)}</p>
        )}

        <p className="order-total">
          Total: R$ {total.toFixed(2)}
        </p>
      </div>

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
    </>
  );
}
