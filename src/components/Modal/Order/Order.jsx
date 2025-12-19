import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import orderService from "../../../services/orderService";
import tableService from "../../../services/tableService";
import tableAssignmentsService from "../../../services/tableAssignments";
import "./Order.css";

export default function OrdersModal({ company, items, setItems, close }) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [observations, setObservations] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("dinheiro");
  const [needChange, setNeedChange] = useState(true);
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

  // Buscar mesas quando pedido for "na mesa"
  useEffect(() => {
    if (orderType === "table" && company?.id) {
      tableService
        .getAll(company.id)
        .then(setTables)
        .catch(console.error);
    }
  }, [orderType, company?.id]);

  const handleRemove = id => setItems(items.filter(i => i.id !== id));

  const handleAddMore = () => {
    close();
    navigate(`/companies/${company.id}/categories`);
  };

  const handleCallWaiter = async () => {
    if (!selectedTable) return alert("Selecione uma mesa primeiro!");

    try {
      setCalling(true);
      setCallSuccess(false);

      await tableAssignmentsService.callWaiter(selectedTable, company.id);

      setCallSuccess(true);
      setTimeout(() => setCallSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      alert("Erro ao chamar o garçom");
    } finally {
      setCalling(false);
    }
  };

  const handleSubmit = async () => {
    if (!fullName || !phone || items.length === 0) {
      return alert("Preencha os campos e adicione pelo menos um item!");
    }

    if (orderType === "table" && !selectedTable) {
      return alert("Selecione a mesa!");
    }

    if (needChange && !changeAmount) {
      return alert("Informe o valor do troco!");
    }

    const payload = {
      companyId: company.id,
      fullName,
      phone,
      address: orderType === "delivery" ? address : null,
      observations,
      additionalInfo,
      paymentMethod,
      needChange,
      changeAmount: needChange ? changeAmount : null,
      total,
      orderType,
      tableId: orderType === "table" ? Number(selectedTable) : null,
      items: items.map(i => ({
        productId: i.id,
        quantity: i.quantity
      }))
    };

    try {
      setLoading(true);

      const order = await orderService.createOrder(payload);
      const code = order.code;

  

      const companyPhone = company.phone.startsWith("55")
        ? company.phone
        : "55" + company.phone;

      let msg = `*📦 Novo Pedido*\n\n`;
      msg += `*Código:* ${code}\n\n`;
      msg += `*Itens:*\n`;
      items.forEach(item => {
        msg += `- ${item.name} x${item.quantity} = R$ ${(item.price * item.quantity).toFixed(2)}\n`;
      });
      msg += `\n*Total:* R$ ${total}\n\n`;
      msg += `Cliente: ${fullName}\nTelefone: ${phone}\n`;
      if (orderType === "delivery") msg += `Endereço: ${address}\n`;
      msg += `Pagamento: ${paymentMethod}\n`;
      msg += `Troco: ${needChange ? changeAmount : "Não"}\n`;
      if (orderType === "table") {
        msg += `Mesa: ${selectedTable}\n`;
      }

      window.open(
        `https://wa.me/${companyPhone}?text=${encodeURIComponent(msg)}`,
        "_blank"
      );

      setItems([]);
      close();
    } catch (err) {
      console.error(err);
      alert("Erro ao criar pedido");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="orders-modal-backdrop">
      <div className="orders-modal">
        <h3>Seu Pedido - {company.fantasyName}</h3>

        {/* Tipo de pedido */}
        <div className="order-type">
          <label>
            <input type="radio" value="delivery"
              checked={orderType === "delivery"}
              onChange={e => setOrderType(e.target.value)}
            /> Entrega
          </label>

          <label>
            <input type="radio" value="pickup"
              checked={orderType === "pickup"}
              onChange={e => setOrderType(e.target.value)}
            /> Retirada
          </label>

          <label>
            <input type="radio" value="table"
              checked={orderType === "table"}
              onChange={e => setOrderType(e.target.value)}
            /> Na mesa
          </label>
        </div>

        {/* Campos gerais */}
        <div className="order-fields">
          <input placeholder="Nome completo" value={fullName} onChange={e => setFullName(e.target.value)} />
          <input placeholder="Telefone" value={phone} onChange={e => setPhone(e.target.value)} />

          {orderType === "delivery" && (
            <input placeholder="Endereço" value={address} onChange={e => setAddress(e.target.value)} />
          )}

          <textarea placeholder="Observações" value={observations} onChange={e => setObservations(e.target.value)} />
          <textarea placeholder="Informações adicionais" value={additionalInfo} onChange={e => setAdditionalInfo(e.target.value)} />

          <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
            <option value="dinheiro">Dinheiro</option>
            <option value="cartao">Cartão</option>
            <option value="pix">Pix</option>
          </select>

          <label>
            <input type="checkbox" checked={needChange} onChange={e => setNeedChange(e.target.checked)} />
            Necessita troco
          </label>

          {needChange && (
            <input placeholder="Valor do troco" value={changeAmount} onChange={e => setChangeAmount(e.target.value)} />
          )}
        </div>

        {/* Mesa */}
        {orderType === "table" && (
          <div className="table-section">
            <select value={selectedTable || ""} onChange={e => setSelectedTable(e.target.value)}>
              <option value="">Selecione a mesa</option>
              {tables.map(t => (
                <option key={t.id} value={t.id}>Mesa {t.number}</option>
              ))}
            </select>

            <button
              className={`call-waiter-btn ${calling ? "loading" : ""} ${callSuccess ? "success" : ""}`}
              onClick={handleCallWaiter}
              disabled={!selectedTable || calling}
            >
              {calling ? "Chamando..." : callSuccess ? "Garçom chamado ✅" : "Chamar Garçom"}
            </button>
          </div>
        )}

        {/* Itens */}
        <div className="order-items">
          {items.map(item => (
            <div key={item.id} className="order-item">
              {item.name} x{item.quantity} – R$ {(item.price * item.quantity).toFixed(2)}
              <button onClick={() => handleRemove(item.id)}>Remover</button>
            </div>
          ))}
        </div>

        <p className="order-total">Total: R$ {total}</p>

        <div className="order-actions">
          <button className="btn cancel" onClick={close}>Fechar</button>
          <button className="btn secondary" onClick={handleAddMore}>Adicionar mais</button>
          <button className="btn primary" onClick={handleSubmit} disabled={loading}>
            {loading ? "Enviando..." : "Enviar para WhatsApp"}
          </button>
        </div>
      </div>
    </div>
  );
}
