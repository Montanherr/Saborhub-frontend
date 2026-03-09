import "./OrderReviewModal.css";
import { FaTicketAlt } from "react-icons/fa";
import { Toaster } from "react-hot-toast";

export default function OrderReviewModal({
  items,
  subtotal,
  deliveryFeeTotal,
  total,
  calculateFinalPrice,
  loading,
  onConfirm,
  onBack,
  onAddMore,
  onIncrease,
  onDecrease,
  onRemove,
  appliedCoupon,
  discount,
  coupons,
  handleApplyCoupon,
  phone
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

      {/* Cupons disponíveis */}
      <div className="coupons-section">
        <h4>Cupons disponíveis</h4>

        {coupons
          .filter(coupon => !appliedCoupon || coupon.id !== appliedCoupon.id) // remove cupom aplicado
          .map((coupon) => {
            const isExpired = coupon.expires_at && new Date(coupon.expires_at) < new Date();
            const isLimitReached = coupon.usage_limit && coupon.usage_count >= coupon.usage_limit;
            const isDisabled = isExpired || isLimitReached || coupon.disabled || (appliedCoupon && appliedCoupon.id);

            return (
              <div
                key={coupon.id}
                className={`coupon-card ${isDisabled ? "coupon-disabled" : ""}`}
              >
                <div className="coupon-info">
                  <span className="coupon-name">🎟 {coupon.code}</span>
                  <span className="coupon-desc">
                    {coupon.discount_type === "percent"
                      ? `${coupon.discount_value}% OFF`
                      : `R$ ${coupon.discount_value} OFF`}
                  </span>
                  <span className="coupon-min">
                    Pedido mínimo R$ {Number(coupon.min_order_value).toFixed(2)}
                  </span>
                </div>

                <button
                  className="apply-coupon-btn"
                  onClick={() => handleApplyCoupon(coupon)}
                  disabled={isDisabled}
                >
                  <FaTicketAlt />
                </button>
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
          <p>Desconto ({appliedCoupon.code}): -R$ {discount.toFixed(2)}</p>
        )}

        {/* Total atualizado */}
        <p className="order-total">
          Total: R$ {(total - (discount || 0)).toFixed(2)}
        </p>
      </div>

      {/* Ações do pedido */}
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