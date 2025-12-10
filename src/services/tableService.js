import api from "./api";

const tableService = {
  createTable: async (data) => {
    const response = await api.post("/tables", data);
    return response.data;
  },

  getTables: async () => {
    const response = await api.get("/tables");
    return response.data;
  },

  getTableById: async (id) => {
    const response = await api.get(`/tables/${id}`);
    return response.data;
  },

  updateTable: async (id, data) => {
    const response = await api.put(`/tables/${id}`, data);
    return response.data;
  },

  deleteTable: async (id) => {
    const response = await api.delete(`/tables/${id}`);
    return response.data;
  }
};

export default tableService;
