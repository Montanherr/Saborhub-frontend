// src/components/OrdersModal/OrdersModal.jsx
import { useState } from "react";
import orderService from "../../../services/orderService";
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

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0).toFixed(2);

  const handleRemove = (id) => {
    setItems(items.filter(i => i.id !== id));
  };

  const handleSubmit = async () => {
    if (!fullName || !phone || items.length === 0) {
      return alert("Preencha os campos e adicione pelo menos um item!");
    }

    const payload = {
      companyId: company.id,
      fullName,
      phone,
      address,
      observations,
      additionalInfo,
      paymentMethod,
      needChange,
      changeAmount,
      total,
      items: items.map(i => ({
        productId: i.id,
        quantity: i.quantity
      }))
    };

    try {
      setLoading(true);

      // Criar pedido e pegar a resposta
 const order = await orderService.createOrder(payload);
const code = order.code;

      // Garantir que o telefone da empresa tenha código do país (Brasil = 55)
      let companyPhone = company.phone;
      if (!companyPhone.startsWith("55")) {
        companyPhone = "55" + companyPhone;
      }

      // Montar mensagem formatada para WhatsApp
      let msg = `*📦 Novo Pedido*\n\n`;
      msg += `*📝 Código do Pedido:* ${code}\n\n`;
      msg += `*🛒 Itens:*\n`;
      items.forEach(item => {
        msg += `- ${item.name} x${item.quantity} = R$ ${(item.price * item.quantity).toFixed(2)}\n`;
      });
      msg += `\n*💰 Total:* R$ ${total}\n\n`;
      msg += `*👤 Cliente:*\nNome: ${fullName}\nTelefone: ${phone}\nEndereço: ${address}\n\n`;
      msg += `*📝 Observações:* ${observations || "Nenhuma"}\n`;
      msg += `*ℹ️ Informações adicionais:* ${additionalInfo || "Nenhuma"}\n`;
      msg += `*💳 Pagamento:* ${paymentMethod}\n`;
      msg += `Troco necessário: ${needChange ? "Sim, para R$ " + changeAmount : "Não"}`;

      // Abrir WhatsApp com a mensagem
      window.open(`https://wa.me/${companyPhone}?text=${encodeURIComponent(msg)}`, "_blank");

      // Limpar itens e fechar modal
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

        <div className="order-fields">
          <input
            type="text"
            placeholder="Nome completo"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Telefone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <input
            type="text"
            placeholder="Endereço"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
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
          <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
            <option value="dinheiro">Dinheiro</option>
            <option value="cartao">Cartão</option>
            <option value="pix">Pix</option>
          </select>
          <label>
            <input
              type="checkbox"
              checked={needChange}
              onChange={(e) => setNeedChange(e.target.checked)}
            /> Necessita troco
          </label>
          {needChange && (
            <input
              type="text"
              placeholder="Valor do troco"
              value={changeAmount}
              onChange={(e) => setChangeAmount(e.target.value)}
            />
          )}
        </div>

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
          <button onClick={handleSubmit} disabled={loading}>
            {loading ? "Enviando..." : "Enviar para WhatsApp"}
          </button>
        </div>
      </div>
    </div>
  );
}
