import { useState, useEffect, useRef } from "react";
import orderService from "../../../services/orderService";
import tableService from "../../../services/tableService";
import tableAssignmentsService from "../../../services/tableAssignments";
import couponService from "../../../services/couponService";
import { FaTicketAlt } from "react-icons/fa";
import toast from "react-hot-toast";
import OrderStepper from "../../Order/OrderStepper";
import TableCallModal from "./TableCallModal";
import OrderReviewModal from "./OrderReviewModal";
import OrderSuccessModal from "./OrderSuccessModal";

import { socket } from "socket/socket";

import "./Order.css";

export default function OrdersModal({
  company,
  items,
  setItems,
  close,
  initialStep = 0,
  setHasCustomerData,
}) {
  const [step, setStep] = useState(initialStep);
  const [disableCoupons, setDisableCoupons] = useState(false);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [observations, setObservations] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("dinheiro");
  const [loading, setLoading] = useState(false);

  const [orderType, setOrderType] = useState("delivery"); // delivery | pickup | table
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [calling, setCalling] = useState(false);
  const [callSuccess, setCallSuccess] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [needChange, setNeedChange] = useState(false);
  const [changeAmount, setChangeAmount] = useState("");
  const [coupons, setCoupons] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const acceptedAudio = useRef(null);

  // Calcula preço final considerando promoção
  const calculateFinalPrice = (item) => {
    const price = Number(item.price);
    if (!item.promotion) return price;

    if (item.promotion_type === "percentage") {
      return Math.max(price - (price * Number(item.promotion_value)) / 100, 0);
    }

    // Promoção fixa
    return Number(item.promotion_value) || price;
  };

  const handleIncrease = (id) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item,
      ),
    );
  };

  const handleDecrease = (id) => {
    setItems((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, quantity: item.quantity - 1 } : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const handleRemove = (id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  useEffect(() => {
    setStep(initialStep);
  }, [initialStep]);

  // ===================== MESA =====================
  useEffect(() => {
    if (orderType === "table" && company?.id) {
      tableService.getAll(company.id).then(setTables).catch(console.error);
    }
  }, [orderType, company?.id]);

  useEffect(() => {
    if (!company?.id) return;

    async function loadCoupons() {
      try {
        const data = await couponService.getCoupons(company.id);
        setCoupons(data || []);
      } catch (err) {
        console.error("Erro ao carregar cupons", err);
      }
    }

    loadCoupons();
  }, [company?.id]);

  const handleApplyCoupon = async (coupon) => {
    try {
      if (appliedCoupon) {
        toast.error("Já existe um cupom aplicado");
        return;
      }

      if (!phone || phone.trim().length < 8) {
        toast.error("Informe o telefone para usar cupom");
        return;
      }

      const subtotal = items.reduce(
        (sum, i) => sum + calculateFinalPrice(i) * i.quantity,
        0,
      );

      // pedido mínimo
      if (subtotal < Number(coupon.min_order_value)) {
        toast.error(
          `Pedido mínimo de R$ ${Number(coupon.min_order_value).toFixed(2)}`,
        );
        return;
      }

      // expiração
      if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
        toast.error("Este cupom expirou");
        return;
      }

      // limite de uso
      if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) {
        toast.error("Este cupom atingiu o limite de uso");
        return;
      }

      // validação no backend (uso por telefone etc)
      const response = await couponService.applyCoupon({
        companyId: company.id,
        code: coupon.code,
        subtotal,
        phone,
      });

      if (response?.error) {
        toast.error(response.error);
        return;
      }

      if (!response?.success) {
        toast.error("Cupom inválido");
        return;
      }

      setDiscount(Number(response.discount));
      setAppliedCoupon(coupon);

      toast.success(`Cupom ${coupon.code} aplicado 🎉`);
    } catch (err) {
      console.error(err);

      if (err?.response?.data?.error) {
        toast.error(err.response.data.error);
      } else {
        toast.error("Erro inesperado ao aplicar o cupom");
      }
    }
  };
  const handleCallWaiter = async () => {
    if (!selectedTable) return alert("Selecione uma mesa!");
    try {
      setCalling(true);
      setAudioUnlocked(true);

      await tableAssignmentsService.callWaiter(selectedTable, company.id);
      setCallSuccess(true);
      setTimeout(() => setCallSuccess(false), 3000);
    } catch {
      alert("Erro ao chamar o garçom");
    } finally {
      setCalling(false);
    }
  };

  useEffect(() => {
    acceptedAudio.current = new Audio("/sounds/accept.mp3");
    acceptedAudio.current.preload = "auto";
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("customerData");

    if (saved) {
      const data = JSON.parse(saved);

      setFullName(data.fullName || "");
      setPhone(data.phone || "");
      setAddress(data.address || "");
      setOrderType(data.orderType || "delivery");
      setPaymentMethod(data.paymentMethod || "dinheiro");
    }
  }, []);

  useEffect(() => {
    if (!company?.id || !selectedTable) return;

    const handleSocketUpdate = (data) => {
      if (Number(data.id) !== Number(selectedTable)) return;
      if (data.status === "occupied") {
        if (audioUnlocked && acceptedAudio.current) {
          acceptedAudio.current
            .play()
            .catch((err) => console.warn("Áudio bloqueado:", err));
        }
        if ("vibrate" in navigator) navigator.vibrate([200, 100, 200]);
        setAccepted(true);
      }
    };

    socket.on(`table_update_${company.id}`, handleSocketUpdate);

    return () => {
      socket.off(`table_update_${company.id}`, handleSocketUpdate);
    };
  }, [company?.id, selectedTable, audioUnlocked]);

  // ===================== ENVIO =====================
  const handleSubmit = async () => {
    const subtotal = items.reduce(
      (sum, i) => sum + calculateFinalPrice(i) * i.quantity,
      0,
    );

    const deliveryFeeTotal =
      orderType === "delivery" && company?.delivery_fee
        ? Number(company.delivery_fee)
        : 0;

    const total = subtotal + deliveryFeeTotal - discount;

    // 🔥 SALVA DADOS DO CLIENTE
    localStorage.setItem(
      "customerData",
      JSON.stringify({
        fullName,
        phone,
        address,
        orderType,
        paymentMethod,
      }),
    );

    const payload = {
      companyId: company.id,
      fullName,
      phone,
      address: orderType === "delivery" ? address || "" : "",
      observations,
      additionalInfo,
      paymentMethod,
      changeAmount:
        paymentMethod === "dinheiro" && needChange
          ? Number(changeAmount) || 0
          : 0,
      subtotal,
      delivery_fee: deliveryFeeTotal,
      total,
      orderType,
      couponCode: appliedCoupon?.code,
      items: items.map((i) => ({
        productId: i.id,
        quantity: i.quantity,
      })),
    };

    try {
      setLoading(true);
      const order = await orderService.createOrder(company.id, payload);

      setStep(2);

      // Abrir WhatsApp separado, evitando erros no try principal
      try {
        const companyPhone = company.phone.startsWith("55")
          ? company.phone
          : "55" + company.phone;

        let msg = `📦 *NOVO PEDIDO*\n`;
        msg += `🧾 Código: ${order.code}\n`;
        msg += `━━━━━━━━━━━━━━━\n\n`;

        msg += `🍔 *ITENS DO PEDIDO*\n`;

        items.forEach((i) => {
          const price = calculateFinalPrice(i);
          const totalItem = price * i.quantity;

          msg += `• ${i.name}\n`;
          msg += `  ${i.quantity}x R$ ${price.toFixed(2)} = R$ ${totalItem.toFixed(2)}\n`;
        });

        msg += `\n━━━━━━━━━━━━━━━\n`;
        msg += `💰 *RESUMO*\n`;

        msg += `Subtotal: R$ ${subtotal.toFixed(2)}\n`;

        if (deliveryFeeTotal > 0) {
          msg += `Taxa de entrega: R$ ${deliveryFeeTotal.toFixed(2)}\n`;
        }

        // Cupom
        if (appliedCoupon) {
          msg += `Cupom: ${appliedCoupon.code}`;

          if (appliedCoupon.discount_type === "percent") {
            msg += ` (${appliedCoupon.discount_value}% OFF)\n`;
          } else {
            msg += ` (R$ ${appliedCoupon.discount_value} OFF)\n`;
          }

          msg += `Desconto: -R$ ${Number(discount).toFixed(2)}\n`;
        }

        const finalTotal = subtotal + deliveryFeeTotal - (discount || 0);

        msg += `\n💳 *TOTAL: R$ ${finalTotal.toFixed(2)}*\n`;

        msg += `\n━━━━━━━━━━━━━━━\n`;
        msg += `👤 *CLIENTE*\n`;

        msg += `Nome: ${fullName}\n`;
        msg += `Telefone: ${phone}\n`;

        if (orderType === "delivery") {
          msg += `Endereço: ${address}\n`;
        }

        msg += `\n💳 *PAGAMENTO*\n`;
        msg += `${paymentMethod}\n`;

        if (paymentMethod === "dinheiro") {
          if (needChange && changeAmount) {
            msg += `Troco para: R$ ${changeAmount}\n`;
          } else {
            msg += `Não precisa de troco\n`;
          }
        }

        if (observations) {
          msg += `\n📝 *Observações*\n${observations}\n`;
        }

        if (additionalInfo) {
          msg += `\nℹ️ *Informações adicionais*\n${additionalInfo}\n`;
        }

        window.open(
          `https://wa.me/${companyPhone}?text=${encodeURIComponent(msg)}`,
          "_blank",
        );
      } catch (err) {
        console.warn("Não foi possível abrir o WhatsApp:", err);
      }
    } catch (err) {
      console.error("Erro ao criar pedido:", err);
      alert("Erro ao criar pedido. Confira o console para detalhes.");
    } finally {
      setLoading(false);
    }
  };

  // ===================== CASO NA MESA =====================
  if (orderType === "table") {
    return (
      <TableCallModal
        tables={tables}
        selectedTable={selectedTable}
        setSelectedTable={setSelectedTable}
        calling={calling}
        callSuccess={callSuccess}
        accepted={accepted}
        onCallWaiter={handleCallWaiter}
        onClose={close}
      />
    );
  }

  // ===================== MODAL PADRÃO =====================
  const subtotal = items.reduce(
    (sum, i) => sum + calculateFinalPrice(i) * i.quantity,
    0,
  );

  const deliveryFeeTotal =
    orderType === "delivery" && company?.delivery_fee
      ? Number(company.delivery_fee)
      : 0;

  const total = subtotal + deliveryFeeTotal - discount;

  return (
    <div className="orders-modal-backdrop">
      <div className="orders-modal" style={{ maxWidth: "600px" }}>
        <OrderStepper step={step} />

        {/* ===== ETAPA 0 – DADOS ===== */}
        {step === 0 && (
          <>
            <h3>Seu Pedido - {company.fantasyName}</h3>
            <div className="order-type">
              <label>
                <input
                  type="radio"
                  value="delivery"
                  checked={orderType === "delivery"}
                  onChange={(e) => setOrderType(e.target.value)}
                />
                Entrega
              </label>
              <label>
                <input
                  type="radio"
                  value="pickup"
                  checked={orderType === "pickup"}
                  onChange={(e) => setOrderType(e.target.value)}
                />
                Retirada
              </label>
              <label>
                <input
                  type="radio"
                  value="table"
                  checked={orderType === "table"}
                  onChange={(e) => setOrderType(e.target.value)}
                />
                Na mesa
              </label>
            </div>

            <div className="order-fields">
              <input
                placeholder="Nome completo"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
              <input
                placeholder="Telefone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              {orderType === "delivery" && (
                <input
                  placeholder="Endereço"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              )}
              {coupons.length > 0 && !appliedCoupon && (
                <div className="available-coupons">
                  <h4>Cupons disponíveis</h4>

                  {coupons.map((coupon) => {
                    const now = new Date();

                    const isExpired =
                      coupon.expires_at && new Date(coupon.expires_at) < now;

                    const isLimitReached =
                      coupon.usage_limit &&
                      coupon.usage_count >= coupon.usage_limit;

                    const subtotal = items.reduce(
                      (sum, item) =>
                        sum + calculateFinalPrice(item) * item.quantity,
                      0,
                    );

                    const isMinOrder =
                      subtotal < Number(coupon.min_order_value);

                    const alreadyUsed = coupon.usages?.some(
                      (u) => u.phone === phone,
                    );

                    const isDisabled =
                      isExpired ||
                      isLimitReached ||
                      isMinOrder ||
                      alreadyUsed ||
                      coupon.disabled;

                    return (
                      <div
                        key={coupon.id}
                        className={`coupon-card ${
                          isDisabled ? "coupon-disabled" : ""
                        }`}
                      >
                        <div className="coupon-info">
                          <span className="coupon-name">🎟 {coupon.code}</span>

                          <span className="coupon-desc">
                            {coupon.discount_type === "percent"
                              ? `${coupon.discount_value}% OFF`
                              : `R$ ${coupon.discount_value} OFF`}
                          </span>

                          <span className="coupon-min">
                            Pedido mínimo R${" "}
                            {Number(coupon.min_order_value).toFixed(2)}
                          </span>

                          {isExpired && (
                            <span className="coupon-warning">
                              Cupom expirado
                            </span>
                          )}

                          {isLimitReached && (
                            <span className="coupon-warning">
                              Cupom esgotado
                            </span>
                          )}

                          {isMinOrder && (
                            <span className="coupon-warning">
                              Pedido mínimo não atingido
                            </span>
                          )}

                          {alreadyUsed && (
                            <span className="coupon-warning">
                              Você já utilizou este cupom
                            </span>
                          )}

                          {appliedCoupon && (
                            <div className="coupon-applied">
                              🎟 Cupom {appliedCoupon.code} aplicado
                            </div>
                          )}
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
              )}
              <textarea
                placeholder="Observações"
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
              />
              <textarea
                placeholder="Informações adicionais"
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
              />

              {orderType !== "table" && (
                <div className="payment-section">
                  <h4>Forma de pagamento</h4>
                  <label>
                    <input
                      type="radio"
                      value="dinheiro"
                      checked={paymentMethod === "dinheiro"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    Dinheiro
                  </label>
                  <label>
                    <input
                      type="radio"
                      value="cartao"
                      checked={paymentMethod === "cartao"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    Cartão
                  </label>
                  <label>
                    <input
                      type="radio"
                      value="pix"
                      checked={paymentMethod === "pix"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    Pix
                  </label>

                  {paymentMethod === "dinheiro" && (
                    <div className="change-section">
                      <label className="change-checkbox">
                        <input
                          type="checkbox"
                          checked={needChange}
                          onChange={(e) => setNeedChange(e.target.checked)}
                        />
                        Precisa de troco?
                      </label>
                      {needChange && (
                        <input
                          type="number"
                          placeholder="Troco para quanto? Ex: 100"
                          value={changeAmount}
                          onChange={(e) => setChangeAmount(e.target.value)}
                          min="0"
                        />
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="order-actions">
              <button className="btn cancel" onClick={close}>
                Fechar
              </button>
              <button
                className="btn primary"
                onClick={() => {
                  setHasCustomerData(true);
                  setStep(1);
                }}
              >
                Revisar Pedido
              </button>
            </div>
          </>
        )}

        {/* ===== ETAPA 1 – REVISÃO ===== */}
        {step === 1 && (
          <OrderReviewModal
            items={items}
            subtotal={subtotal}
            deliveryFeeTotal={deliveryFeeTotal}
            total={total}
            calculateFinalPrice={calculateFinalPrice}
            loading={loading}
            onBack={() => setStep(1)}
            onConfirm={handleSubmit}
            onAddMore={() => {
              close();
              setDisableCoupons(true); // sinaliza que voltou do modal
            }}
            onIncrease={handleIncrease} // ✅ AGORA PASSA
            onDecrease={handleDecrease} // ✅ AGORA PASSA
            onRemove={handleRemove} // ✅ AGORA PASSA
            onClose={close}
            // NOVO: props do cupom
            appliedCoupon={appliedCoupon}
            discount={discount}
            coupons={coupons} // lista de cupons disponíveis
            handleApplyCoupon={handleApplyCoupon}
            phone={phone}
            disableCoupons={disableCoupons} // NOVO: sinaliza para desabilitar
          />
        )}

        {/* ===== ETAPA 2 – SUCESSO ===== */}
        {step === 2 && (
          <OrderSuccessModal
            onClose={() => {
              setItems([]);
              close();
            }}
          />
        )}
      </div>
    </div>
  );
}
