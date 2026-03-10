import "./OrderReviewModal.css";
import { Toaster } from "react-hot-toast";

export default function OrderReviewModal({
  items,
  subtotal,
  deliveryFeeTotal,
  total,
  calculateFinalPrice,
  loading,
  onConfirm,
  onAddMore,
  onIncrease,
  onDecrease,
  onRemove,
  appliedCoupon,
  discount,
  coupons,
  handleApplyCoupon,
  phone,
}) {
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <>
      <Toaster position="top-right" />

      <div className="cart-header">
        <h3>🛒 Seu Carrinho</h3>
        <span className="cart-count">{totalItems} itens</span>
      </div>

      {/* Lista de itens */}
      <div className="order-items">
        {items.map((item) => {
          const finalPrice = calculateFinalPrice(item);
          return (
            <div key={item.id} className="order-item">
              <div className="item-info">
                <div className="item-name">
                  {item.name}
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

                <div className="item-controls">
                  <button onClick={() => onDecrease(item.id)}>-</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => onIncrease(item.id)}>+</button>
                  <button
                    className="remove-btn"
                    onClick={() => onRemove(item.id)}
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="item-price">
                R$ {(finalPrice * item.quantity).toFixed(2)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Resumo do pedido */}
      <div className="order-summary">
        <p>Subtotal: R$ {subtotal.toFixed(2)}</p>
        {deliveryFeeTotal > 0 && (
          <p>Taxa de entrega: R$ {deliveryFeeTotal.toFixed(2)}</p>
        )}

        {/* Mostra cupom aplicado */}
        {appliedCoupon && (
          <p>
            Desconto ({appliedCoupon.code}): -R$ {discount.toFixed(2)}
          </p>
        )}

        {/* Total atualizado */}
        <p className="order-total">
          Total: R$ {(total - (discount || 0)).toFixed(2)}
        </p>
      </div>

      {/* Ações do pedido */}
      <div className="order-actions">
   
        <button
          className="btn secondary"
          onClick={() => {
            onAddMore();
          }}
        >
          Adicionar mais itens
        </button>
        <button className="btn primary" onClick={onConfirm} disabled={loading}>
          {loading ? "Enviando..." : "Confirmar Pedido"}
        </button>
      </div>
    </>
  );
}
