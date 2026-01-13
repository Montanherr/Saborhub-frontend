import "./OrderDetailsModal.css";

export default function OrderDetailsModal({ order, onClose }) {
  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <header className="modal-header">
          <h3>Pedido #{order.code}</h3>
          <button onClick={onClose}>✕</button>
        </header>

        <section className="modal-section">
          <h4>Cliente</h4>
          <p><strong>Nome:</strong> {order.fullName}</p>
          <p><strong>Telefone:</strong> {order.phone}</p>
          {order.address && (
            <p><strong>Endereço:</strong> {order.address}</p>
          )}
        </section>

        <section className="modal-section">
          <h4>Itens</h4>

          {order.OrderItems?.map((item) => (
            <div key={item.id} className="item-row">
              <span>{item.Product?.name}</span>
              <span>x{item.quantity}</span>
              <span>
                R$ {(Number(item.price) * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
        </section>

        <section className="modal-section">
          <p><strong>Pagamento:</strong> {order.paymentMethod}</p>
          <p><strong>Status:</strong> {order.status}</p>
          <p><strong>Total:</strong> R$ {Number(order.total).toFixed(2)}</p>
        </section>

        {order.observations && (
          <section className="modal-section">
            <h4>Observações</h4>
            <p>{order.observations}</p>
          </section>
        )}
      </div>
    </div>
  );
}
