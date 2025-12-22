import api from "./api";

const publicTableService = {
  getAll: async (companyId) => {
    try {
      const response = await api.get("/public", {
        params: { companyId },
      });
      return response.data;
    } catch (error) {
      console.error(
        "Erro ao buscar mesas públicas:",
        error.response?.data || error.message
      );
      throw error;
    }
  },
};

export default publicTableService;
