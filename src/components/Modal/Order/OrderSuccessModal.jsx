export default function OrderSuccessModal({ onClose }) {
  return (
    <div className="orders-modal-backdrop">
      <div className="orders-modal success">
        <h3>🎉 Pedido enviado com sucesso!</h3>
        <p>Seu pedido foi enviado para o estabelecimento.</p>

        <button className="btn primary" onClick={onClose}>
          Fechar
        </button>
      </div>
    </div>
  );
}
