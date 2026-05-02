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
  onCustomize,
  discount,
  coupons,
  handleApplyCoupon,
  phone,
}) {
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  const additionalsSummary = items.flatMap((item) =>
    (item.additionals || []).map((add) => ({
      ...add,
      total: add.price * add.quantity,
    })),
  );

  const additionalsTotal = additionalsSummary.reduce(
    (sum, add) => sum + add.total,
    0,
  );

  return (
    <div className="order-review-modal">
      {" "}
      {/* 👈 ESSENCIAL */}
      <Toaster position="top-right" />
      {/* ── Cabeçalho ── */}
      <div className="cart-header">
        <h3>🛒 Seu Carrinho</h3>
        <span className="cart-count">
          {totalItems} {totalItems === 1 ? "item" : "itens"}
        </span>
      </div>
      {/* ── Lista de itens ── */}
      <div className="order-items">
        {items.map((item) => {
          const finalPrice = calculateFinalPrice(item);

          return (
            <div key={item.uniqueId} className="order-item">
              {" "}
              <div className="item-info">
                <div className="item-name">
                  <div className="item-name-row">
                    <span>{item.name}</span>

                    <button
                      className="person"
                      onClick={() => onCustomize(item)}
                    >
                      Personalizar
                    </button>
                  </div>

                  {item.additionals?.length > 0 && (
                    <div className="additionals-list">
                      {item.additionals.map((add) => (
                        <div key={add.id} className="additional-line">
                          <span>
                            + {add.quantity}x {add.name}
                          </span>

                          <span className="additional-price">
                            +R$ {(add.price * add.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  {/* Promoção */}
                  {item.promotion && (
                    <span className="promo-tag">
                      {item.promotion_type === "percentage"
                        ? `−${item.promotion_value}%`
                        : `−R$ ${Number(item.promotion_value).toFixed(2)}`}
                    </span>
                  )}
                </div>

                <div className="item-controls">
                  <button onClick={() => onDecrease(item.uniqueId)}>-</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => onIncrease(item.uniqueId)}>
                    +
                  </button>{" "}
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
      {/* ── Resumo financeiro ── */}
      <div className="order-summary">
        {/* SUBTOTAL */}
        <p>
          <span>Subtotal</span>
          <span>R$ {subtotal.toFixed(2)}</span>
        </p>

        {/* 🔥 ADICIONAIS */}
        {additionalsSummary.length > 0 && (
          <div className="additionals-summary">
            <p className="additionals-title">Adicionais</p>

            {additionalsSummary.map((add, index) => (
              <p key={index} className="additional-line">
                <span>
                  + {add.quantity}x {add.name}
                </span>
                <span>R$ {add.total.toFixed(2)}</span>
              </p>
            ))}

            <p className="additionals-total">
              <span>Total adicionais</span>
              <span>R$ {additionalsTotal.toFixed(2)}</span>
            </p>
          </div>
        )}

        {/* TAXA */}
        {deliveryFeeTotal > 0 && (
          <p>
            <span>Taxa de entrega</span>
            <span>R$ {deliveryFeeTotal.toFixed(2)}</span>
          </p>
        )}

        {/* CUPOM */}
        {appliedCoupon && (
          <div className="coupon-line">
            <span>🎟 Cupom ({appliedCoupon.code})</span>
            <span className="discount-value">−R$ {discount.toFixed(2)}</span>
          </div>
        )}
        {discount > 0 && (
          <p className="old-total">
            <span>Antes do desconto</span>
            <span>R$ {(subtotal + deliveryFeeTotal).toFixed(2)}</span>
          </p>
        )}

        {/* TOTAL FINAL */}
        <p className="order-total">
          <span>Total</span>
          <span>
            R$ {(subtotal + deliveryFeeTotal - (discount || 0)).toFixed(2)}
          </span>
        </p>
      </div>
      {/* ── Ações ── */}
      <div className="order-actions">
        <button className="btn secondary" onClick={onAddMore}>
          + Adicionar mais itens
        </button>

        <button className="btn primary" onClick={onConfirm} disabled={loading}>
          {loading ? "Enviando…" : "Confirmar Pedido →"}
        </button>
      </div>
    </div>
  );
}
