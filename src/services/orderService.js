import api from "./api"; // seu axios já configurado

const orderService = {
  // ==============================
  // Criar pedido
  // ==============================
  createOrder: async (orderData) => {
    try {
      const response = await api.post("/orders", orderData);
      return response.data;
    } catch (error) {
      console.error("Erro ao criar pedido:", error.response?.data || error.message);
      throw error;
    }
  },

  // ==============================
  // Listar todos os pedidos
  // ==============================
  getOrders: async () => {
    try {
      const response = await api.get("/orders");
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar pedidos:", error.response?.data || error.message);
      throw error;
    }
  },

  // ==============================
  // Buscar pedido por ID
  // ==============================
  getOrderById: async (id) => {
    try {
      const response = await api.get(`/orders/${id}`);
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar pedido:", error.response?.data || error.message);
      throw error;
    }
  },

  // ==============================
  // Atualizar pedido
  // ==============================
  updateOrder: async (id, updateData) => {
    try {
      const response = await api.put(`/orders/${id}`, updateData);
      return response.data;
    } catch (error) {
      console.error("Erro ao atualizar pedido:", error.response?.data || error.message);
      throw error;
    }
  },

  // ==============================
  // Deletar pedido
  // ==============================
  deleteOrder: async (id) => {
    try {
      const response = await api.delete(`/orders/${id}`);
      return response.data;
    } catch (error) {
      console.error("Erro ao deletar pedido:", error.response?.data || error.message);
      throw error;
    }
  }
};

export default orderService;
