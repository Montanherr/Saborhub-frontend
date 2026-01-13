import api from "./api";

const orderService = {
  createOrder: async (companyId, orderData) => {
    try {
      const response = await api.post(
        `/orders/company/${companyId}`,
        orderData
      );
      return response.data;
    } catch (error) {
      console.error(
        "Erro ao criar pedido:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  getOrders: async () => {
    try {
      const response = await api.get("/orders");
      return response.data;
    } catch (error) {
      console.error(
        "Erro ao buscar pedidos:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  getOrderById: async (id) => {
    try {
      const response = await api.get(`/orders/${id}`);
      return response.data;
    } catch (error) {
      console.error(
        "Erro ao buscar pedido:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  updateOrder: async (id, updateData) => {
    try {
      const response = await api.put(`/orders/${id}`, updateData);
      return response.data;
    } catch (error) {
      console.error(
        "Erro ao atualizar pedido:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  deleteOrder: async (id) => {
    try {
      const response = await api.delete(`/orders/${id}`);
      return response.data;
    } catch (error) {
      console.error(
        "Erro ao deletar pedido:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  callWaiter: async (orderId) => {
    try {
      const response = await api.put(`/orders/${orderId}`, {
        status: "waiter_called",
      });
      return response.data;
    } catch (error) {
      console.error(
        "Erro ao chamar garçom:",
        error.response?.data || error.message
      );
      throw error;
    }
  },
};

export default orderService;
