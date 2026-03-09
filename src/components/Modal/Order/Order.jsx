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

export default function OrdersModal({ company, items, setItems, close }) {
  const [step, setStep] = useState(0); // 0=dados | 1=revisão | 2=sucesso
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
      const subtotal = items.reduce(
        (sum, i) => sum + calculateFinalPrice(i) * i.quantity,
        0,
      );

      const response = await couponService.applyCoupon({
        companyId: company.id,
        code: coupon.code,
        subtotal,
        phone, // envia o telefone para validação se necessário
      });

      // se a API retornou erro, exibe o toast específico
      if (response.error) {
        toast.error(response.error);
        return;
      }

      // sucesso
      setDiscount(Number(response.discount));
      setAppliedCoupon(coupon);
      toast.success(`Cupom ${coupon.code} aplicado 🎉`);
    } catch (err) {
      console.error(err);
      toast.error("Erro inesperado ao aplicar o cupom");
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
        let msg = `📦 *Novo Pedido*\n\n🧾 Código: ${order.code}\n\n`;
        items.forEach((i) => {
          const price = calculateFinalPrice(i).toFixed(2);
          msg += `• ${i.name} x${i.quantity} = R$ ${price}`;
          msg += "\n";
        });
        msg += `\n💰 *Subtotal:* R$ ${subtotal.toFixed(2)}\n`;
        if (deliveryFeeTotal > 0)
          msg += `💵 *Taxa de entrega:* R$ ${deliveryFeeTotal.toFixed(2)}\n`;
        msg += `💳 *Total:* R$ ${total.toFixed(2)}\n`;
        msg += `👤 Cliente: ${fullName}\n📞 Telefone: ${phone}\n`;
        if (orderType === "delivery") msg += `📍 Endereço: ${address}\n`;
        msg += `\n💳 *Pagamento:* ${paymentMethod}\n`;
        if (paymentMethod === "dinheiro") {
          if (needChange && changeAmount)
            msg += `💵 Troco para: R$ ${changeAmount}\n`;
          else msg += `💵 Não precisa de troco\n`;
        }
        if (observations) msg += `\n📝 Observações: ${observations}\n`;
        if (additionalInfo)
          msg += `ℹ️ Informações adicionais: ${additionalInfo}\n`;

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
              {coupons.length > 0 && (
                <div className="available-coupons">
                  <h4>Cupons disponíveis</h4>

                  {coupons
                    .filter(
                      (coupon) =>
                        !appliedCoupon || coupon.id !== appliedCoupon.id,
                    ) // remove o cupom aplicado da lista
                    .map((coupon) => {
                      const isExpired =
                        coupon.expires_at &&
                        new Date(coupon.expires_at) < new Date();
                      const isLimitReached =
                        coupon.usage_limit &&
                        coupon.usage_count >= coupon.usage_limit;

                      // Se já existe um cupom aplicado, todos os outros ficam desabilitados
                      const isDisabled =
                        isExpired ||
                        isLimitReached ||
                        coupon.disabled ||
                        (appliedCoupon && appliedCoupon.id !== coupon.id);

                      return (
                        <div
                          key={coupon.id}
                          className={`coupon-card ${isDisabled ? "coupon-disabled" : ""}`}
                        >
                          <div className="coupon-info">
                            <span className="coupon-name">
                              🎟 {coupon.code}
                            </span>
                            <span className="coupon-desc">
                              {coupon.discount_type === "percent"
                                ? `${coupon.discount_value}% OFF`
                                : `R$ ${coupon.discount_value} OFF`}
                            </span>
                            <span className="coupon-min">
                              Pedido mínimo R${" "}
                              {Number(coupon.min_order_value).toFixed(2)}
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
              <button className="btn primary" onClick={() => setStep(1)}>
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
            onBack={() => setStep(0)}
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
