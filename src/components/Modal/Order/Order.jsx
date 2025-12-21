import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import orderService from "../../../services/orderService";
import tableService from "../../../services/tableService";
import tableAssignmentsService from "../../../services/tableAssignments";

import OrderStepper from "../../Order/OrderStepper";
import TableCallModal from "./TableCallModal";
import OrderReviewModal from "./OrderReviewModal";
import OrderSuccessModal from "./OrderSuccessModal";

import "./Order.css";

export default function OrdersModal({ company, items, setItems, close }) {
  const [step, setStep] = useState(0); // 0=dados | 1=revisão | 2=sucesso

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [observations, setObservations] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("dinheiro");
  const [changeAmount, setChangeAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const [orderType, setOrderType] = useState("delivery"); // delivery | pickup | table
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [calling, setCalling] = useState(false);
  const [callSuccess, setCallSuccess] = useState(false);

  const navigate = useNavigate();

  const total = items
    .reduce((sum, i) => sum + i.price * i.quantity, 0)
    .toFixed(2);

  /* ===================== MESA ===================== */
  useEffect(() => {
    if (orderType === "table" && company?.id) {
      tableService.getAll(company.id).then(setTables).catch(console.error);
    }
  }, [orderType, company?.id]);

  const handleCallWaiter = async () => {
    if (!selectedTable) return alert("Selecione uma mesa!");
    try {
      setCalling(true);
      await tableAssignmentsService.callWaiter(selectedTable, company.id);
      setCallSuccess(true);
      setTimeout(() => setCallSuccess(false), 3000);
    } catch {
      alert("Erro ao chamar o garçom");
    } finally {
      setCalling(false);
    }
  };

  /* ===================== ENVIO ===================== */
  const handleSubmit = async () => {
    const payload = {
      companyId: company.id,
      fullName,
      phone,
      address: orderType === "delivery" ? address : null,
      observations,
      additionalInfo,
      paymentMethod,
      changeAmount: paymentMethod === "dinheiro" ? changeAmount : null,
      total,
      orderType,
      items: items.map((i) => ({
        productId: i.id,
        quantity: i.quantity,
      })),
    };

    try {
      setLoading(true);

      const order = await orderService.createOrder(payload);

      const companyPhone = company.phone.startsWith("55")
        ? company.phone
        : "55" + company.phone;

      let msg = `📦 Novo Pedido\n\nCódigo: ${order.code}\n\n`;
      items.forEach((i) => {
        msg += `- ${i.name} x${i.quantity} = R$ ${(i.price * i.quantity).toFixed(2)}\n`;
      });
      msg += `\nTotal: R$ ${total}\n`;
      msg += `Cliente: ${fullName}\nTelefone: ${phone}\n`;
      if (orderType === "delivery") msg += `Endereço: ${address}\n`;
      msg += `Pagamento: ${paymentMethod}\n`;
      if (paymentMethod === "dinheiro" && changeAmount && changeAmount !== "")
        msg += `Troco para: R$ ${changeAmount}\n`;

      window.open(
        `https://wa.me/${companyPhone}?text=${encodeURIComponent(msg)}`,
        "_blank"
      );

      setStep(2);
    } catch {
      alert("Erro ao criar pedido");
    } finally {
      setLoading(false);
    }
  };

  /* ===================== CASO NA MESA ===================== */
  if (orderType === "table") {
    return (
      <TableCallModal
        tables={tables}
        selectedTable={selectedTable}
        setSelectedTable={setSelectedTable}
        calling={calling}
        callSuccess={callSuccess}
        onCallWaiter={handleCallWaiter}
        onClose={close}
      />
    );
  }

  /* ===================== MODAL PADRÃO ===================== */
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

              {/* ===== PAGAMENTO ===== */}
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
                      <label>Precisa de troco?</label>
                      <select
                        value={changeAmount}
                        onChange={(e) => setChangeAmount(e.target.value)}
                      >
                        <option value="">Não</option>
                        <option value="20">R$ 20</option>
                        <option value="50">R$ 50</option>
                        <option value="100">R$ 100</option>
                      </select>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ===== BOTÕES ===== */}
            <div
              className="order-actions"
              style={{ display: "flex", gap: "10px", marginTop: "20px" }}
            >
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
            total={total}
            loading={loading}
            onBack={() => setStep(0)}
            onConfirm={handleSubmit}
            onAddMore={() => {
              close();
              navigate(`/companies/${company.id}/categories`);
            }}
            onClose={close}
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
