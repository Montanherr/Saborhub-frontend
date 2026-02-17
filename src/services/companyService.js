import api from "./api";

const companyService = {
  getAll: async () => {
    const response = await api.get("/companies");
    return response.data;
  },

  getAdminCompanies: async () => {
    const response = await api.get("/companies/admin");
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/companies/${id}`);
    return response.data;
  },

  getBySlug: async (slug) => {
    const response = await api.get(`/companies/slug/${slug}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post("/companies", data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/companies/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/companies/${id}`);
    return response.data;
  },
};

export default companyService;
