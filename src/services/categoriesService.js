import api from "./api";

const categoryService = {
  // 🔐 cria categoria (painel)
  createCategory: async (companyId, data) => {
    const response = await api.post(
      `/companies/${companyId}/categories`,
      data
    );
    return response.data;
  },

  // 🔓 lista categorias (cardápio público)
  getCategories: async (companyId) => {
    const response = await api.get(
      `/categories/company/${companyId}`
    );
    return response.data;
  },

  // 🔓 categoria específica (cardápio)
  getCategoryById: async (companyId, id) => {
    const response = await api.get(
      `/categories/company/${companyId}/${id}`
    );
    return response.data;
  },

  // 🔐 painel
  updateCategory: async (id, data) => {
    const response = await api.put(`/categories/${id}`, data);
    return response.data;
  },

  deleteCategory: async (id) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  }
};

export default categoryService;
