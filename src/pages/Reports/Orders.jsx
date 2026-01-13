import { useEffect, useState, useMemo } from "react";
import orderService from "../../services/orderService";
import OrderDetailsModal from "./OrderDetailsModal";
import "./Orders.css";

const STATUS_OPTIONS = [
  { value: "pending", label: "Pendente" },
  { value: "preparation", label: "Em preparação" },
  { value: "finished", label: "Finalizado" },
  { value: "delivered", label: "Entregue" },
];

export default function OrdersList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const data = await orderService.getOrders();
        setOrders(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  const handleStatusChange = async (orderId, status) => {
    try {
      setUpdatingId(orderId);

      const updatedOrder = await orderService.updateOrder(orderId, { status });

      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? updatedOrder : order
        )
      );
    } catch (err) {
      console.error(err);
      alert("Erro ao atualizar status do pedido");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = useMemo(() => {
    if (!search) return orders;

    return orders.filter((order) =>
      String(order.code || order.id)
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [orders, search]);

  if (loading) {
    return <div className="orders-loading">Carregando pedidos...</div>;
  }

  return (
    <div className="orders-page">
      <header className="orders-header">
        <h2>Pedidos</h2>
        <input
          type="text"
          placeholder="Buscar por código ou ID do pedido"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </header>

      {filteredOrders.length === 0 ? (
        <p className="orders-empty">Nenhum pedido encontrado</p>
      ) : (
        <div className="orders-grid">
          {filteredOrders.map((order) => (
            <div key={order.id} className="order-card">
              <div className="order-top">
                <span className="order-code">
                  #{order.code || order.id}
                </span>

                <select
                  className={`order-status status-${order.status}`}
                  value={order.status}
                  disabled={updatingId === order.id}
                  onChange={(e) =>
                    handleStatusChange(order.id, e.target.value)
                  }
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="order-body">
                <p>
                  <strong>Cliente:</strong> {order.fullName}
                </p>
                <p>
                  <strong>Total:</strong> R$ {Number(order.total).toFixed(2)}
                </p>
                <p>
                  <strong>Tipo:</strong> {order.orderType}
                </p>
              </div>

              <div className="order-footer">
                <span>
                  {new Date(order.createdAt).toLocaleDateString("pt-BR")}
                </span>

                <button
                  className="details-btn"
                  onClick={() => setSelectedOrder(order)}
                >
                  Detalhes
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
}
