import api from "./api";

const waiterService = {
  getAll: async (companyId) => {
    try {
      const query = companyId ? `?companyId=${companyId}` : "";
      const response = await api.get(`/waiters${query}`);
      return response.data;
    } catch (err) {
      console.error("Erro ao buscar garçons:", err.response?.data || err.message);
      return [];
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/waiters/${id}`);
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar garçom:", error.response?.data || error.message);
      throw error;
    }
  },

  create: async (data) => {
    try {
      const response = await api.post("/waiters", data);
      return response.data;
    } catch (error) {
      console.error("Erro ao criar garçom:", error.response?.data || error.message);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const response = await api.put(`/waiters/${id}`, data);
      return response.data;
    } catch (error) {
      console.error("Erro ao atualizar garçom:", error.response?.data || error.message);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/waiters/${id}`);
      return response.data;
    } catch (error) {
      console.error("Erro ao deletar garçom:", error.response?.data || error.message);
      throw error;
    }
  },
};

export default waiterService;
