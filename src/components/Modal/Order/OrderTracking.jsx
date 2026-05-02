import { useEffect, useState } from "react";
import orderService from "../../../services/orderService";
import "./OrderTracking.css";

const statusMap = {
  pending: "Pedido recebido",
  preparing: "Em preparo",
  ready: "Pronto",
  out_for_delivery: "Saiu para entrega",
  delivered: "Entregue",
};

const steps = [
  "pending",
  "preparing",
  "ready",
  "out_for_delivery",
  "delivered",
];

export default function OrderTracking() {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔗 pega código da URL
  const code = window.location.pathname.split("/").pop();

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const data = await orderService.trackOrder(code);
        setOrder(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();

    // 🔄 auto atualização (tipo iFood)
    const interval = setInterval(fetchOrder, 5000);

    return () => clearInterval(interval);
  }, [code]);

  // ⏳ loading
  if (loading) {
    return <div className="loading">Carregando pedido...</div>;
  }

  if (!order) {
    return <div className="loading">Pedido não encontrado</div>;
  }

  const currentIndex = steps.indexOf(order.status);

  // 🍔🍕 detecta tipo
  const getFoodIcon = () => {
    const names =
      order.items?.map((i) =>
        (i.Product?.name || i.product?.name || "").toLowerCase()
      ) || [];

    if (names.some((n) => n.includes("pizza"))) return "🍕";
    if (names.some((n) => n.includes("hamburguer"))) return "🍔";

    return "🍽️";
  };

  return (
    <div className="tracking-container">
      <div className="card">
        <h2>Pedido {order.code}</h2>
        <p className="status">{statusMap[order.status]}</p>

        {/* 🛵 ANIMAÇÃO */}
        {order.status === "out_for_delivery" && (
          <div className="delivery-scene">
            <div className="road"></div>

            <div className="rider">
              <div className="helmet"></div>
              <div className="body"></div>

              <div className="bike">
                <div className="wheel front"></div>
                <div className="wheel back"></div>
                <div className="frame"></div>
                <div className="box">{getFoodIcon()}</div>
              </div>
            </div>
          </div>
        )}

        {/* Timeline */}
        <div className="timeline">
          {steps.map((step, index) => (
            <div
              key={step}
              className={`step ${index <= currentIndex ? "active" : ""}`}
            >
              <div className="circle"></div>
              <span>{statusMap[step]}</span>
            </div>
          ))}
        </div>

        {/* Itens */}
        <div className="items">
          <h3>Itens do pedido</h3>

          {order.items?.map((item) => (
            <div key={item.id} className="item">
              <span className="icon">{getFoodIcon()}</span>

              <div>
                <strong>
                  {item.Product?.name || item.product?.name || "Produto"}
                </strong>
                <p>Qtd: {item.quantity}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="total">
          Total: R$ {Number(order.total).toFixed(2)}
        </div>
      </div>
    </div>
  );
}