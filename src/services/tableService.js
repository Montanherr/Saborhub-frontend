import api from "./api";

const tableService = {
  getAll: async (companyId) => {
    try {
      const response = await api.get("/tables", { params: { companyId } });
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar mesas:", error.response?.data || error.message);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/tables/${id}`);
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar mesa:", error.response?.data || error.message);
      throw error;
    }
  },

  create: async (data) => {
    try {
      const response = await api.post("/tables", data);
      return response.data;
    } catch (error) {
      console.error("Erro ao criar mesa:", error.response?.data || error.message);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const response = await api.put(`/tables/${id}`, data);
      return response.data;
    } catch (error) {
      console.error("Erro ao atualizar mesa:", error.response?.data || error.message);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/tables/${id}`);
      return response.data;
    } catch (error) {
      console.error("Erro ao deletar mesa:", error.response?.data || error.message);
      throw error;
    }
  },
};

export default tableService;
