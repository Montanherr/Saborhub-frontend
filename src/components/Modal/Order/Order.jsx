import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import orderService from "../../../services/orderService";
import tableService from "../../../services/tableService";
import waiterService from "../../../services/waiterService";
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

  // Novos estados
  const [orderType, setOrderType] = useState("delivery"); // delivery | pickup | table
  const [tables, setTables] = useState([]);
  const [waiters, setWaiters] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [selectedWaiter, setSelectedWaiter] = useState(null);
  const [callWaiter, setCallWaiter] = useState(false);

  const navigate = useNavigate();
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0).toFixed(2);

  // Buscar mesas e garçons apenas quando orderType = table
  useEffect(() => {
    if (orderType === "table" && company?.id) {
      tableService.getAll(company.id).then(setTables).catch(err => console.error(err));
      waiterService.getAll(company.id).then(setWaiters).catch(err => console.error(err));
    }
  }, [orderType, company?.id]);

  const handleRemove = (id) => setItems(items.filter(i => i.id !== id));
  const handleAddMore = () => {
    close();
    navigate(`/companies/${company.id}/categories`);
  };

  const handleSubmit = async () => {
    if (!fullName || !phone || items.length === 0) {
      return alert("Preencha os campos e adicione pelo menos um item!");
    }

    if (orderType === "table" && !selectedTable) {
      return alert("Selecione a mesa para pedidos na mesa!");
    }

    if (needChange && !changeAmount) {
      return alert("Informe o valor do troco necessário!");
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
      tableId: selectedTable ? Number(selectedTable) : null,
      waiterId: selectedWaiter ? Number(selectedWaiter) : null,
      callWaiter,
      items: items.map(i => ({ productId: i.id, quantity: i.quantity })),
    };

    try {
      setLoading(true);
      const order = await orderService.createOrder(payload);
      const code = order.code;

      let companyPhone = company.phone.startsWith("55") ? company.phone : "55" + company.phone;

      // Mensagem WhatsApp
      let msg = `*📦 Novo Pedido*\n\n`;
      msg += `*📝 Código do Pedido:* ${code}\n\n`;
      msg += `*🛒 Itens:*\n`;
      items.forEach(item => {
        msg += `- ${item.name} x${item.quantity} = R$ ${(item.price * item.quantity).toFixed(2)}\n`;
      });
      msg += `\n*💰 Total:* R$ ${total}\n\n`;
      msg += `*👤 Cliente:*\nNome: ${fullName}\nTelefone: ${phone}\n`;
      if (orderType === "delivery") msg += `Endereço: ${address}\n\n`;
      msg += `*📝 Observações:* ${observations || "Nenhuma"}\n`;
      msg += `*ℹ️ Informações adicionais:* ${additionalInfo || "Nenhuma"}\n`;
      msg += `*💳 Pagamento:* ${paymentMethod}\n`;
      msg += `Troco necessário: ${needChange ? "Sim, para R$ " + changeAmount : "Não"}\n`;
      if (orderType === "table") {
        msg += `Mesa: ${selectedTable}\n`;
        msg += `Garçom: ${selectedWaiter || "Nenhum"}\n`;
        msg += `Chamar Garçom: ${callWaiter ? "Sim" : "Não"}\n`;
      }

      window.open(`https://wa.me/${companyPhone}?text=${encodeURIComponent(msg)}`, "_blank");

      setItems([]);
      close();
    } catch (err) {
      console.error(err);
      alert("Erro ao criar pedido!");
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
            <input type="radio" value="delivery" checked={orderType === "delivery"} onChange={e => setOrderType(e.target.value)} /> Entrega
          </label>
          <label>
            <input type="radio" value="pickup" checked={orderType === "pickup"} onChange={e => setOrderType(e.target.value)} /> Retirada
          </label>
          <label>
            <input type="radio" value="table" checked={orderType === "table"} onChange={e => setOrderType(e.target.value)} /> Na mesa
          </label>
        </div>

        {/* Campos gerais */}
        <div className="order-fields">
          <input type="text" placeholder="Nome completo" value={fullName} onChange={e => setFullName(e.target.value)} />
          <input type="text" placeholder="Telefone" value={phone} onChange={e => setPhone(e.target.value)} />
          {orderType === "delivery" && <input placeholder="Endereço" value={address} onChange={e => setAddress(e.target.value)} />}
          <textarea placeholder="Observações" value={observations} onChange={e => setObservations(e.target.value)} />
          <textarea placeholder="Informações adicionais" value={additionalInfo} onChange={e => setAdditionalInfo(e.target.value)} />
          <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
            <option value="dinheiro">Dinheiro</option>
            <option value="cartao">Cartão</option>
            <option value="pix">Pix</option>
          </select>
          <label>
            <input type="checkbox" checked={needChange} onChange={e => setNeedChange(e.target.checked)} /> Necessita troco
          </label>
          {needChange && <input type="text" placeholder="Valor do troco" value={changeAmount} onChange={e => setChangeAmount(e.target.value)} />}
        </div>

        {/* Mesa e garçom */}
        {orderType === "table" && (
          <div className="table-waiter-select">
            <select value={selectedTable || ""} onChange={e => setSelectedTable(e.target.value)}>
              <option value="">Selecione a mesa</option>
              {tables.map(t => <option key={t.id} value={t.id}>Mesa {t.number}</option>)}
            </select>
            <select value={selectedWaiter || ""} onChange={e => setSelectedWaiter(e.target.value)}>
              <option value="">Garçom (opcional)</option>
              {waiters.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
            <label>
              <input type="checkbox" checked={callWaiter} onChange={e => setCallWaiter(e.target.checked)} /> Chamar Garçom
            </label>
          </div>
        )}

        {/* Itens do pedido */}
        <div className="order-items">
          {items.map(item => (
            <div key={item.id} className="order-item">
              {item.name} x{item.quantity} - R$ {(item.price * item.quantity).toFixed(2)}
              <button onClick={() => handleRemove(item.id)}>Remover</button>
            </div>
          ))}
        </div>

        <p className="order-total">Total: R$ {total}</p>

        <div className="order-actions">
          <button onClick={close}>Fechar</button>
          <button onClick={handleAddMore}>Adicionar mais produtos</button>
          <button onClick={handleSubmit} disabled={loading}>{loading ? "Enviando..." : "Enviar para WhatsApp"}</button>
        </div>
      </div>
    </div>
  );
}
